import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings


class EmailService:
    """Service for sending emails via SMTP (used for OTP password reset)."""

    @staticmethod
    def send_otp_email(to_email: str, otp_code: str, user_name: str = "User") -> bool:
        """Send an OTP code to the user's email for password reset."""
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = f"🔐 Password Reset OTP – {settings.EMAILS_FROM_NAME}"
            msg["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.SMTP_USERNAME}>"
            msg["To"] = to_email

            # Plain-text fallback
            text_body = (
                f"Hi {user_name},\n\n"
                f"Your password reset OTP is: {otp_code}\n\n"
                f"This code will expire in {settings.OTP_EXPIRE_MINUTES} minutes.\n"
                f"If you didn't request this, please ignore this email.\n\n"
                f"– {settings.EMAILS_FROM_NAME}"
            )

            # HTML email body
            html_body = f"""
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #0f172a; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b;">
                <div style="background: linear-gradient(135deg, #16a34a 0%, #059669 50%, #0d9488 100%); padding: 32px 24px; text-align: center;">
                    <div style="font-size: 36px; margin-bottom: 8px;">🌱</div>
                    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 700;">{settings.EMAILS_FROM_NAME}</h1>
                    <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px;">Password Reset Request</p>
                </div>
                <div style="padding: 32px 24px;">
                    <p style="color: #cbd5e1; font-size: 15px; margin: 0 0 20px;">Hi <strong style="color: #e2e8f0;">{user_name}</strong>,</p>
                    <p style="color: #94a3b8; font-size: 14px; margin: 0 0 24px;">We received a request to reset your password. Use the OTP code below to proceed:</p>
                    <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 24px;">
                        <span style="font-size: 36px; font-weight: 700; letter-spacing: 10px; color: #4ade80; font-family: 'Courier New', monospace;">{otp_code}</span>
                    </div>
                    <p style="color: #64748b; font-size: 13px; margin: 0 0 8px;">⏱ This code expires in <strong style="color: #94a3b8;">{settings.OTP_EXPIRE_MINUTES} minutes</strong>.</p>
                    <p style="color: #64748b; font-size: 13px; margin: 0;">If you didn't request this, you can safely ignore this email.</p>
                </div>
                <div style="padding: 16px 24px; border-top: 1px solid #1e293b; text-align: center;">
                    <p style="color: #475569; font-size: 12px; margin: 0;">© 2026 {settings.EMAILS_FROM_NAME}. All rights reserved.</p>
                </div>
            </div>
            """

            msg.attach(MIMEText(text_body, "plain"))
            msg.attach(MIMEText(html_body, "html"))

            with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
                server.sendmail(settings.SMTP_USERNAME, to_email, msg.as_string())

            return True
        except Exception as e:
            print(f"[EmailService] Failed to send OTP email to {to_email}: {e}")
            return False
