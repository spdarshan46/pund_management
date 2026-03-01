from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.contrib.auth import get_user_model

from users.services import send_invite_email
from finance.models import FinanceAuditLog, PundStructure, Payment
from finance.serializers import PaymentSerializer
from .models import Pund, Membership
from .serializers import *

User = get_user_model()


# 1️⃣ Create Pund
class CreatePundView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreatePundSerializer(data=request.data)

        if serializer.is_valid():
            pund = serializer.save(created_by=request.user)

            Membership.objects.create(
                user=request.user,
                pund=pund,
                role="OWNER",
                is_active=True
            )

            return Response({"message": "Pund created successfully"}, status=201)

        return Response(serializer.errors, status=400)


# 2️⃣ Add Member
class AddMemberView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pund_id):
        pund = Pund.objects.filter(id=pund_id, is_active=True).first()
        if not pund:
            return Response({"error": "Pund not found or inactive"}, status=404)

        owner_membership = Membership.objects.filter(
            user=request.user,
            pund=pund,
            role="OWNER",
            is_active=True
        ).exists()

        if not owner_membership:
            return Response({"error": "Only owner can add members"}, status=403)

        serializer = AddMemberSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        email = serializer.validated_data["email"]

        user, created = User.objects.get_or_create(email=email)

        if created or not user.name:
            user.name = serializer.validated_data["name"]

        if created or not user.mobile:
            user.mobile = serializer.validated_data["mobile"]

        if created:
            user.is_active = False

        user.save()

        if Membership.objects.filter(user=user, pund=pund).exists():
            return Response({"error": "User already member"}, status=400)

        Membership.objects.create(
            user=user,
            pund=pund,
            role="MEMBER",
            is_active=True
        )

        if not user.is_active:
            send_invite_email(user, pund.name)

        return Response({"message": "Member added successfully"}, status=201)


# 3️⃣ List All My Punds (Active + Inactive)
class MyAllPundsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        memberships = Membership.objects.filter(user=request.user)

        data = []
        for m in memberships:
            data.append({
                "pund_id": m.pund.id,
                "pund_name": m.pund.name,
                "pund_type": m.pund.pund_type,
                "pund_active": m.pund.is_active,
                "membership_active": m.is_active,
                "role": m.role,
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
    
# 6️⃣ # 6 Pund Detail (Role-Based, Active + Inactive View Allowed)

class PundDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pund_id):

        pund = Pund.objects.filter(id=pund_id).first()
        if not pund:
            return Response({"error": "Pund not found"}, status=404)

        membership = Membership.objects.filter(
            user_id=request.user.id,
            pund_id=pund.id
        ).first()

        if not membership:
            return Response({"error": "Not a member"}, status=403)

        structure = PundStructure.objects.filter(
            pund_id=pund.id
        ).order_by("-effective_from").first()

        structure_data = None
        if structure:
            structure_data = {
                "saving_amount": structure.saving_amount,
                "loan_interest_percentage": structure.loan_interest_percentage,
                "effective_from": structure.effective_from,
                "missed_saving_penalty": structure.missed_saving_penalty,
                "missed_loan_penalty": structure.missed_loan_penalty,
            }

        # OWNER VIEW
        if membership.role == "OWNER":

            members = Membership.objects.filter(pund_id=pund.id)

            member_list = [
                {
                    "email": m.user.email,
                    "name": m.user.name,
                    "role": m.role,
                    "membership_active": m.is_active,
                }
                for m in members
            ]

            return Response({
                "role": "OWNER",
                "pund_id": pund.id,
                "pund_name": pund.name,
                "pund_type": pund.pund_type,
                "pund_active": pund.is_active,
                "structure": structure_data,
                "total_members": members.count(),
                "members": member_list,
            })

        # MEMBER VIEW
        payments = Payment.objects.filter(
            pund_id=pund.id,
            member_id=request.user.id
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
            "my_payments": serializer.data,
        })
