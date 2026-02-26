from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from punds.models import Pund, Membership
from .serializers import PundStructureSerializer
from .models import Payment, PundStructure



class SetStructureView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pund_id):

        pund = Pund.objects.filter(id=pund_id, is_active=True).first()
        if not pund:
            return Response({"error": "Pund not found or inactive"}, status=404)

        # Only OWNER can set structure
        is_owner = Membership.objects.filter(
            user=request.user,
            pund=pund,
            role="OWNER",
            is_active=True
        ).exists()

        if not is_owner:
            return Response({"error": "Only owner can set structure"}, status=403)

        serializer = PundStructureSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        next_week = timezone.now().date() + timedelta(days=7)

        # 🔥 Check if future structure already exists
        existing_future = PundStructure.objects.filter(
            pund=pund,
            effective_from=next_week
        ).first()

        if existing_future:
            # Update existing future structure
            existing_future.saving_amount = serializer.validated_data["saving_amount"]
            existing_future.loan_interest_percentage = serializer.validated_data["loan_interest_percentage"]
            existing_future.missed_week_penalty = serializer.validated_data["missed_week_penalty"]
            existing_future.save()

            return Response({"message": "Future structure updated successfully"})

        # Create new future structure
        PundStructure.objects.create(
            pund=pund,
            saving_amount=serializer.validated_data["saving_amount"],
            loan_interest_percentage=serializer.validated_data["loan_interest_percentage"],
            missed_week_penalty=serializer.validated_data["missed_week_penalty"],
            effective_from=next_week,
        )

        return Response({"message": "Structure created successfully"})
    

class GenerateWeekView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pund_id):

        pund = Pund.objects.filter(id=pund_id, is_active=True).first()
        if not pund:
            return Response({"error": "Pund not found or inactive"}, status=404)

        # Only OWNER can generate
        is_owner = Membership.objects.filter(
            user=request.user,
            pund=pund,
            role="OWNER",
            is_active=True
        ).exists()

        if not is_owner:
            return Response({"error": "Only owner can generate week"}, status=403)

        # Get latest week number
        last_payment = Payment.objects.filter(pund=pund).order_by("-week_number").first()
        next_week = 1 if not last_payment else last_payment.week_number + 1

        # Get latest structure
        structure = PundStructure.objects.filter(
            pund=pund
        ).order_by("-effective_from").first()

        if not structure:
            return Response({"error": "Structure not set"}, status=400)

        # Apply penalty to previous unpaid payments
        if last_payment:
            unpaid_payments = Payment.objects.filter(
                pund=pund,
                week_number=last_payment.week_number,
                is_paid=False
            )

            for p in unpaid_payments:
                p.penalty_amount = structure.missed_week_penalty
                p.save()

        # Create payments for all active members
        members = Membership.objects.filter(
            pund=pund,
            role="MEMBER",
            is_active=True
        )

        for member in members:
            Payment.objects.create(
                pund=pund,
                member=member.user,
                week_number=next_week,
                amount=structure.saving_amount,
            )

        return Response({
            "message": f"Week {next_week} generated successfully"
        })
    
class MarkPaymentPaidView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, payment_id):

        payment = Payment.objects.filter(id=payment_id).first()
        if not payment:
            return Response({"error": "Payment not found"}, status=404)

        # Only OWNER can mark paid
        is_owner = Membership.objects.filter(
            user=request.user,
            pund=payment.pund,
            role="OWNER",
            is_active=True
        ).exists()

        if not is_owner:
            return Response({"error": "Only owner can mark payment"}, status=403)

        payment.is_paid = True
        payment.paid_at = timezone.now()
        payment.save()

        return Response({"message": "Payment marked as paid"})
    
    