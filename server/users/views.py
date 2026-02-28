from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils import timezone
from datetime import timedelta

from .models import User
from .serializers import (
    SendOTPSerializer,
    VerifyOTPSerializer,
    RegisterSerializer,
    LoginSerializer,
    ResetPasswordSerializer,
)
from .services import send_otp_email


# -----------------------------
# SEND OTP (Registration)
# -----------------------------
class SendOTPView(APIView):
    def post(self, request):
        serializer = SendOTPSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]

            user, created = User.objects.get_or_create(email=email)

            if user.is_active:
                return Response(
                    {"error": "Email already registered"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Reset verification state
            user.email_verified = False
            user.save()

            send_otp_email(user)
            return Response({"message": "OTP sent successfully"})

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# -----------------------------
# VERIFY OTP
# -----------------------------
class VerifyOTPView(APIView):
    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            otp = serializer.validated_data["otp"]

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response(
                    {"error": "User not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Check attempt limit
            if user.otp_attempts >= 5:
                return Response(
                    {"error": "Too many OTP attempts"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check OTP match
            if not user.otp or user.otp != otp:
                user.otp_attempts += 1
                user.save()
                return Response(
                    {"error": "Invalid OTP"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check expiry
            if timezone.now() > user.otp_created_at + timedelta(minutes=5):
                return Response(
                    {"error": "OTP expired"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Success
            user.email_verified = True
            user.otp_verified_for_reset = True 
            user.otp_attempts = 0
            user.save()

            return Response({"message": "OTP verified successfully"})

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# -----------------------------
# REGISTER
# -----------------------------
class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response(
                    {"error": "Send OTP first"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if not user.email_verified:
                return Response(
                    {"error": "Verify email first"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user.name = serializer.validated_data["name"]
            user.mobile = serializer.validated_data["mobile"]
            user.set_password(serializer.validated_data["password"])
            user.is_active = True
            user.save()

            return Response({"message": "Registration completed successfully"})

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# -----------------------------
# LOGIN
# -----------------------------
class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            password = serializer.validated_data["password"]

            user = authenticate(request, email=email, password=password)

            if not user:
                return Response(
                    {"error": "Invalid credentials"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if not user.is_active:
                return Response(
                    {"error": "Account not active"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            refresh = RefreshToken.for_user(user)

            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            })

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# -----------------------------
# FORGOT PASSWORD - SEND OTP
# -----------------------------
class ForgotPasswordSendOTPView(APIView):
    def post(self, request):
        serializer = SendOTPSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response(
                    {"error": "Email not registered"},
                    status=status.HTTP_404_NOT_FOUND
                )

            if not user.is_active:
                return Response(
                    {"error": "Account not active"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            send_otp_email(user)
            return Response({"message": "OTP sent for password reset"})

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# -----------------------------
# RESET PASSWORD
# -----------------------------
class ResetPasswordView(APIView):
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            otp = serializer.validated_data["otp"]
            new_password = serializer.validated_data["new_password"]

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response({"error": "User not found"}, status=400)

            # Check if OTP exists
            if not user.otp or not user.otp_created_at:
                return Response({"error": "No OTP found"}, status=400)

            # Validate OTP
            if user.otp != otp:
                return Response({"error": "Invalid OTP"}, status=400)

            # Check expiry - only if otp_created_at exists
            if timezone.now() > user.otp_created_at + timedelta(minutes=5):
                return Response({"error": "OTP expired"}, status=400)

            user.set_password(new_password)
            user.otp = None
            user.otp_created_at = None
            user.otp_verified_for_reset = False  # Reset the flag

            user.save()

            return Response({"message": "Password reset successful"})