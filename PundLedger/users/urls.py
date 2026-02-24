from django.urls import path
from .views import *

urlpatterns = [
    path("send-otp/", SendOTPView.as_view()),
    path("verify-otp/", VerifyOTPView.as_view()),
    path("register/", RegisterView.as_view()),
    path("login/", LoginView.as_view()),
    path("reset-password/", ResetPasswordView.as_view()),
]