from django.urls import path
from .views import (
    SendOTPView,
    VerifyOTPView,
    RegisterView,
    LoginView,
    ForgotPasswordSendOTPView,
    ResetPasswordView,
)

urlpatterns = [
    path("send-otp/", SendOTPView.as_view(), name="send-otp"),
    path("verify-otp/", VerifyOTPView.as_view(), name="verify-otp"),
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("forgot-password/", ForgotPasswordSendOTPView.as_view(), name="forgot-password"),
    path("reset-password/", ResetPasswordView.as_view(), name="reset-password"),
]