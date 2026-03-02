from django.urls import path
from .views import *

urlpatterns = [
    path("create/", CreatePundView.as_view()),
    path("<int:pund_id>/add-member/", AddMemberView.as_view()),
    path("my-all/", MyAllPundsView.as_view()),
    path("<int:pund_id>/close/", ClosePundView.as_view()),
    path("<int:pund_id>/", PundDetailView.as_view()),   
    path("<int:pund_id>/reopen/", ReopenPundView.as_view()),
    path("<int:pund_id>/remove-member/<int:member_id>/", RemoveMemberView.as_view()),
    path("<int:pund_id>/reactivate-member/<int:member_id>/", ReactivateMemberView.as_view()),
    path("<int:pund_id>/edit-member/<int:user_id>/",OwnerEditMemberView.as_view()),
]