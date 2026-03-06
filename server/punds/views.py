from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from finance.models import FinanceAuditLog, Loan, Payment, PundStructure
from finance.serializers import PaymentSerializer
from users.services import send_invite_email
from .models import Membership, Pund
from .serializers import AddMemberSerializer, CreatePundSerializer

User = get_user_model()


# ─── helpers ────────────────────────────────────────────────

def _get_pund(pund_id, active_only=False):
    qs = Pund.objects.filter(id=pund_id)
    if active_only:
        qs = qs.filter(is_active=True)
    return qs.first()


def _is_owner(user, pund):
    return Membership.objects.filter(
        user=user, pund=pund, role="OWNER", is_active=True
    ).exists()


def _member_count(pund):
    return Membership.objects.filter(pund=pund, role="MEMBER", is_active=True).count()


def _structure_data(pund):
    structure = PundStructure.objects.filter(pund=pund).order_by("-effective_from").first()
    if not structure:
        return None
    return {
        "saving_amount":            structure.saving_amount,
        "loan_interest_percentage": structure.loan_interest_percentage,
        "effective_from":           structure.effective_from,
        "missed_saving_penalty":    structure.missed_saving_penalty,
        "missed_loan_penalty":      structure.missed_loan_penalty,
        "default_loan_cycles":      structure.default_loan_cycles,
    }


# ─── Views ──────────────────────────────────────────────────

class CreatePundView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreatePundSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        pund = serializer.save(is_active=True, created_by=request.user)
        Membership.objects.create(user=request.user, pund=pund, role="OWNER", is_active=True)

        return Response({
            "pund_id":     pund.id,
            "pund_name":   pund.name,
            "pund_type":   pund.pund_type,
            "pund_active": pund.is_active,
            "role":        "OWNER",
        }, status=201)


class AddMemberView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, pund_id):
        pund = _get_pund(pund_id, active_only=True)
        if not pund:
            return Response({"error": "Pund not found or inactive"}, status=404)
        if not _is_owner(request.user, pund):
            return Response({"error": "Only owner can add members"}, status=403)

        serializer = AddMemberSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        email  = serializer.validated_data["email"].lower().strip()
        name   = serializer.validated_data["name"]
        mobile = serializer.validated_data["mobile"]

        user, created = User.objects.get_or_create(email=email)
        if created:
            user.name      = name
            user.mobile    = mobile
            user.is_active = False
            user.save()
        else:
            updated = False
            if not user.name:   user.name   = name;   updated = True
            if not user.mobile: user.mobile = mobile; updated = True
            if updated: user.save()

        # Handle existing membership
        membership = Membership.objects.filter(user=user, pund=pund).first()
        if membership:
            if membership.is_active:
                return Response({"error": "User already member"}, status=400)
            membership.is_active = True
            membership.save()
            return Response({"message": "Member reactivated"}, status=200)

        try:
            Membership.objects.create(user=user, pund=pund, role="MEMBER", is_active=True)
        except IntegrityError:
            return Response({"error": "Membership already exists"}, status=400)

        if created:
            send_invite_email(user, pund.name)

        return Response({"message": "Member added successfully"}, status=201)


class MyAllPundsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        memberships = Membership.objects.filter(user=request.user).select_related("pund")
        return Response([{
            "pund_id":           m.pund.id,
            "pund_name":         m.pund.name,
            "pund_type":         m.pund.pund_type,
            "pund_active":       m.pund.is_active,
            "membership_active": m.is_active,
            "role":              m.role,
            "member_count":      _member_count(m.pund),
        } for m in memberships])


class ClosePundView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pund_id):
        pund = _get_pund(pund_id)
        if not pund:
            return Response({"error": "Pund not found"}, status=404)
        if not _is_owner(request.user, pund):
            return Response({"error": "Only owner can close pund"}, status=403)

        pund.is_active = False
        pund.save()

        FinanceAuditLog.objects.create(
            pund=pund, user=request.user,
            action="Pund Closed",
            description=f"Pund {pund.name} closed",
        )
        Membership.objects.filter(pund=pund).update(is_active=False)

        return Response({"message": "Pund closed successfully"})


class ReopenPundView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pund_id):
        pund = _get_pund(pund_id)
        if not pund:
            return Response({"error": "Pund not found"}, status=404)
        if not _is_owner(request.user, pund):
            return Response({"error": "Only owner can reopen"}, status=403)

        pund.is_active = True
        pund.save()
        Membership.objects.filter(pund=pund).update(is_active=True)

        return Response({"message": "Pund reopened successfully"})


class PundDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pund_id):
        pund = _get_pund(pund_id)
        if not pund:
            return Response({"error": "Pund not found"}, status=404)

        membership = Membership.objects.filter(user=request.user, pund=pund).first()
        if not membership:
            return Response({"error": "Not an active member"}, status=403)

        base = {
            "pund_id":      pund.id,
            "pund_name":    pund.name,
            "pund_type":    pund.pund_type,
            "pund_active":  pund.is_active,
            "structure":    _structure_data(pund),
            "member_count": _member_count(pund),
        }

        if membership.role == "OWNER":
            member_list = [{
                "id":                m.user.id,
                "membership_id":     m.id,
                "email":             m.user.email,
                "name":              m.user.name,
                "mobile":            m.user.mobile,
                "role":              m.role,
                "membership_active": m.is_active,
                "joined_at":         getattr(m, "created_at", None),
            } for m in Membership.objects.filter(pund=pund).select_related("user")]

            return Response({"role": "OWNER", "members": member_list, **base})

        # Member view
        payments   = Payment.objects.filter(pund=pund, member=request.user)
        serializer = PaymentSerializer(payments, many=True)
        return Response({
            "role":               "MEMBER",
            "membership_active":  membership.is_active,
            "my_payments":        serializer.data,
            **base,
        })


class RemoveMemberView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, pund_id, member_id):
        pund = _get_pund(pund_id, active_only=True)
        if not pund:
            return Response({"error": "Pund not found or inactive"}, status=status.HTTP_404_NOT_FOUND)
        if not _is_owner(request.user, pund):
            return Response({"error": "Only owner can remove members"}, status=status.HTTP_403_FORBIDDEN)

        membership = Membership.objects.filter(user_id=member_id, pund=pund, is_active=True).first()
        if not membership:
            return Response({"error": "Active membership not found"}, status=status.HTTP_404_NOT_FOUND)
        if membership.role == "OWNER":
            return Response({"error": "Owner cannot be removed"}, status=status.HTTP_400_BAD_REQUEST)

        if Loan.objects.filter(member_id=member_id, pund=pund, is_active=True).exists():
            return Response(
                {"error": "Member has active loan. Clear loan before removal."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        membership.is_active = False
        membership.save()
        return Response({"message": "Member removed successfully"})


class ReactivateMemberView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, pund_id, member_id):
        pund = _get_pund(pund_id)
        if not pund:
            return Response({"error": "Pund not found"}, status=404)
        if not _is_owner(request.user, pund):
            return Response({"error": "Only owner can reactivate members"}, status=403)

        membership = Membership.objects.filter(pund=pund, user_id=member_id, is_active=False).first()
        if not membership:
            return Response({"error": "Inactive membership not found"}, status=404)

        membership.is_active = True
        membership.save()
        return Response({"message": "Member reactivated successfully"})


class OwnerEditMemberView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def patch(self, request, pund_id, user_id):
        pund = _get_pund(pund_id, active_only=True)
        if not pund:
            return Response({"error": "Pund not found"}, status=404)
        if not _is_owner(request.user, pund):
            return Response({"error": "Only owner can edit member"}, status=status.HTTP_403_FORBIDDEN)

        membership = Membership.objects.filter(pund=pund, user_id=user_id, is_active=True).first()
        if not membership:
            return Response({"error": "Member not found in this pund"}, status=404)

        member = membership.user
        name   = request.data.get("name")
        mobile = request.data.get("mobile")
        email  = request.data.get("email")

        if name:
            member.name = name

        if mobile:
            if User.objects.filter(mobile=mobile).exclude(id=member.id).exists():
                return Response({"error": "Mobile already in use"}, status=400)
            member.mobile = mobile

        if email and email != member.email:
            if not member.email_verified:
                if User.objects.filter(email=email).exists():
                    return Response({"error": "Email already in use"}, status=400)
                member.email = email
                member.save()
                return Response({"message": "Email corrected successfully"})
            return Response(
                {"error": "Cannot edit email. Verified members must change email themselves."},
                status=400,
            )

        member.save()
        return Response({"message": "Member updated successfully"})