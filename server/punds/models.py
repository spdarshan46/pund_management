from django.db import models
from django.conf import settings
from django.utils import timezone


class Pund(models.Model):

    PUND_TYPE_CHOICES = (
        ("DAILY", "Daily"),
        ("WEEKLY", "Weekly"),
        ("MONTHLY", "Monthly"),
    )

    name = models.CharField(max_length=150)
    pund_type = models.CharField(max_length=10, choices=PUND_TYPE_CHOICES)

    start_date = models.DateField(default=timezone.now)
    is_active = models.BooleanField(default=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_punds",
    )

    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.name


class Membership(models.Model):

    ROLE_CHOICES = (
        ("OWNER", "Owner"),
        ("MEMBER", "Member"),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="memberships",
    )

    pund = models.ForeignKey(
        Pund,
        on_delete=models.CASCADE,
        related_name="members",
    )

    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    is_active = models.BooleanField(default=True)

    joined_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ("user", "pund")

    def __str__(self):
        return f"{self.user.email} - {self.pund.name} ({self.role})"