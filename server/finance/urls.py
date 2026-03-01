from django.urls import path
from .views import AllPaymentsView, ApproveLoanView, AuditLogView, CyclePaymentsView, ExportReportView, FundSummaryView, GenerateCycleView, LoanDetailView, MarkLoanInstallmentPaidView, MarkPaymentPaidView, MyFinancialSummaryView, MyLoansView, PundLoansView, RequestLoanView, SavingSummaryView, SetStructureView

urlpatterns = [
    path("pund/<int:pund_id>/set-structure/", SetStructureView.as_view()),
    path("pund/<int:pund_id>/generate-cycle/", GenerateCycleView.as_view()),
    path("payment/<int:payment_id>/mark-paid/", MarkPaymentPaidView.as_view()),
    path("pund/<int:pund_id>/request-loan/", RequestLoanView.as_view()),    
    path("loan/<int:loan_id>/approve/", ApproveLoanView.as_view()),
    path("installment/<int:installment_id>/mark-paid/", MarkLoanInstallmentPaidView.as_view()),
    path("loan/<int:loan_id>/detail/", LoanDetailView.as_view()),
    path("pund/<int:pund_id>/fund-summary/", FundSummaryView.as_view()),
    path("my-loans/", MyLoansView.as_view()),
    path("pund/<int:pund_id>/saving-summary/", SavingSummaryView.as_view()),
    path("pund/<int:pund_id>/loans/", PundLoansView.as_view()),
    path("my-financial-summary/", MyFinancialSummaryView.as_view()),
    path("pund/<int:pund_id>/audit-logs/", AuditLogView.as_view()),
    path("pund/<int:pund_id>/export-report/", ExportReportView.as_view()),
    path("pund/<int:pund_id>/all-payments/", AllPaymentsView.as_view()),
    path("pund/<int:pund_id>/cycle-payments/", CyclePaymentsView.as_view()),
]