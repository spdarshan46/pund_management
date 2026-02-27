from django.contrib import admin
from .models import PundStructure, Payment, Loan, LoanInstallment


# ==========================
# PUND STRUCTURE ADMIN
# ==========================
@admin.register(PundStructure)
class PundStructureAdmin(admin.ModelAdmin):
    list_display = (
        "pund",
        "saving_amount",
        "loan_interest_percentage",
        "missed_saving_penalty",
        "missed_loan_penalty",
        "default_loan_cycles",
        "effective_from",
        "created_at",
    )

    list_filter = ("pund", "effective_from")
    ordering = ("-effective_from",)
    search_fields = ("pund__name",)

    readonly_fields = ("created_at",)


# ==========================
# PAYMENT ADMIN
# ==========================
@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        "pund",
        "member",
        "cycle_number",
        "amount",
        "penalty_amount",
        "is_paid",
        "due_date",
        "created_at",
    )

    list_filter = ("pund", "is_paid", "cycle_number")
    search_fields = ("member__email", "pund__name")
    ordering = ("-cycle_number",)

    readonly_fields = (
        "pund",
        "member",
        "cycle_number",
        "amount",
        "penalty_amount",
        "due_date",
        "created_at",
    )


@admin.register(Loan)
class LoanAdmin(admin.ModelAdmin):
    list_display = ("member", "pund", "principal_amount", "status", "is_active", "created_at")
    list_filter = ("status", "is_active")


@admin.register(LoanInstallment)
class LoanInstallmentAdmin(admin.ModelAdmin):
    list_display = ("loan", "cycle_number", "emi_amount", "penalty_amount", "is_paid", "due_date")
    list_filter = ("is_paid",)