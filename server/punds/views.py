import email
from enum import member

from django.db import transaction, IntegrityError
from django.contrib.auth import get_user_model
from finance.models import Loan
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from punds.models import Pund, Membership
from finance.models import FinanceAuditLog, PundStructure, Payment
from finance.serializers import PaymentSerializer
from users.services import send_invite_email
from .serializers import AddMemberSerializer, CreatePundSerializer
from users.services import send_otp_email

User = get_user_model()


# 1️⃣ Create Pund
class CreatePundView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreatePundSerializer(data=request.data)

        if serializer.is_valid():
            pund = serializer.save(
                is_active=True,
                created_by=request.user   # 🔥 THIS IS REQUIRED
            )

            Membership.objects.create(
                user=request.user,
                pund=pund,
                role="OWNER",
                is_active=True
            )

            return Response({
                "pund_id": pund.id,
                "pund_name": pund.name,
                "pund_type": pund.pund_type,
                "pund_active": pund.is_active,
                "role": "OWNER"
            }, status=201)

        return Response(serializer.errors, status=400)

# 2️⃣ Add Member
class AddMemberView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, pund_id):

        # 1️⃣ Check Pund
        pund = Pund.objects.filter(id=pund_id, is_active=True).first()
        if not pund:
            return Response({"error": "Pund not found or inactive"}, status=404)

        # 2️⃣ Check Owner Permission
        is_owner = Membership.objects.filter(
            user=request.user,
            pund=pund,
            role="OWNER",
            is_active=True
        ).exists()

        if not is_owner:
            return Response({"error": "Only owner can add members"}, status=403)

        # 3️⃣ Validate Data
        serializer = AddMemberSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        # 4️⃣ Normalize Email
        email = serializer.validated_data["email"].lower().strip()

        # 5️⃣ Get or Create User
        user, created = User.objects.get_or_create(email=email)

        if created:
            user.name = serializer.validated_data["name"]
            user.mobile = serializer.validated_data["mobile"]
            user.is_active = False  # Inactive until they register
            user.save()
        else:
            # Update missing details only
            if not user.name:
                user.name = serializer.validated_data["name"]
            if not user.mobile:
                user.mobile = serializer.validated_data["mobile"]
            user.save()

        # 6️⃣ Check Existing Membership
        membership = Membership.objects.filter(user=user, pund=pund).first()

        if membership:
            if membership.is_active:
                return Response({"error": "User already member"}, status=400)
            else:
                membership.is_active = True
                membership.save()
                return Response({"message": "Member reactivated"}, status=200)

        # 7️⃣ Create Membership
        try:
            Membership.objects.create(
                user=user,
                pund=pund,
                role="MEMBER",
                is_active=True
            )
        except IntegrityError:
            return Response({"error": "Membership already exists"}, status=400)

        # 8️⃣ Send Invite Email if New User
        if created:
            send_invite_email(user, pund.name)

        return Response({"message": "Member added successfully"}, status=201)
    
# 3️⃣ List All My Punds (Active + Inactive)
class MyAllPundsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        memberships = (
            Membership.objects
            .filter(user=request.user, is_active=True)
            .select_related("pund")
        )

        data = []

        for m in memberships:
            member_count = (
                Membership.objects
                .filter(
                    pund=m.pund,
                    is_active=True,
                    role="MEMBER"   # ✅ only real members
                )
                .count()
            )

            data.append({
                "pund_id": m.pund.id,
                "pund_name": m.pund.name,
                "pund_type": m.pund.pund_type,
                "pund_active": m.pund.is_active,
                "membership_active": m.is_active,
                "role": m.role,
                "member_count": member_count,   # 🔥 IMPORTANT
            })

        return Response(data)
    
# 4️⃣ Close Pund
class ClosePundView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pund_id):
        pund = Pund.objects.filter(id=pund_id).first()
        if not pund:
            return Response({"error": "Pund not found"}, status=404)

        is_owner = Membership.objects.filter(
            user=request.user,
            pund=pund,
            role="OWNER",
            is_active=True
        ).exists()

        if not is_owner:
            return Response({"error": "Only owner can close pund"}, status=403)

        pund.is_active = False
        pund.save()
        FinanceAuditLog.objects.create(
            pund=pund,
            user=request.user,
            action="Pund Closed",
            description=f"Pund {pund.name} closed"
    )

        Membership.objects.filter(pund=pund).update(is_active=False)

        return Response({"message": "Pund closed successfully"})

# 5️⃣ Reopen Pund
class ReopenPundView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pund_id):

        pund = Pund.objects.filter(id=pund_id).first()
        if not pund:
            return Response({"error": "Pund not found"}, status=404)

        is_owner = Membership.objects.filter(
            user=request.user,
            pund=pund,
            role="OWNER"
        ).exists()

        if not is_owner:
            return Response({"error": "Only owner can reopen"}, status=403)

        pund.is_active = True
        pund.save()

        Membership.objects.filter(pund=pund).update(is_active=True)

        return Response({"message": "Pund reopened successfully"})
    
# 6️⃣ Pund Detail (Role-Based, Active + Inactive View Allowed)
class PundDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pund_id):

        pund = Pund.objects.filter(id=pund_id).first()
        if not pund:
            return Response({"error": "Pund not found"}, status=404)

        membership = Membership.objects.filter(
            user=request.user,
            pund=pund,
            is_active=True
        ).first()

        if not membership:
            return Response({"error": "Not an active member"}, status=403)

        # Latest Structure
        structure = (
            PundStructure.objects
            .filter(pund=pund)
            .order_by("-effective_from")
            .first()
        )

        structure_data = None
        if structure:
            structure_data = {
                "saving_amount": structure.saving_amount,
                "loan_interest_percentage": structure.loan_interest_percentage,
                "effective_from": structure.effective_from,
                "missed_saving_penalty": structure.missed_saving_penalty,
                "missed_loan_penalty": structure.missed_loan_penalty,
            }

        # ✅ Only real members (exclude OWNER)
        member_count = Membership.objects.filter(
            pund=pund,
            is_active=True,
            role="MEMBER"
        ).count()

        # ================= OWNER VIEW =================
        if membership.role == "OWNER":

            memberships = (
                Membership.objects
                .filter(pund=pund, is_active=True)
                .select_related("user")
            )

            member_list = [
                {
                    "id": m.user.id,
                    "membership_id": m.id,
                    "email": m.user.email,
                    "name": m.user.name,
                    "mobile": m.user.mobile,
                    "role": m.role,
                    "membership_active": m.is_active,
                    "joined_at": getattr(m, "created_at", None),
                }
                for m in memberships
            ]

            return Response({
                "role": "OWNER",
                "pund_id": pund.id,
                "pund_name": pund.name,
                "pund_type": pund.pund_type,
                "pund_active": pund.is_active,
                "structure": structure_data,
                "member_count": member_count,   
                "members": member_list,
            })

        # ================= MEMBER VIEW =================
        payments = Payment.objects.filter(
            pund=pund,
            member=request.user
        )

        serializer = PaymentSerializer(payments, many=True)

        return Response({
            "role": "MEMBER",
            "pund_id": pund.id,
            "pund_name": pund.name,
            "pund_type": pund.pund_type,
            "pund_active": pund.is_active,
            "structure": structure_data,
            "membership_active": membership.is_active,
            "member_count": member_count,  
            "my_payments": serializer.data,
        })

# 7️⃣ inactive Member (Soft Remove with Loan Check)
class RemoveMemberView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, pund_id, member_id):

        pund = Pund.objects.filter(id=pund_id, is_active=True).first()
        if not pund:
            return Response(
                {"error": "Pund not found or inactive"},
                status=status.HTTP_404_NOT_FOUND
            )

        is_owner = Membership.objects.filter(
            user=request.user,
            pund=pund,
            role="OWNER",
            is_active=True
        ).exists()

        if not is_owner:
            return Response(
                {"error": "Only owner can remove members"},
                status=status.HTTP_403_FORBIDDEN
            )

        membership = Membership.objects.filter(
            user_id=member_id,
            pund=pund,
            is_active=True
        ).first()

        if not membership:
            return Response(
                {"error": "Active membership not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        if membership.role == "OWNER":
            return Response(
                {"error": "Owner cannot be removed"},
                status=status.HTTP_400_BAD_REQUEST
            )

        active_loan_exists = Loan.objects.filter(
            member_id=member_id,
            pund=pund,
            is_active=True
        ).exists()

        if active_loan_exists:
            return Response(
                {"error": "Member has active loan. Clear loan before removal."},
                status=status.HTTP_400_BAD_REQUEST
            )

        membership.is_active = False
        membership.save()

        return Response(
            {"message": "Member removed successfully"},
            status=status.HTTP_200_OK
        )

# 8️⃣ Reactivate Member (Reverse of Remove)
class ReactivateMemberView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, pund_id, member_id):

        pund = Pund.objects.filter(id=pund_id).first()
        if not pund:
            return Response({"error": "Pund not found"}, status=404)

        # Check owner
        is_owner = Membership.objects.filter(
            user=request.user,
            pund=pund,
            role="OWNER",
            is_active=True
        ).exists()

        if not is_owner:
            return Response({"error": "Only owner can reactivate members"}, status=403)

        membership = Membership.objects.filter(
            pund=pund,
            user_id=member_id,
            is_active=False
        ).first()

        if not membership:
            return Response({"error": "Inactive membership not found"}, status=404)

        membership.is_active = True
        membership.save()

        return Response({"message": "Member reactivated successfully"})

# 9️⃣ Owner Edit Member Details (Name, Mobile, Email Correction)
class OwnerEditMemberView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def patch(self, request, pund_id, user_id):

        # 1️⃣ Check Pund Exists
        pund = Pund.objects.filter(id=pund_id, is_active=True).first()
        if not pund:
            return Response({"error": "Pund not found"}, status=404)

        # 2️⃣ Check Owner Permission
        is_owner = Membership.objects.filter(
            user=request.user,
            pund=pund,
            role="OWNER",
            is_active=True
        ).exists()

        if not is_owner:
            return Response(
                {"error": "Only owner can edit member"},
                status=status.HTTP_403_FORBIDDEN
            )

        # 3️⃣ Check Member Exists in This Pund
        membership = Membership.objects.filter(
            pund=pund,
            user_id=user_id,
            is_active=True
        ).first()

        if not membership:
            return Response({"error": "Member not found in this pund"}, status=404)

        member = membership.user

        name = request.data.get("name")
        mobile = request.data.get("mobile")
        email = request.data.get("email")

        # 4️⃣ Update Name
        if name:
            member.name = name

        # 5️⃣ Update Mobile
        if mobile:
            if User.objects.filter(mobile=mobile).exclude(id=member.id).exists():
                return Response({"error": "Mobile already in use"}, status=400)
            member.mobile = mobile

        # 6️⃣ Email Change → Requires Verification
        if email and email != member.email:

            # Case 1: Email NOT verified → Owner can fix directly
            if not member.email_verified:

                if User.objects.filter(email=email).exists():
                    return Response({"error": "Email already in use"}, status=400)

                member.email = email
                member.save()

                return Response({
                    "message": "Email corrected successfully"
                })

            # Case 2: Email already verified → Block
            else:
                return Response({
                    "error": "Cannot edit email. Verified members must change email themselves."
                }, status=400)
            
        member.save()

        return Response({"message": "Member updated successfully"})
