import random
from django.utils import timezone
from datetime import timedelta
from django.core.mail import send_mail
from .models import User


def generate_otp():
    return str(random.randint(100000, 999999))


def send_otp_email(user):
    otp = generate_otp()
    user.otp = otp
    user.otp_created_at = timezone.now()
    user.otp_attempts = 0
    user.save()

    send_mail(
        "Your OTP Code",
        f"Your OTP is {otp}",
        "your_email@gmail.com",
        [user.email],
        fail_silently=False,
    )


def verify_otp(user, otp):
    if not user.otp or user.otp != otp:
        user.otp_attempts += 1
        user.save()
        return False, "Invalid OTP"

    if timezone.now() > user.otp_created_at + timedelta(minutes=5):
        return False, "OTP Expired"

    user.email_verified = True
    user.save()
    return True, "OTP Verified"