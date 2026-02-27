from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from django.db import models
from punds.models import Pund, Membership
from .serializers import PundStructureSerializer, LoanRequestSerializer, LoanApproveSerializer
from .models import Payment, PundStructure, Loan, LoanInstallment


# ==========================
# 1️⃣ SET STRUCTURE (Versioned)
# ==========================
class SetStructureView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pund_id):

        pund = Pund.objects.filter(id=pund_id, is_active=True).first()
        if not pund:
            return Response({"error": "Pund not found or inactive"}, status=404)

        # Only OWNER
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

        today = timezone.now().date()
        next_effective_date = today + timedelta(days=7)

        # Check if future structure already exists
        existing_future = PundStructure.objects.filter(
            pund=pund,
            effective_from=next_effective_date
        ).first()

        if existing_future:
            existing_future.saving_amount = serializer.validated_data["saving_amount"]
            existing_future.loan_interest_percentage = serializer.validated_data["loan_interest_percentage"]
            existing_future.missed_saving_penalty = serializer.validated_data["missed_saving_penalty"]
            existing_future.missed_loan_penalty = serializer.validated_data["missed_loan_penalty"]
            existing_future.default_loan_cycles = serializer.validated_data["default_loan_cycles"]
            existing_future.save()

            return Response({"message": "Future structure updated successfully"})

        # Create new structure version
        PundStructure.objects.create(
            pund=pund,
            saving_amount=serializer.validated_data["saving_amount"],
            loan_interest_percentage=serializer.validated_data["loan_interest_percentage"],
            missed_saving_penalty=serializer.validated_data["missed_saving_penalty"],
            missed_loan_penalty=serializer.validated_data["missed_loan_penalty"],
            default_loan_cycles=serializer.validated_data["default_loan_cycles"],
            effective_from=next_effective_date,
        )

        return Response({"message": "Structure created successfully"})


# ==========================
# 2️⃣ GENERATE CYCLE
# ==========================
class GenerateCycleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pund_id):

        pund = Pund.objects.filter(id=pund_id, is_active=True).first()
        if not pund:
            return Response({"error": "Pund not found or inactive"}, status=404)

        # Only OWNER
        is_owner = Membership.objects.filter(
            user=request.user,
            pund=pund,
            role="OWNER",
            is_active=True
        ).exists()

        if not is_owner:
            return Response({"error": "Only owner can generate cycle"}, status=403)

        # Get last cycle
        last_payment = Payment.objects.filter(pund=pund).order_by("-cycle_number").first()

        next_cycle = 1 if not last_payment else last_payment.cycle_number + 1

        # Prevent duplicate cycle
        if Payment.objects.filter(pund=pund, cycle_number=next_cycle).exists():
            return Response({"error": "Cycle already generated"}, status=400)

        today = timezone.now().date()

        # Get correct structure for today
        structure = PundStructure.objects.filter(
            pund=pund,
            effective_from__lte=today
        ).order_by("-effective_from").first()

        if not structure:
            return Response({"error": "Structure not set"}, status=400)

        # Apply saving penalty to previous cycle unpaid
        if last_payment:
            unpaid_payments = Payment.objects.filter(
                pund=pund,
                cycle_number=last_payment.cycle_number,
                is_paid=False
            )

            for p in unpaid_payments:
                if p.penalty_amount == 0:
                    p.penalty_amount = structure.missed_saving_penalty
                    p.save()

        # Determine cycle length
        if pund.pund_type == "WEEKLY":
            delta = 7
        elif pund.pund_type == "MONTHLY":
            delta = 30
        elif pund.pund_type == "DAILY":
            delta = 1
        else:
            delta = 7

        due_date = today + timedelta(days=delta)

        # Create payments
        members = Membership.objects.filter(
            pund=pund,
            role="MEMBER",
            is_active=True
        )

        for member in members:
            Payment.objects.create(
                pund=pund,
                member=member.user,
                cycle_number=next_cycle,
                amount=structure.saving_amount,
                due_date=due_date
            )

        return Response({
            "message": f"Cycle {next_cycle} generated successfully"
        })


# ==========================
# 3️⃣ MARK PAYMENT PAID
# ==========================
class MarkPaymentPaidView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, payment_id):

        payment = Payment.objects.filter(id=payment_id).first()
        if not payment:
            return Response({"error": "Payment not found"}, status=404)

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
    

# ==========================
# REQUEST LOAN (MEMBER)
# ==========================
class RequestLoanView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pund_id):

        pund = Pund.objects.filter(id=pund_id, is_active=True).first()
        if not pund:
            return Response({"error": "Pund not found"}, status=404)

        # Must be member
        membership = Membership.objects.filter(
            user=request.user,
            pund=pund,
            role="MEMBER",
            is_active=True
        ).exists()

        if not membership:
            return Response({"error": "Only member can request loan"}, status=403)

        # Only one active loan rule
        active_loan = Loan.objects.filter(
            pund=pund,
            member=request.user,
            is_active=True
        ).exists()

        if active_loan:
            return Response({"error": "Active loan already exists"}, status=400)

        serializer = LoanRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        Loan.objects.create(
            pund=pund,
            member=request.user,
            principal_amount=serializer.validated_data["principal_amount"],
            interest_percentage=0,
            total_payable=0,
            total_cycles=0,
            remaining_amount=0,
        )

        return Response({"message": "Loan request submitted"})
# ==========================
# APPROVE LOAN (OWNER)
# ==========================
class ApproveLoanView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, loan_id):

        loan = Loan.objects.filter(id=loan_id, status="PENDING").first()
        if not loan:
            return Response({"error": "Loan not found"}, status=404)

        pund = loan.pund

        # Only owner can approve
        is_owner = Membership.objects.filter(
            user=request.user,
            pund=pund,
            role="OWNER",
            is_active=True
        ).exists()

        if not is_owner:
            return Response({"error": "Only owner can approve"}, status=403)

        serializer = LoanApproveSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        today = timezone.now().date()

        structure = PundStructure.objects.filter(
            pund=pund,
            effective_from__lte=today
        ).order_by("-effective_from").first()

        if not structure:
            return Response({"error": "Structure not found"}, status=400)

        # Fund Check
        total_collected = Payment.objects.filter(
            pund=pund,
            is_paid=True
        ).aggregate(total=models.Sum("amount"))["total"] or Decimal("0")

        total_active_loans = Loan.objects.filter(
            pund=pund,
            is_active=True
        ).aggregate(total=models.Sum("remaining_amount"))["total"] or Decimal("0")

        available_fund = total_collected - total_active_loans

        if loan.principal_amount > available_fund:
            return Response({"error": "Insufficient fund in pund"}, status=400)

        # Determine cycles
        cycles = serializer.validated_data.get(
            "cycles",
            structure.default_loan_cycles
        )

        interest = (loan.principal_amount * structure.loan_interest_percentage) / 100
        total_payable = loan.principal_amount + interest
        emi = total_payable / cycles

        # Update loan
        loan.interest_percentage = structure.loan_interest_percentage
        loan.total_payable = total_payable
        loan.total_cycles = cycles
        loan.remaining_amount = total_payable
        loan.status = "APPROVED"
        loan.is_active = True
        loan.approved_by = request.user
        loan.approved_at = timezone.now()
        loan.save()

        # Generate installments (start next cycle)
        delta = 7 if pund.pund_type == "WEEKLY" else 30
        start_date = today + timedelta(days=delta)

        for i in range(1, cycles + 1):
            LoanInstallment.objects.create(
                loan=loan,
                cycle_number=i,
                emi_amount=emi,
                due_date=start_date + timedelta(days=(i - 1) * delta)
            )

        return Response({"message": "Loan approved successfully"})