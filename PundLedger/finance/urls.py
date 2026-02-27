from django.urls import path
from .views import ApproveLoanView, GenerateCycleView, MarkPaymentPaidView, RequestLoanView, SetStructureView

urlpatterns = [
    path("<int:pund_id>/set-structure/", SetStructureView.as_view()),
    path("<int:pund_id>/generate-cycle/", GenerateCycleView.as_view()),
    path("payment/<int:payment_id>/mark-paid/", MarkPaymentPaidView.as_view()),
    path("<int:pund_id>/request-loan/", RequestLoanView.as_view()),
    path("loan/<int:loan_id>/approve/", ApproveLoanView.as_view()),
]