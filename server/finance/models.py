from django.db import models
from django.utils import timezone
from django.conf import settings
from punds.models import Pund

class PundStructure(models.Model):
    pund = models.ForeignKey(Pund, on_delete=models.CASCADE)

    saving_amount = models.DecimalField(max_digits=10, decimal_places=2)
    loan_interest_percentage = models.DecimalField(max_digits=5, decimal_places=2)

    missed_saving_penalty = models.DecimalField(max_digits=10, decimal_places=2)
    missed_loan_penalty = models.DecimalField(max_digits=10, decimal_places=2)

    default_loan_cycles = models.IntegerField(default=10)

    effective_from = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering = ["-effective_from"]

    def __str__(self):
        return f"{self.pund.name} Structure from {self.effective_from}"

class Payment(models.Model):
    pund = models.ForeignKey(
        Pund,
        on_delete=models.CASCADE,
        related_name="payments"
    )

    member = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="payments"
    )

    cycle_number = models.IntegerField()

    amount = models.DecimalField(max_digits=10, decimal_places=2)
    penalty_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    is_paid = models.BooleanField(default=False)
    paid_at = models.DateTimeField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ("pund", "member", "cycle_number")
        ordering = ["-cycle_number"]

    def __str__(self):
        return f"{self.pund.name} - Cycle {self.cycle_number} - {self.member.email}" 

# ==========================
# LOAN MODEL
# ==========================
class Loan(models.Model):

    STATUS_CHOICES = (
        ("PENDING", "Pending"),
        ("APPROVED", "Approved"),
        ("REJECTED", "Rejected"),
        ("CLOSED", "Closed"),
    )

    pund = models.ForeignKey(Pund, on_delete=models.CASCADE)
    member = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="loans"
    )

    principal_amount = models.DecimalField(max_digits=12, decimal_places=2)
    interest_percentage = models.DecimalField(max_digits=5, decimal_places=2)

    total_payable = models.DecimalField(max_digits=12, decimal_places=2)
    total_cycles = models.IntegerField()
    remaining_amount = models.DecimalField(max_digits=12, decimal_places=2)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    is_active = models.BooleanField(default=False)

    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_loans"
    )

    approved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.member.email} - {self.principal_amount} ({self.status})"


# ==========================
# LOAN INSTALLMENT
# ==========================
class LoanInstallment(models.Model):

    loan = models.ForeignKey(
        Loan,
        on_delete=models.CASCADE,
        related_name="installments"
    )

    cycle_number = models.IntegerField()
    emi_amount = models.DecimalField(max_digits=12, decimal_places=2)
    penalty_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    due_date = models.DateField()
    is_paid = models.BooleanField(default=False)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("loan", "cycle_number")
        ordering = ["cycle_number"]

    def __str__(self):
        return f"Loan {self.loan.id} - Cycle {self.cycle_number}"

# ==========================
# audit log
# ==========================
class FinanceAuditLog(models.Model):

    pund = models.ForeignKey(Pund, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    action = models.CharField(max_length=100)
    description = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.action} - {self.pund.name}"
    