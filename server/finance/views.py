from decimal import Decimal
from datetime import timedelta

from django.db import models, transaction
from django.utils import timezone

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from punds.models import Membership, Pund
from .models import FinanceAuditLog, Loan, LoanInstallment, Payment, PundStructure
from .serializers import LoanApproveSerializer, LoanRequestSerializer, PundStructureSerializer


# ─── helpers ────────────────────────────────────────────────

def _get_pund(pund_id, active_only=True):
    qs = Pund.objects.filter(id=pund_id)
    if active_only:
        qs = qs.filter(is_active=True)
    return qs.first()


def _is_owner(user, pund):
    return Membership.objects.filter(
        user=user, pund=pund, role="OWNER", is_active=True
    ).exists()


def _get_membership(user, pund):
    return Membership.objects.filter(user=user, pund=pund, is_active=True).first()


def _loan_installment_summary(installments):
    """Return (total_emi_paid, total_penalty_paid) for a queryset of installments."""
    paid = installments.filter(is_paid=True)
    emi_paid     = paid.aggregate(v=models.Sum("emi_amount"))["v"]     or Decimal("0")
    penalty_paid = paid.aggregate(v=models.Sum("penalty_amount"))["v"] or Decimal("0")
    return emi_paid, penalty_paid


def apply_loan_penalty(loan):
    """Apply missed-loan penalty to overdue unpaid installments (idempotent)."""
    today = timezone.now().date()
    structure = PundStructure.objects.filter(
        pund=loan.pund, effective_from__lte=today
    ).order_by("-effective_from").first()

    if not structure:
        return

    overdue = LoanInstallment.objects.filter(
        loan=loan, is_paid=False, due_date__lt=today, penalty_amount=0
    )
    for inst in overdue:
        inst.penalty_amount = structure.missed_loan_penalty
        inst.save()


# ─── Structure ──────────────────────────────────────────────

class SetStructureView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pund_id):
        pund = _get_pund(pund_id)
        if not pund:
            return Response({"error": "Pund not found or inactive"}, status=404)
        if not _is_owner(request.user, pund):
            return Response({"error": "Only owner can set structure"}, status=403)

        serializer = PundStructureSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        effective_from = serializer.validated_data.get("effective_from") or \
                         timezone.now().date() + timedelta(days=7)

        PundStructure.objects.create(
            pund=pund,
            effective_from=effective_from,
            **{k: serializer.validated_data[k] for k in [
                "saving_amount", "loan_interest_percentage",
                "missed_saving_penalty", "missed_loan_penalty", "default_loan_cycles",
            ]}
        )
        return Response({"message": "Structure saved successfully"})


# ─── Cycle ──────────────────────────────────────────────────

class GenerateCycleView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, pund_id):
        pund = _get_pund(pund_id)
        if not pund:
            return Response({"error": "Pund not found or inactive"}, status=status.HTTP_404_NOT_FOUND)
        if not _is_owner(request.user, pund):
            return Response({"error": "Only owner can generate cycle"}, status=status.HTTP_403_FORBIDDEN)

        structure = PundStructure.objects.filter(pund=pund).order_by("-effective_from").first()
        if not structure:
            return Response({"error": "Structure not set"}, status=status.HTTP_400_BAD_REQUEST)

        last_payment = Payment.objects.filter(pund=pund).order_by("-cycle_number").first()
        next_cycle   = 1 if not last_payment else last_payment.cycle_number + 1

        if Payment.objects.filter(pund=pund, cycle_number=next_cycle).exists():
            return Response({"error": "Cycle already generated"}, status=status.HTTP_400_BAD_REQUEST)

        # Apply penalty to previous cycle unpaid payments
        if last_payment:
            Payment.objects.filter(
                pund=pund, cycle_number=last_payment.cycle_number, is_paid=False, penalty_amount=0
            ).update(penalty_amount=structure.missed_saving_penalty)

        # Calculate due date
        base = structure.effective_from
        if pund.pund_type == "DAILY":
            due_date = base + timedelta(days=next_cycle)
        elif pund.pund_type == "MONTHLY":
            from dateutil.relativedelta import relativedelta
            due_date = base + relativedelta(months=next_cycle)
        else:  # WEEKLY (default)
            due_date = base + timedelta(weeks=next_cycle)

        members = Membership.objects.filter(pund=pund, role="MEMBER", is_active=True)
        if not members.exists():
            return Response({"error": "No active members in this pund"}, status=status.HTTP_400_BAD_REQUEST)

        Payment.objects.bulk_create([
            Payment(
                pund=pund,
                member=m.user,
                cycle_number=next_cycle,
                amount=structure.saving_amount,
                due_date=due_date,
                penalty_amount=0,
                is_paid=False,
            )
            for m in members
        ])

        return Response({
            "message":      f"Cycle {next_cycle} generated successfully",
            "cycle_number": next_cycle,
            "due_date":     due_date,
        }, status=status.HTTP_201_CREATED)


# ─── Payments ───────────────────────────────────────────────

class MarkPaymentPaidView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, payment_id):
        payment = Payment.objects.filter(id=payment_id).first()
        if not payment:
            return Response({"error": "Payment not found"}, status=404)
        if not payment.pund.is_active:
            return Response({"error": "Pund is closed"}, status=400)
        if payment.is_paid:
            return Response({"error": "Payment already marked as paid"}, status=400)
        if not _is_owner(request.user, payment.pund):
            return Response({"error": "Only owner can mark payment"}, status=403)

        payment.is_paid  = True
        payment.paid_at  = timezone.now()
        payment.save()

        FinanceAuditLog.objects.create(
            pund=payment.pund, user=request.user,
            action="Saving Paid",
            description=f"Saving payment {payment.id} marked paid",
        )
        return Response({"message": "Payment marked as paid"})


class CyclePaymentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pund_id):
        pund = _get_pund(pund_id, active_only=False)
        if not pund:
            return Response({"error": "Pund not found"}, status=404)
        if not _get_membership(request.user, pund):
            return Response({"error": "Not authorized"}, status=403)

        cycle_numbers = (
            Payment.objects.filter(pund=pund)
            .values_list("cycle_number", flat=True)
            .distinct()
            .order_by("cycle_number")
        )

        cycles_data = []
        for cycle_num in cycle_numbers:
            cycle_payments = Payment.objects.filter(pund=pund, cycle_number=cycle_num)

            total_expected = cycle_payments.aggregate(v=models.Sum("amount"))["v"] or Decimal("0")

            paid_agg = cycle_payments.filter(is_paid=True).aggregate(
                total_amount=models.Sum("amount"),
                total_penalty=models.Sum("penalty_amount"),
            )
            total_collected = (paid_agg["total_amount"] or Decimal("0")) + \
                              (paid_agg["total_penalty"] or Decimal("0"))
            total_penalties = cycle_payments.aggregate(v=models.Sum("penalty_amount"))["v"] or Decimal("0")

            paid_count  = cycle_payments.filter(is_paid=True).count()
            total_count = cycle_payments.count()
            first       = cycle_payments.order_by("due_date").first()

            cycles_data.append({
                "cycle_number":    cycle_num,
                "total_expected":  str(total_expected),
                "total_collected": str(total_collected),
                "total_penalties": str(total_penalties),
                "paid_count":      paid_count,
                "total_count":     total_count,
                "progress":        round(paid_count / total_count * 100, 2) if total_count else 0,
                "due_date":        first.due_date if first else None,
                "payments": [{
                    "id":            p.id,
                    "member_id":     p.member.id,
                    "member_name":   p.member.name,
                    "member_email":  p.member.email,
                    "amount":        str(p.amount),
                    "penalty_amount": str(p.penalty_amount),
                    "is_paid":       p.is_paid,
                    "due_date":      p.due_date,
                    "paid_at":       p.paid_at,
                } for p in cycle_payments],
            })

        return Response(cycles_data)


# ─── Loans ──────────────────────────────────────────────────

class RequestLoanView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pund_id):
        pund = _get_pund(pund_id)
        if not pund:
            return Response({"error": "Pund not found"}, status=404)

        is_member = Membership.objects.filter(
            user=request.user, pund=pund, role="MEMBER", is_active=True
        ).exists()
        if not is_member:
            return Response({"error": "Only member can request loan"}, status=403)

        if Loan.objects.filter(pund=pund, member=request.user, is_active=True).exists():
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


class ApproveLoanView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, loan_id):
        loan = Loan.objects.filter(id=loan_id).first()
        if not loan:
            return Response({"error": "Loan not found"}, status=404)
        if loan.status != "PENDING":
            return Response({"error": "Loan already processed"}, status=400)

        pund = loan.pund
        if not pund.is_active:
            return Response({"error": "Pund is closed"}, status=400)
        if not _is_owner(request.user, pund):
            return Response({"error": "Only owner can approve"}, status=403)

        # Prevent duplicate active loan for same member
        if Loan.objects.filter(
            pund=pund, member=loan.member, status__in=["APPROVED", "ACTIVE"]
        ).exclude(id=loan.id).exists():
            return Response(
                {"error": "Member already has an active loan. Clear previous loan first."},
                status=400,
            )

        serializer = LoanApproveSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        today = timezone.now().date()
        structure = PundStructure.objects.filter(
            pund=pund, effective_from__lte=today
        ).order_by("-effective_from").first()
        if not structure:
            return Response({"error": "Structure not found"}, status=400)

        cycles = serializer.validated_data.get("cycles") or structure.default_loan_cycles

        # Fund availability check
        collected_agg = Payment.objects.filter(pund=pund, is_paid=True).aggregate(
            total_amount=models.Sum("amount"),
            total_penalty=models.Sum("penalty_amount"),
        )
        total_collected = (collected_agg["total_amount"] or Decimal("0")) + \
                          (collected_agg["total_penalty"] or Decimal("0"))
        total_active_loans = Loan.objects.filter(
            pund=pund, status__in=["APPROVED", "ACTIVE"]
        ).aggregate(v=models.Sum("remaining_amount"))["v"] or Decimal("0")

        if loan.principal_amount > (total_collected - total_active_loans):
            return Response({"error": "Insufficient fund in pund"}, status=400)

        # Calculate EMI
        interest      = (loan.principal_amount * structure.loan_interest_percentage) / Decimal("100")
        total_payable = loan.principal_amount + interest
        emi           = total_payable / cycles

        # Update loan
        loan.interest_percentage = structure.loan_interest_percentage
        loan.total_payable       = total_payable
        loan.total_cycles        = cycles
        loan.remaining_amount    = total_payable
        loan.status              = "APPROVED"
        loan.is_active           = True
        loan.approved_by         = request.user
        loan.approved_at         = timezone.now()
        loan.save()

        # Create installments
        delta      = 1 if pund.pund_type == "DAILY" else 7 if pund.pund_type == "WEEKLY" else 30
        start_date = today + timedelta(days=delta)

        LoanInstallment.objects.bulk_create([
            LoanInstallment(
                loan=loan,
                cycle_number=i,
                emi_amount=emi,
                due_date=start_date + timedelta(days=(i - 1) * delta),
                status="PENDING",
            )
            for i in range(1, cycles + 1)
        ])

        FinanceAuditLog.objects.create(
            pund=pund, user=request.user,
            action="Loan Approved",
            description=f"Loan {loan.id} approved for {loan.member.email}",
        )
        return Response({"message": "Loan approved successfully"})


class RejectLoanView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, loan_id):
        loan = Loan.objects.filter(id=loan_id).first()
        if not loan:
            return Response({"error": "Loan not found"}, status=404)
        if loan.status != "PENDING":
            return Response({"error": "Only pending loans can be rejected"}, status=400)

        pund = loan.pund
        if not pund.is_active:
            return Response({"error": "Pund is closed"}, status=400)
        if not _is_owner(request.user, pund):
            return Response({"error": "Only owner can reject"}, status=403)

        reason = request.data.get("reason", "").strip()
        if not reason:
            return Response({"error": "Rejection reason is required"}, status=400)

        loan.status           = "REJECTED"
        loan.is_active        = False
        loan.rejection_reason = reason
        loan.rejected_by      = request.user
        loan.rejected_at      = timezone.now()
        loan.save()

        FinanceAuditLog.objects.create(
            pund=pund, user=request.user,
            action="Loan Rejected",
            description=f"Loan {loan.id} rejected. Reason: {reason}",
        )
        return Response({"message": "Loan rejected successfully"})


class MarkLoanInstallmentPaidView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, installment_id):
        installment = LoanInstallment.objects.filter(id=installment_id).first()
        if not installment:
            return Response({"error": "Installment not found"}, status=404)

        loan = installment.loan
        if not loan.pund.is_active:
            return Response({"error": "Pund is closed"}, status=400)
        if not _is_owner(request.user, loan.pund):
            return Response({"error": "Only owner can mark EMI"}, status=403)
        if installment.is_paid:
            return Response({"error": "Already paid"}, status=400)

        apply_loan_penalty(loan)
        installment.refresh_from_db()

        total_amount        = installment.emi_amount + installment.penalty_amount
        installment.is_paid = True
        installment.paid_at = timezone.now()
        installment.save()

        Payment.objects.create(
            pund=loan.pund,
            member=loan.member,
            cycle_number=installment.cycle_number,
            amount=installment.emi_amount,
            penalty_amount=installment.penalty_amount,
            is_paid=True,
            paid_at=timezone.now(),
            due_date=installment.due_date,
        )

        FinanceAuditLog.objects.create(
            pund=loan.pund, user=request.user,
            action="EMI Paid",
            description=f"Installment {installment.id} marked paid. Amount: {total_amount}",
        )

        loan.remaining_amount = max(Decimal("0"), loan.remaining_amount - installment.emi_amount)
        if loan.remaining_amount <= 0:
            loan.status    = "CLOSED"
            loan.is_active = False
        loan.save()

        return Response({
            "message":          "EMI marked as paid",
            "paid_amount":      str(total_amount),
            "remaining_amount": str(loan.remaining_amount),
            "loan_status":      loan.status,
        })


class LoanDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, loan_id):
        loan = Loan.objects.filter(id=loan_id).first()
        if not loan:
            return Response({"error": "Loan not found"}, status=404)

        membership = _get_membership(request.user, loan.pund)
        if not membership:
            return Response({"error": "Not authorized"}, status=403)
        if membership.role == "MEMBER" and loan.member != request.user:
            return Response({"error": "You cannot view other member loans"}, status=403)

        apply_loan_penalty(loan)

        return Response({
            "principal":          str(loan.principal_amount),
            "interest_percentage": str(loan.interest_percentage),
            "total_payable":      str(loan.total_payable),
            "remaining_amount":   str(loan.remaining_amount),
            "status":             loan.status,
            "installments": [{
                "id":             inst.id,
                "cycle_number":   inst.cycle_number,
                "emi_amount":     str(inst.emi_amount),
                "penalty_amount": str(inst.penalty_amount),
                "is_paid":        inst.is_paid,
                "due_date":       inst.due_date,
            } for inst in LoanInstallment.objects.filter(loan=loan)],
        })


class MyLoansView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = []
        for loan in Loan.objects.filter(member=request.user):
            installments          = LoanInstallment.objects.filter(loan=loan)
            emi_paid, penalty_paid = _loan_installment_summary(installments)
            total_paid            = emi_paid + penalty_paid
            remaining             = loan.total_payable - emi_paid
            progress              = float(emi_paid / loan.total_payable * 100) if loan.total_payable else 0

            data.append({
                "loan_id":            loan.id,
                "pund":               loan.pund.name,
                "principal":          str(loan.principal_amount),
                "remaining":          str(remaining),
                "total_payable":      str(loan.total_payable),
                "status":             loan.status,
                "is_active":          loan.is_active,
                "paid_amount":        str(total_paid),
                "emi_paid":           str(emi_paid),
                "penalties_paid":     str(penalty_paid),
                "progress":           round(progress, 2),
                "paid_installments":  installments.filter(is_paid=True).count(),
                "total_installments": installments.count(),
            })
        return Response(data)


class PundLoansView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pund_id):
        pund = _get_pund(pund_id, active_only=False)
        if not pund:
            return Response({"error": "Pund not found"}, status=404)
        if not _is_owner(request.user, pund):
            return Response({"error": "Only owner can view loans"}, status=403)

        data = []
        for loan in Loan.objects.filter(pund=pund):
            installments          = LoanInstallment.objects.filter(loan=loan)
            emi_paid, penalty_paid = _loan_installment_summary(installments)
            total_paid            = emi_paid + penalty_paid
            remaining             = loan.total_payable - emi_paid
            progress              = float(emi_paid / loan.total_payable * 100) if loan.total_payable else 0

            data.append({
                "loan_id":        loan.id,
                "member":         loan.member.email,
                "principal":      str(loan.principal_amount),
                "remaining":      str(remaining),
                "total_payable":  str(loan.total_payable),
                "interest_amount": str(loan.total_payable - loan.principal_amount),
                "paid_amount":    str(total_paid),
                "emi_paid":       str(emi_paid),
                "penalties_paid": str(penalty_paid),
                "status":         loan.status,
                "progress":       round(progress, 2),
            })
        return Response(data)


# ─── Summaries ──────────────────────────────────────────────

class FundSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pund_id):
        pund = _get_pund(pund_id, active_only=False)
        if not pund:
            return Response({"error": "Pund not found"}, status=404)
        if not _get_membership(request.user, pund):
            return Response({"error": "Not authorized"}, status=403)

        collected_agg = Payment.objects.filter(pund=pund, is_paid=True).aggregate(
            total_amount=models.Sum("amount"),
            total_penalty=models.Sum("penalty_amount"),
        )
        total_savings   = collected_agg["total_amount"]  or Decimal("0")
        total_penalties = collected_agg["total_penalty"] or Decimal("0")
        total_collected = total_savings + total_penalties

        active_loans     = Loan.objects.filter(pund=pund, is_active=True)
        total_outstanding = active_loans.aggregate(v=models.Sum("remaining_amount"))["v"] or Decimal("0")
        total_principal   = active_loans.aggregate(v=models.Sum("principal_amount"))["v"]  or Decimal("0")
        total_payable_sum = active_loans.aggregate(v=models.Sum("total_payable"))["v"]      or Decimal("0")

        return Response({
            "total_collected":        str(total_collected),
            "total_savings":          str(total_savings),
            "total_penalties":        str(total_penalties),
            "active_loan_outstanding": str(total_outstanding),
            "active_loan_principal":  str(total_principal),
            "active_loan_interest":   str(total_payable_sum - total_principal),
            "available_fund":         str(total_collected - total_outstanding),
        })


class SavingSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pund_id):
        pund = _get_pund(pund_id, active_only=False)
        if not pund:
            return Response({"error": "Pund not found"}, status=404)
        if not _get_membership(request.user, pund):
            return Response({"error": "You are not a member of this pund"}, status=403)

        payments       = Payment.objects.filter(pund=pund)
        total_cycles   = payments.values("cycle_number").distinct().count()
        total_expected = payments.aggregate(v=models.Sum("amount"))["v"] or Decimal("0")

        paid_agg   = payments.filter(is_paid=True).aggregate(
            total_amount=models.Sum("amount"), total_penalty=models.Sum("penalty_amount")
        )
        total_paid    = (paid_agg["total_amount"] or Decimal("0")) + (paid_agg["total_penalty"] or Decimal("0"))
        total_unpaid  = payments.filter(is_paid=False).aggregate(v=models.Sum("amount"))["v"] or Decimal("0")
        total_penalty = payments.aggregate(v=models.Sum("penalty_amount"))["v"] or Decimal("0")
        total_members = Membership.objects.filter(pund=pund, role="MEMBER", is_active=True).count()

        return Response({
            "total_cycles":             total_cycles,
            "total_members":            total_members,
            "total_expected_savings":   str(total_expected),
            "total_paid_savings":       str(total_paid),
            "total_unpaid_savings":     str(total_unpaid),
            "total_penalties_collected": str(total_penalty),
        })


class MyFinancialSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pund_id):
        payments = Payment.objects.filter(member=request.user, pund_id=pund_id)

        total_savings_paid   = payments.filter(is_paid=True).aggregate(v=models.Sum("amount"))["v"] or Decimal("0")
        total_saving_penalty = payments.aggregate(v=models.Sum("penalty_amount"))["v"]              or Decimal("0")
        total_unpaid_savings = payments.filter(is_paid=False).aggregate(v=models.Sum("amount"))["v"] or Decimal("0")

        loan_data   = None
        active_loan = Loan.objects.filter(member=request.user, is_active=True).first()
        if active_loan:
            apply_loan_penalty(active_loan)
            installments = LoanInstallment.objects.filter(loan=active_loan)
            emi_paid     = installments.filter(is_paid=True).aggregate(v=models.Sum("emi_amount"))["v"]     or Decimal("0")
            loan_penalty = installments.aggregate(v=models.Sum("penalty_amount"))["v"]                      or Decimal("0")
            loan_data    = {
                "loan_id":           active_loan.id,
                "principal":         str(active_loan.principal_amount),
                "remaining_amount":  str(active_loan.remaining_amount),
                "total_payable":     str(active_loan.total_payable),
                "status":            active_loan.status,
                "total_emi_paid":    str(emi_paid),
                "total_loan_penalty": str(loan_penalty),
            }

        return Response({
            "saving_summary": {
                "total_savings_paid":   str(total_savings_paid),
                "total_saving_penalty": str(total_saving_penalty),
                "total_unpaid_savings": str(total_unpaid_savings),
            },
            "loan_summary": loan_data,
        })


class AuditLogView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pund_id):
        pund = _get_pund(pund_id, active_only=False)
        if not pund:
            return Response({"error": "Pund not found"}, status=404)
        if not _is_owner(request.user, pund):
            return Response({"error": "Only owner can view audit logs"}, status=403)

        return Response([{
            "action":       log.action,
            "description":  log.description,
            "performed_by": log.user.email if log.user else None,
            "timestamp":    log.created_at,
        } for log in FinanceAuditLog.objects.filter(pund=pund)])
