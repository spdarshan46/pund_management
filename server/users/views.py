from datetime import timedelta

from django.contrib.auth import authenticate
from django.utils import timezone

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .throttles import LoginThrottle, OTPThrottle, PasswordResetThrottle

from .models import User
from .serializers import (
    ChangePasswordSerializer,
    LoginSerializer,
    RegisterSerializer,
    ResetPasswordSerializer,
    SendOTPSerializer,
    UserSerializer,
    VerifyOTPSerializer,
)
from .services import send_otp_email

OTP_EXPIRY_MINUTES = 5


def _otp_expired(user):
    return timezone.now() > user.otp_created_at + timedelta(minutes=OTP_EXPIRY_MINUTES)


class SendOTPView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [OTPThrottle]
    
    def post(self, request):
        serializer = SendOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email      = serializer.validated_data["email"]
        user, _    = User.objects.get_or_create(email=email)

        if user.is_active:
            return Response({"error": "Email already registered"}, status=status.HTTP_400_BAD_REQUEST)

        user.email_verified = False
        user.save()
        send_otp_email(user)
        return Response({"message": "OTP sent successfully"})


class VerifyOTPView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [OTPThrottle]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data["email"]
        otp   = serializer.validated_data["otp"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        if user.otp_attempts >= 5:
            return Response({"error": "Too many OTP attempts"}, status=status.HTTP_400_BAD_REQUEST)

        if not user.otp or user.otp != otp:
            user.otp_attempts += 1
            user.save()
            return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

        if _otp_expired(user):
            return Response({"error": "OTP expired"}, status=status.HTTP_400_BAD_REQUEST)

        user.email_verified        = True
        user.otp_verified_for_reset = True
        user.otp_attempts          = 0
        user.save()
        return Response({"message": "OTP verified successfully"})


class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        email = serializer.validated_data["email"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "Send OTP first"}, status=400)

        if not user.email_verified:
            return Response({"error": "Verify email first"}, status=400)

        mobile = serializer.validated_data["mobile"]

        # 🔴 FIX: check duplicate mobile
        if User.objects.filter(mobile=mobile).exclude(id=user.id).exists():
            return Response({"error": "Mobile number already registered"}, status=400)

        user.name = serializer.validated_data["name"]
        user.mobile = mobile
        user.is_active = True
        user.set_password(serializer.validated_data["password"])
        user.save()

        return Response({"message": "Registration completed successfully"})


class LoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [LoginThrottle]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(
            request,
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
        )
        if not user:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)
        if not user.is_active:
            return Response({"error": "Account not active"}, status=status.HTTP_400_BAD_REQUEST)

        refresh = RefreshToken.for_user(user)
        return Response({"refresh": str(refresh), "access": str(refresh.access_token)})


class ForgotPasswordSendOTPView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [PasswordResetThrottle]

    def post(self, request):
        serializer = SendOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data["email"]
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "Email not registered"}, status=status.HTTP_404_NOT_FOUND)

        if not user.is_active:
            return Response({"error": "Account not active"}, status=status.HTTP_400_BAD_REQUEST)

        send_otp_email(user)
        return Response({"message": "OTP sent for password reset"})


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email        = serializer.validated_data["email"]
        otp          = serializer.validated_data["otp"]
        new_password = serializer.validated_data["new_password"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=400)

        if not user.otp or not user.otp_created_at:
            return Response({"error": "No OTP found"}, status=400)
        if user.otp != otp:
            return Response({"error": "Invalid OTP"}, status=400)
        if _otp_expired(user):
            return Response({"error": "OTP expired"}, status=400)

        user.set_password(new_password)
        user.otp                    = None
        user.otp_created_at         = None
        user.otp_verified_for_reset = False
        user.save()
        return Response({"message": "Password reset successful"})


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        if not user.check_password(serializer.validated_data["current_password"]):
            return Response({"error": "Current password is incorrect"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data["new_password"])
        user.save()
        return Response({"message": "Password changed successfully"})


class EditProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        user   = request.user
        name   = request.data.get("name")
        mobile = request.data.get("mobile")
        email  = request.data.get("email")

        if name:
            user.name = name
        if mobile:
            user.mobile = mobile

        if email and email != user.email:
            if User.objects.filter(email=email).exists():
                return Response({"error": "Email already in use"}, status=400)
            user.pending_email = email
            user.save()
            send_otp_email(user, target_email=email)
            return Response({"message": "OTP sent to new email. Verify to complete change."})

        user.save()
        return Response({"message": "Profile updated successfully"})


class VerifyEmailChangeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        otp  = request.data.get("otp")
        user = request.user

        if not user.pending_email:
            return Response({"error": "No pending email change"}, status=400)
        if user.otp != otp:
            return Response({"error": "Invalid OTP"}, status=400)
        if _otp_expired(user):
            return Response({"error": "OTP expired"}, status=400)

        user.email         = user.pending_email
        user.pending_email = None
        user.email_verified = True
        user.otp           = None
        user.save()
        return Response({"message": "Email updated successfully"})
    