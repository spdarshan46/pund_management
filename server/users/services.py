import random
from datetime import timedelta

from django.conf import settings
from django.utils import timezone
import resend


def generate_otp():
    return str(random.randint(100000, 999999))


def send_otp_email(user, target_email=None):
    otp = generate_otp()

    user.otp = otp
    user.otp_created_at = timezone.now()
    user.otp_attempts = 0
    user.save()

    subject = "PUNDX - Your OTP Verification Code"

    html_content = f"""
    <div style="font-family: Arial; background:#f5f8fc; padding:20px">
    
        <div style="max-width:600px;margin:auto;background:white;border-radius:8px;overflow:hidden">

            <div style="background:#00529b;padding:20px;text-align:center;color:white">
                <h2 style="margin:0">PUNDX</h2>
                <p style="margin:0;font-size:12px">Community Savings Management System</p>
            </div>

            <div style="padding:30px;text-align:center">

                <h3>Email Verification</h3>

                <p>Your One Time Password (OTP) is:</p>

                <div style="font-size:32px;font-weight:bold;letter-spacing:6px;color:#00529b;margin:20px 0;">
                    {otp}
                </div>

                <p>This OTP is valid for <b>5 minutes</b>.</p>

                <p style="color:#777;font-size:12px">
                    If you did not request this, please ignore this email.
                </p>

            </div>

            <div style="background:#eef5ff;padding:15px;text-align:center;font-size:12px;color:#555">
                This is a system generated email from <b>PUNDX</b>.
            </div>

        </div>

    </div>
    """

    resend.api_key = settings.RESEND_API_KEY

    try:
        resend.Emails.send({
            "from": "PUNDX <pundx.tech>",
            "to": [target_email or user.email],
            "subject": subject,
            "html": html_content,
        })

        print("OTP email sent successfully")

    except Exception as e:
        print("EMAIL ERROR:", e)

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

def send_invite_email(user, pund_name):

    subject = f"You've been added to {pund_name}"

    # create activation link first
    activation_link = f"{settings.FRONTEND_URL}/activate-account?email={user.email}"

    html_content = f"""
    <div style="font-family: Arial; background:#f5f8fc; padding:20px">

        <div style="max-width:600px;margin:auto;background:white;border-radius:8px;overflow:hidden">

            <div style="background:#00529b;padding:20px;text-align:center;color:white">
                <h2>PUNDX</h2>
                <p>Community Savings Management System</p>
            </div>

            <div style="padding:30px">

                <h3>Hello {user.name},</h3>

                <p>You have been added to the savings group:</p>

                <h2 style="color:#00529b">{pund_name}</h2>

                <p>Please activate your account by clicking the button below:</p>

                <div style="text-align:center;margin:25px 0">
                    <a href="{activation_link}" 
                       style="background:#00529b;color:white;padding:12px 20px;
                       text-decoration:none;border-radius:6px;font-weight:bold;">
                       Activate Account
                    </a>
                </div>

                <p>If the button doesn't work, open this link:</p>

                <p>
                    <a href="{activation_link}">
                        {activation_link}
                    </a>
                </p>

                <div style="margin-top:20px">
                    <p>Thank you for using <b>PUNDX</b>.</p>
                </div>

            </div>

            <div style="background:#eef5ff;padding:15px;text-align:center;font-size:12px;color:#555">
                PUNDX Official Notification
            </div>

        </div>

    </div>
    """

    email = EmailMultiAlternatives(
        subject,
        f"You have been added to {pund_name}",
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
    )

    email.attach_alternative(html_content, "text/html")
    email.send()

def send_loan_approved_email(user, loan):
    subject = "PUNDX - Loan Approved"

    html_content = f"""
    <div style="font-family: Arial; background:#f5f8fc; padding:20px">
    
        <div style="max-width:600px;margin:auto;background:white;border-radius:8px;overflow:hidden">

            <div style="background:#00529b;padding:20px;text-align:center;color:white">
                <h2 style="margin:0">PUNDX</h2>
                <p style="margin:0;font-size:12px">Community Savings Management System</p>
            </div>

            <div style="padding:30px;text-align:center">

                <h3>Loan Approved 🎉</h3>

                <p>Dear <b>{user.first_name}</b>,</p>

                <p>Your loan request has been successfully approved.</p>

                <div style="background:#eef5ff;padding:20px;border-radius:6px;margin:20px 0">

                    <p><b>Loan Amount:</b> ₹{loan.principal_amount}</p>
                    <p><b>Interest:</b> {loan.interest_percentage}%</p>
                    <p><b>Total Payable:</b> ₹{loan.total_payable}</p>
                    <p><b>Total Cycles:</b> {loan.total_cycles}</p>

                </div>

                <p>Please make sure to pay your installments on time.</p>

                <p style="color:#777;font-size:12px">
                    If you have any questions, please contact the pund owner.
                </p>

            </div>

            <div style="background:#eef5ff;padding:15px;text-align:center;font-size:12px;color:#555">
                This is a system generated email from <b>PUNDX</b>.
            </div>

        </div>

    </div>
    """

    resend.api_key = settings.RESEND_API_KEY

    try:
        resend.Emails.send({
            "from": "PUNDX <pundx.tech>",
            "to": [user.email],
            "subject": subject,
            "html": html_content,
        })

        print("Loan approval email sent successfully")

    except Exception as e:
        print("EMAIL ERROR:", e)
