from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

from .models import User
from .serializers import *
from .services import send_otp_email, verify_otp


class SendOTPView(APIView):
    def post(self, request):
        serializer = SendOTPSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]

            user, created = User.objects.get_or_create(email=email)
            if user.is_active:
                return Response({"error": "Email already registered"}, status=400)

            send_otp_email(user)
            return Response({"message": "OTP sent"})

        return Response(serializer.errors, status=400)


class VerifyOTPView(APIView):
    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            otp = serializer.validated_data["otp"]

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response({"error": "User not found"}, status=404)

            valid, message = verify_otp(user, otp)
            if not valid:
                return Response({"error": message}, status=400)

            return Response({"message": message})

        return Response(serializer.errors, status=400)


class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response({"error": "Send OTP first"}, status=400)

            if not user.email_verified:
                return Response({"error": "Verify email first"}, status=400)

            user.name = serializer.validated_data["name"]
            user.mobile = serializer.validated_data["mobile"]
            user.set_password(serializer.validated_data["password"])
            user.is_active = True
            user.otp = None
            user.save()

            return Response({"message": "Registration completed"})

        return Response(serializer.errors, status=400)


class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            password = serializer.validated_data["password"]

            user = authenticate(request, email=email, password=password)
            if not user:
                return Response({"error": "Invalid credentials"}, status=400)

            if not user.is_active:
                return Response({"error": "Account not active"}, status=400)

            refresh = RefreshToken.for_user(user)

            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token)
            })

        return Response(serializer.errors, status=400)


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
                return Response({"error": "User not found"}, status=404)

            valid, message = verify_otp(user, otp)
            if not valid:
                return Response({"error": message}, status=400)

            user.set_password(new_password)
            user.save()

            return Response({"message": "Password reset successful"})

        return Response(serializer.errors, status=400)