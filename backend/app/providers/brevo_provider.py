"""
Brevo (formerly Sendinblue) email provider implementation
"""

import logging
from typing import Dict, Any, Optional
import brevo_python
from brevo_python.rest import ApiException
from .email_provider import EmailProvider

logger = logging.getLogger(__name__)


class BrevoEmailProvider(EmailProvider):
    """Brevo email provider implementation"""

    def __init__(
        self,
        api_key: str,
        from_email: str = "noreply@yourdomain.com",
        from_name: str = "MagPie Events",
        **config
    ):
        """
        Initialize Brevo provider

        Args:
            api_key: Brevo API key
            from_email: Default sender email address
            from_name: Default sender name
            **config: Additional configuration
        """
        self.api_key = api_key
        self.from_email = from_email
        self.from_name = from_name
        self._configured = False
        self.api_instance = None

        if self.api_key:
            try:
                # Configure API client
                configuration = brevo_python.Configuration()
                configuration.api_key['api-key'] = self.api_key

                # Create API instance
                self.api_instance = brevo_python.TransactionalEmailsApi(
                    brevo_python.ApiClient(configuration)
                )
                self._configured = True
                logger.info("Brevo email provider initialized")
            except Exception as e:
                logger.error(f"Failed to initialize Brevo provider: {str(e)}")
                self._configured = False
        else:
            logger.warning("Brevo API key not provided")

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
        Send email using Brevo

        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: HTML content of the email
            from_email: Sender email (optional, uses default if not provided)
            from_name: Sender name (optional, uses default if not provided)
            text_content: Plain text version of email (optional)

        Returns:
            Dict with success status, message_id, and error info
        """
        if not self._configured or not self.api_instance:
            return {
                "success": False,
                "message_id": None,
                "to": to_email,
                "error": "Brevo provider not configured (missing API key or initialization failed)"
            }

        try:
            # Use provided values or defaults
            sender_email = from_email or self.from_email
            sender_name = from_name or self.from_name

            # Create email object
            send_smtp_email = brevo_python.SendSmtpEmail(
                to=[{
                    "email": to_email
                }],
                sender={
                    "name": sender_name,
                    "email": sender_email
                },
                subject=subject,
                html_content=html_content
            )

            # Add text content if provided
            if text_content:
                send_smtp_email.text_content = text_content

            # Send email
            api_response = self.api_instance.send_transac_email(send_smtp_email)

            # Brevo returns a response with message_id
            message_id = getattr(api_response, 'message_id', None)

            logger.info(f"Brevo: Email sent to {to_email}, ID: {message_id}")
            return {
                "success": True,
                "message_id": message_id,
                "to": to_email,
                "error": None
            }

        except ApiException as e:
            error_msg = f"Status: {e.status}, Reason: {e.reason}"
            if hasattr(e, 'body'):
                error_msg += f", Body: {e.body}"

            logger.error(f"Brevo: API error sending email to {to_email}: {error_msg}")
            return {
                "success": False,
                "message_id": None,
                "to": to_email,
                "error": error_msg
            }

        except Exception as e:
            logger.error(f"Brevo: Error sending email to {to_email}: {str(e)}")
            return {
                "success": False,
                "message_id": None,
                "to": to_email,
                "error": str(e)
            }

    def get_provider_name(self) -> str:
        """Get provider name"""
        return "Brevo"

    def is_configured(self) -> bool:
        """Check if provider is configured"""
        return self._configured
