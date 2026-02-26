from django.urls import path
from .views import GenerateWeekView, MarkPaymentPaidView, SetStructureView

urlpatterns = [
    path("<int:pund_id>/set-structure/", SetStructureView.as_view()),
    path("<int:pund_id>/generate-week/", GenerateWeekView.as_view()),
    path("payment/<int:payment_id>/mark-paid/", MarkPaymentPaidView.as_view()),
]