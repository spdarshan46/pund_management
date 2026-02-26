from django.contrib import admin
from .models import PundStructure, Payment

@admin.register(PundStructure)
class PundStructureAdmin(admin.ModelAdmin):
    """Admin for structure versions per pund."""
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
    readonly_fields = ("created_at",)
    date_hierarchy = "effective_from"


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    """Admin for weekly payment entries."""
    list_display = (
        "id",
        "pund",
        "member",
        "week_number",
        "amount",
        "penalty_amount",
        "is_paid",
        "paid_at",
        "created_at",
    )
    list_filter = ("pund", "week_number", "is_paid")
    search_fields = ("member__email", "member__name", "pund__name")
    ordering = ("-week_number", "-created_at")
    readonly_fields = ("created_at", "paid_at")
    autocomplete_fields = ("member", "pund")
    fieldsets = (
        (None, {"fields": ("pund", "member", "week_number", "amount", "penalty_amount")}),
        ("Status", {"fields": ("is_paid", "paid_at")}),
        ("Meta", {"fields": ("created_at",)}),
    )