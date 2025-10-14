"""
Resend email provider implementation
"""

import logging
from typing import Dict, Any, Optional
import resend
from .email_provider import EmailProvider

logger = logging.getLogger(__name__)


class ResendEmailProvider(EmailProvider):
    """Resend email provider implementation"""

    def __init__(self, api_key: str, from_email: str = "onboarding@resend.dev", **config):
        """
        Initialize Resend provider

        Args:
            api_key: Resend API key
            from_email: Default sender email address
            **config: Additional configuration
        """
        self.api_key = api_key
        self.from_email = from_email
        self._configured = False

        if self.api_key:
            resend.api_key = self.api_key
            self._configured = True
            logger.info("Resend email provider initialized")
        else:
            logger.warning("Resend API key not provided")

    def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        from_email: Optional[str] = None,
        from_name: Optional[str] = None,
        text_content: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Send email using Resend

        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: HTML content of the email
            from_email: Sender email (optional, uses default if not provided)
            from_name: Sender name (optional, ignored by Resend)
            text_content: Plain text version (optional, ignored by Resend)

        Returns:
            Dict with success status, message_id, and error info
        """
        if not self._configured:
            return {
                "success": False,
                "message_id": None,
                "to": to_email,
                "error": "Resend provider not configured (missing API key)"
            }

        try:
            # Use provided from_email or default
            sender = from_email or self.from_email

            # Send email
            response = resend.Emails.send({
                "from": sender,
                "to": to_email,
                "subject": subject,
                "html": html_content
            })

            if response and response.get('id'):
                logger.info(f"Resend: Email sent to {to_email}, ID: {response['id']}")
                return {
                    "success": True,
                    "message_id": response['id'],
                    "to": to_email,
                    "error": None
                }
            else:
                logger.error(f"Resend: Failed to send email to {to_email}: {response}")
                return {
                    "success": False,
                    "message_id": None,
                    "to": to_email,
                    "error": f"Failed to send email: {response}"
                }

        except Exception as e:
            logger.error(f"Resend: Error sending email to {to_email}: {str(e)}")
            return {
                "success": False,
                "message_id": None,
                "to": to_email,
                "error": str(e)
            }

    def get_provider_name(self) -> str:
        """Get provider name"""
        return "Resend"

    def is_configured(self) -> bool:
        """Check if provider is configured"""
        return self._configured
