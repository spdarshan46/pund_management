from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status

from .models import User


class UserAuthTests(APITestCase):

    def setUp(self):
        self.email = "test@example.com"
        self.password = "StrongPass123"

        self.user = User.objects.create_user(
            email=self.email,
            password=self.password
        )

        self.user.is_active = True
        self.user.email_verified = True
        self.user.save()


    # ─────────────────────────────
    # SEND OTP
    # ─────────────────────────────
    def test_send_otp(self):
        url = reverse("send-otp")

        response = self.client.post(url, {
            "email": "newuser@example.com"
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("message", response.data)


    # ─────────────────────────────
    # VERIFY OTP
    # ─────────────────────────────
    def test_verify_otp(self):

        user = User.objects.create(
            email="verify@test.com",
            otp="123456",
            otp_created_at=timezone.now(),
            is_active=False
        )

        url = reverse("verify-otp")

        response = self.client.post(url, {
            "email": user.email,
            "otp": "123456"
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)


    # ─────────────────────────────
    # LOGIN
    # ─────────────────────────────
    def test_login(self):

        url = reverse("login")

        response = self.client.post(url, {
            "email": self.email,
            "password": self.password
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)


    # ─────────────────────────────
    # REGISTER
    # ─────────────────────────────
    def test_register(self):

        user = User.objects.create(
            email="register@test.com",
            email_verified=True,
            is_active=False
        )

        url = reverse("register")

        response = self.client.post(url, {
            "email": user.email,
            "name": "Darshan",
            "mobile": "9876543210",
            "password": "TestPass123"
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        user.refresh_from_db()
        self.assertTrue(user.is_active)


    # ─────────────────────────────
    # FORGOT PASSWORD
    # ─────────────────────────────
    def test_forgot_password_send_otp(self):

        url = reverse("forgot-password")

        response = self.client.post(url, {
            "email": self.email
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)


    # ─────────────────────────────
    # RESET PASSWORD
    # ─────────────────────────────
    def test_reset_password(self):

        user = User.objects.create(
            email="reset@test.com",
            otp="123456",
            otp_created_at=timezone.now(),
            is_active=True
        )

        url = reverse("reset-password")

        response = self.client.post(url, {
            "email": user.email,
            "otp": "123456",
            "new_password": "NewPass123"
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)


    # ─────────────────────────────
    # CHANGE PASSWORD
    # ─────────────────────────────
    def test_change_password(self):

        url = reverse("change-password")

        login = self.client.post(reverse("login"), {
            "email": self.email,
            "password": self.password
        })

        token = login.data["access"]

        self.client.credentials(HTTP_AUTHORIZATION="Bearer " + token)

        response = self.client.post(url, {
            "current_password": self.password,
            "new_password": "NewPassword123",
            "confirm_password": "NewPassword123"
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)


    # ─────────────────────────────
    # GET PROFILE
    # ─────────────────────────────
    def test_get_profile(self):

        login = self.client.post(reverse("login"), {
            "email": self.email,
            "password": self.password
        })

        token = login.data["access"]

        self.client.credentials(HTTP_AUTHORIZATION="Bearer " + token)

        response = self.client.get(reverse("edit-profile"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)


    # ─────────────────────────────
    # UPDATE PROFILE
    # ─────────────────────────────
    def test_update_profile(self):

        login = self.client.post(reverse("login"), {
            "email": self.email,
            "password": self.password
        })

        token = login.data["access"]

        self.client.credentials(HTTP_AUTHORIZATION="Bearer " + token)

        response = self.client.patch(reverse("edit-profile"), {
            "name": "Updated Name"
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)