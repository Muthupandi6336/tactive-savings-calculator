"""
Email service for sending Tactive savings reports.

Supports two modes controlled by the EMAIL_MODE env var:
  - "mock"  → MockEmailService (logs to console, no real emails)
  - "smtp"  → RealEmailService (sends via SMTP/TLS)
"""

import logging
import os
import smtplib
from abc import ABC, abstractmethod
from email import encoders
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("tactive.email")


class BaseEmailService(ABC):
    """Abstract base for email services."""

    @abstractmethod
    async def send_report_email(
        self, to_email: str, name: str, pdf_bytes: bytes
    ) -> bool:
        """
        Send a PDF savings report via email.

        Args:
            to_email: Recipient email address.
            name: Recipient's name (used in the email body).
            pdf_bytes: The PDF report as raw bytes.

        Returns:
            True if the email was sent (or logged) successfully.
        """
        ...


class MockEmailService(BaseEmailService):
    """
    Development email service that logs to the console
    instead of sending real emails.
    """

    async def send_report_email(
        self, to_email: str, name: str, pdf_bytes: bytes
    ) -> bool:
        logger.info("=" * 60)
        logger.info("[MOCK EMAIL] Sending report email")
        logger.info(f"  To      : {to_email}")
        logger.info(f"  Name    : {name}")
        logger.info(f"  PDF size: {len(pdf_bytes):,} bytes")
        logger.info("=" * 60)
        return True


class RealEmailService(BaseEmailService):
    """
    Production email service that sends via SMTP with TLS.
    Reads configuration from environment variables.
    """

    def __init__(self):
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.from_email = os.getenv("FROM_EMAIL", self.smtp_user)

    async def send_report_email(
        self, to_email: str, name: str, pdf_bytes: bytes
    ) -> bool:
        try:
            msg = MIMEMultipart()
            msg["From"] = self.from_email
            msg["To"] = to_email
            msg["Subject"] = "Your Tactive Savings Report"

            body = (
                f"Hi {name},\n\n"
                "Thank you for using the Tactive Savings Calculator!\n\n"
                "Please find your personalised savings report attached. "
                "It details the estimated losses your project could face "
                "and how Tactive can help recover them.\n\n"
                "If you'd like a detailed demo, reply to this email or "
                "visit https://tactive.in\n\n"
                "Best regards,\n"
                "Team Tactive"
            )
            msg.attach(MIMEText(body, "plain"))

            # Attach PDF
            attachment = MIMEBase("application", "pdf")
            attachment.set_payload(pdf_bytes)
            encoders.encode_base64(attachment)
            attachment.add_header(
                "Content-Disposition",
                "attachment",
                filename="Tactive_Savings_Report.pdf",
            )
            msg.attach(attachment)

            # Send via SMTP
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)

            logger.info(f"[EMAIL] Report sent to {to_email}")
            return True

        except Exception:
            logger.exception(f"[EMAIL] Failed to send report to {to_email}")
            return False


def get_email_service() -> BaseEmailService:
    """
    Factory that returns the appropriate email service
    based on the EMAIL_MODE environment variable.
    """
    mode = os.getenv("EMAIL_MODE", "mock").lower()
    if mode == "smtp":
        return RealEmailService()
    return MockEmailService()
