import random
from datetime import timedelta

from django.conf import settings
from django.utils import timezone
import resend


# -------------------------
# OTP Generator
# -------------------------
def generate_otp():
    return str(random.randint(100000, 999999))


# -------------------------
# Common Email Sender
# -------------------------
def send_html_email(subject, html_content, recipient):

    resend.api_key = settings.RESEND_API_KEY

    try:
        resend.Emails.send({
            "from": "PUNDX <onboarding@resend.dev>",
            "to": [recipient],
            "subject": subject,
            "html": html_content,
        })

        print("Email sent successfully")

    except Exception as e:
        print("EMAIL ERROR:", e)


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
    <h2>PUNDX Email Verification</h2>
    <p>Your OTP is:</p>
    <h1>{otp}</h1>
    <p>This OTP is valid for 5 minutes.</p>
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

    if timezone.now() > user.otp_created_at + timedelta(minutes=2):
        return False, "OTP Expired"

    user.email_verified = True
    user.save()

    return True, "OTP Verified"


# -------------------------
# Send Invite Email
# -------------------------
def send_invite_email(user, pund_name):

    subject = f"You've been added to {pund_name}"

    activation_link = f"{settings.FRONTEND_URL}/activate-account?email={user.email}"

    html_content = f"""
    <h2>Hello {user.email}</h2>

    <p>You have been added to the savings group:</p>

    <h3>{pund_name}</h3>

    <a href="{activation_link}">Activate Account</a>
    """

    send_html_email(subject, html_content, user.email)


# -------------------------
# Send Loan Approved Email
# -------------------------
def send_loan_approved_email(user, loan):

    subject = "PUNDX - Loan Approved"

    html_content = f"""
    <h2>Loan Approved</h2>

    <p>Dear {user.email}</p>

    <p>Your loan has been approved.</p>

    <p>Loan Amount: ₹{loan.principal_amount}</p>

    <p>Interest Rate: {loan.interest_percentage}%</p>

    <p>Total Payable: ₹{loan.total_payable}</p>

    <p>Total Cycles: {loan.total_cycles}</p>
    """

    send_html_email(subject, html_content, user.email)
    