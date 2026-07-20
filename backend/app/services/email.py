import json
import urllib.request
import urllib.error
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.api_url = "https://next-api.useplunk.com/v1/send"
        self.secret_key = settings.PLUNK_SECRET_KEY

    def send_email(self, to_email: str, subject: str, body: str) -> bool:
        if not self.secret_key:
            logger.warning("PLUNK_SECRET_KEY is not set. Email not sent.")
            return False

        data = {
            "from": settings.SMTP_EMAIL or "noreply@leadsin.im",
            "to": to_email,
            "subject": subject,
            "body": body
        }
        
        req = urllib.request.Request(self.api_url, method="POST")
        req.add_header("Content-Type", "application/json")
        req.add_header("Authorization", f"Bearer {self.secret_key}")
        
        try:
            json_data = json.dumps(data).encode("utf-8")
            with urllib.request.urlopen(req, data=json_data) as response:
                if response.status in (200, 202, 201):
                    logger.info(f"Successfully sent email to {to_email}")
                    return True
                else:
                    logger.error(f"Failed to send email to {to_email}. Status code: {response.status}")
                    raise ValueError(f"Plunk API failed with status {response.status}")
        except urllib.error.HTTPError as e:
            error_message = e.read().decode("utf-8")
            logger.error(f"HTTPError sending email to {to_email}: {e.code} - {error_message}")
            print(f"PLUNK API ERROR: {e.code} - {error_message}") # explicitly print for logs
            raise ValueError(f"Plunk API Error: {error_message}")
        except urllib.error.URLError as e:
            logger.error(f"URLError sending email to {to_email}: {e.reason}")
            raise ValueError(f"Plunk URL Error: {e.reason}")
        except Exception as e:
            logger.error(f"Unexpected error sending email to {to_email}: {str(e)}")
            raise ValueError(f"Unexpected error: {str(e)}")

    def send_verification_email(self, to_email: str, token: str) -> bool:
        # Assuming frontend runs on localhost:3000 for local dev
        # In a real app this should come from a config FRONTEND_URL
        frontend_url = "http://localhost:3000"
        verification_link = f"{frontend_url}/verify-email?token={token}"
        
        subject = "Welcome to LogistiCore - Please verify your email"
        body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2>Welcome to LogistiCore!</h2>
            <p>Thank you for signing up. Please verify your email address by clicking the link below:</p>
            <p style="margin: 30px 0;">
                <a href="{verification_link}" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Verify Email Address</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p><a href="{verification_link}">{verification_link}</a></p>
            <p>This link will expire in 24 hours.</p>
            <p>If you did not create an account, no further action is required.</p>
        </body>
        </html>
        """
        
        return self.send_email(to_email=to_email, subject=subject, body=body)

email_service = EmailService()
