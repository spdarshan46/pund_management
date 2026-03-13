import random
from datetime import timedelta
from django.utils import timezone
from django.conf import settings
from django.core.mail import EmailMultiAlternatives


# -------------------------
# OTP Generation
# -------------------------
def generate_otp():
    return str(random.randint(100000, 999999))


# -------------------------
# Send Email Helper
# -------------------------
def send_html_email(subject, html_content, recipient):
    email = EmailMultiAlternatives(
        subject=subject,
        body="This email requires HTML support.",
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[recipient],
    )
    email.attach_alternative(html_content, "text/html")
    email.send()


# -------------------------
# Send OTP Email
# -------------------------
def send_otp_email(user, target_email=None):

    otp = generate_otp()

    user.otp = otp
    user.otp_created_at = timezone.now()
    user.otp_attempts = 0
    user.save()

    subject = "PUNDX - Your OTP Verification Code"

    html_content = f"""
    <div style="font-family: Arial; background:#f5f8fc; padding:20px">
        <div style="max-width:600px;margin:auto;background:white;border-radius:8px">
            <div style="background:#00529b;padding:20px;text-align:center;color:white">
                <h2>PUNDX</h2>
                <p>Community Savings Management System</p>
            </div>

            <div style="padding:30px;text-align:center">
                <h3>Email Verification</h3>

                <p>Your OTP code is:</p>

                <div style="font-size:32px;font-weight:bold;letter-spacing:6px;color:#00529b">
                    {otp}
                </div>

                <p>This OTP is valid for <b>5 minutes</b></p>
            </div>
        </div>
    </div>
    """

    send_html_email(subject, html_content, target_email or user.email)


# -------------------------
# Verify OTP
# -------------------------
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


# -------------------------
# Send Invite Email
# -------------------------
def send_invite_email(user, pund_name):

    name = getattr(user, "first_name", user.email)

    subject = f"You've been added to {pund_name}"

    activation_link = f"{settings.FRONTEND_URL}/activate-account?email={user.email}"

    html_content = f"""
    <h2>Hello {name}</h2>

    <p>You have been added to:</p>

    <h3>{pund_name}</h3>

    <a href="{activation_link}">Activate Account</a>
    """

    send_html_email(subject, html_content, user.email)


# -------------------------
# Send Loan Approved Email
# -------------------------
def send_loan_approved_email(user, loan):

    name = getattr(user, "first_name", user.email)

    subject = "PUNDX - Loan Approved"

    html_content = f"""
    <h2>Loan Approved</h2>

    <p>Dear {name}</p>

    <p>Your loan has been approved.</p>

    <p>Loan Amount: ₹{loan.principal_amount}</p>

    <p>Interest Rate: {loan.interest_percentage}%</p>

    <p>Total Payable: ₹{loan.total_payable}</p>

    <p>Total Cycles: {loan.total_cycles}</p>
    """

    send_html_email(subject, html_content, user.email)
    