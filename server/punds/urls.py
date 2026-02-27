from django.urls import path
from .views import *

urlpatterns = [
    path("create/", CreatePundView.as_view()),
    path("<int:pund_id>/add-member/", AddMemberView.as_view()),
    path("my-all/", MyAllPundsView.as_view()),
    path("<int:pund_id>/close/", ClosePundView.as_view()),
    path("<int:pund_id>/", PundDetailView.as_view()),   
    path("<int:pund_id>/reopen/", ReopenPundView.as_view()),
]