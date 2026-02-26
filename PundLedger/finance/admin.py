from django.contrib import admin
from .models import PundStructure, Payment


# 🔹 Pund Structure Admin
@admin.register(PundStructure)
class PundStructureAdmin(admin.ModelAdmin):
    list_display = (
        "pund",
        "saving_amount",
        "loan_interest_percentage",
        "missed_week_penalty",
        "effective_from",
        "created_at",
    )

    list_filter = ("pund", "effective_from")
    search_fields = ("pund__name",)
    ordering = ("-effective_from",)


# 🔹 Payment Admin
@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        "pund",
        "member",
        "week_number",
        "amount",
        "penalty_amount",
        "is_paid",
        "paid_at",
        "created_at",
    )

    list_filter = (
        "pund",
        "week_number",
        "is_paid",
    )

    search_fields = (
        "member__email",
        "pund__name",
    )

    ordering = ("-week_number", "-created_at")