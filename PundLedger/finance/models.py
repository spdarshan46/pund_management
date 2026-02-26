from django.db import models
from django.utils import timezone
from django.conf import settings
from punds.models import Pund


class PundStructure(models.Model):
    pund = models.ForeignKey(
        Pund,
        on_delete=models.CASCADE,
        related_name="structures"
    )

    saving_amount = models.DecimalField(max_digits=10, decimal_places=2)
    loan_interest_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    missed_week_penalty = models.DecimalField(max_digits=10, decimal_places=2)

    effective_from = models.DateField()
    created_at = models.DateTimeField(default=timezone.now)

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

    week_number = models.IntegerField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    penalty_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    is_paid = models.BooleanField(default=False)
    paid_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.member.email} - Week {self.week_number}"