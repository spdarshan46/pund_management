import secrets
from datetime import timedelta

from django.conf import settings
from django.utils import timezone
import resend


def generate_otp():
    return str(secrets.randbelow(900000) + 100000)

# -------------------------
# Common Email Sender
# -------------------------
def send_html_email(subject, html_content, recipient):

    resend.api_key = settings.RESEND_API_KEY

    try:
        resend.Emails.send({
            "from": "PUNDX <dlegacy@pundx.co.in>",
            "to": [recipient],
            "subject": subject,
            "html": html_content,
        })

        print("Email sent successfully")

    except Exception as e:
        print("EMAIL ERROR:", e)

def verify_otp(user, otp):

    if not user.otp or user.otp != otp:
        user.otp_attempts += 1
        user.save()
        return False, "Invalid OTP"

    if timezone.now() > user.otp_created_at + timedelta(minutes=5):
        return False, "OTP Expired"

    user.email_verified = True
    user.otp = None
    user.otp_created_at = None
    user.save()

    return True, "OTP Verified"


def email_template(title, content):

    return f"""
    <html>
    <body style="margin:0; padding:0; background:#f4f7fb; font-family:Arial, Helvetica, sans-serif;">

        <table width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fb; padding:40px 0;">
            <tr>
                <td align="center">

                    <table width="600" cellspacing="0" cellpadding="0" 
                    style="background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 4px 15px rgba(0,0,0,0.1);">

                        <!-- HEADER -->
                        <tr>
                            <td style="background:linear-gradient(135deg, #100, #4f46e5); padding:20px; text-align:center; color:white;">                                <h1 style="margin:0; font-size:28px;">PUNDX</h1>
                                <p style="margin:5px 0 0 0; font-size:14px;">Community Savings Management System</p>
                            </td>
                        </tr>

                        <!-- TITLE -->
                        <tr>
                            <td style="padding:30px 40px 10px 40px;">
                                <h2 style="color:#0A66C2; margin:0;">{title}</h2>
                            </td>
                        </tr>

                        <!-- CONTENT -->
                        <tr>
                            <td style="padding:10px 40px 30px 40px; font-size:15px; color:#333;">
                                {content}
                            </td>
                        </tr>

                        <!-- FOOTER -->
                        <tr>
                            <td style="background:#f0f4fa; text-align:center; padding:20px; font-size:12px; color:#666;">
                                © 2026 PUNDX. All rights reserved.
                                <br>
                                Secure Digital Savings Platform
                            </td>
                        </tr>

                    </table>

                </td>
            </tr>
        </table>

    </body>
    </html>
    """


def send_invite_email(user, pund_name):

    subject = f"You've been added to {pund_name}"

    activation_link = f"{settings.FRONTEND_URL}/activate-account?email={user.email}"

    content = f"""
    <p>Hello {user.email},</p>

    <p>You have been added to the savings group:</p>

    <h3 style="color:#0A66C2;">{pund_name}</h3>

    <p>Please activate your account:</p>

    <div style="text-align:center; margin:20px 0;">
        <a href="{activation_link}" 
        style="
        background:#0A66C2;
        color:white;
        padding:12px 25px;
        text-decoration:none;
        border-radius:6px;
        font-weight:bold;">
        Activate Account
        </a>
    </div>
    """

    html_content = email_template("Group Invitation", content)

    send_html_email(subject, html_content, user.email)

def send_loan_approved_email(user, loan):

    subject = "PUNDX - Loan Approved"

    content = f"""
    <p>Hello {user.email},</p>

    <p>Your loan has been approved successfully.</p>

    <table style="width:100%; border-collapse:collapse; margin-top:15px;">
        <tr>
            <td style="padding:8px;"><b>Loan Amount</b></td>
            <td style="padding:8px;">₹{loan.principal_amount}</td>
        </tr>
        <tr>
            <td style="padding:8px;"><b>Interest Rate</b></td>
            <td style="padding:8px;">{loan.interest_percentage}%</td>
        </tr>
        <tr>
            <td style="padding:8px;"><b>Total Payable</b></td>
            <td style="padding:8px;">₹{loan.total_payable}</td>
        </tr>
        <tr>
            <td style="padding:8px;"><b>Total Cycles</b></td>
            <td style="padding:8px;">{loan.total_cycles}</td>
        </tr>
    </table>
    """

    html_content = email_template("Loan Approved", content)

    send_html_email(subject, html_content, user.email) 

def send_otp_email(user, target_email=None):

    otp = generate_otp()

    user.otp = otp
    user.otp_created_at = timezone.now()
    user.otp_attempts = 0
    user.save()

    subject = "PUNDX - Your Verification Code"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;background:#f4f7fb;">
    <tr>
    <td align="center">

    <table width="600" style="background:white;border-radius:10px;overflow:hidden;box-shadow:0 5px 15px rgba(0,0,0,0.08);">

    <!-- HEADER -->
    <tr>
    <td style="background:#1E88E5;color:white;padding:20px;text-align:center;">
    <h1 style="margin:0;font-size:26px;">PUNDX</h1>
    <p style="margin:5px 0 0 0;font-size:13px;">Secure Savings & Lending Platform</p>
    </td>
    </tr>

    <!-- BODY -->
    <tr>
    <td style="padding:40px;text-align:center;">

    <h2 style="color:#1E88E5;margin-bottom:10px;">Verify Your Email</h2>

    <p style="color:#555;font-size:15px;">
    Hello {user.email},<br><br>
    Use the following OTP to verify your PUNDX account.
    </p>

    <!-- OTP BOX -->
    <div style="
    margin:30px auto;
    padding:18px;
    background:#f1f6ff;
    border:2px dashed #1E88E5;
    width:200px;
    font-size:34px;
    font-weight:bold;
    letter-spacing:6px;
    color:#1E88E5;">
    {otp}
    </div>

    <p style="font-size:14px;color:#666;">
    This code is valid for <b>5 minutes</b>.
    </p>

    <p style="font-size:13px;color:#999;margin-top:30px;">
    If you didn't request this OTP, please ignore this email.
    </p>

    </td>
    </tr>

    <!-- FOOTER -->
    <tr>
    <td style="background:#f5f7fa;text-align:center;padding:20px;font-size:12px;color:#777;">
    © 2026 PUNDX. All rights reserved.<br>
    Secure Financial Platform
    </td>
    </tr>

    </table>

    </td>
    </tr>
    </table>

    </body>
    </html>
    """

    send_html_email(subject, html_content, target_email or user.email)
