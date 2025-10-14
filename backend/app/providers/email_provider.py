"""
Base email provider interface
Defines the contract that all email providers must implement
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional


class EmailProvider(ABC):
    """Abstract base class for email providers"""

    @abstractmethod
    def __init__(self, **config):
        """
        Initialize the email provider with configuration

        Args:
            **config: Provider-specific configuration parameters
        """
        pass

    @abstractmethod
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
        Send a single email

        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: HTML content of the email
            from_email: Sender email (optional, uses default if not provided)
            from_name: Sender name (optional)
            text_content: Plain text version of email (optional)

        Returns:
            Dict with the following structure:
            {
                "success": bool,
                "message_id": str or None,
                "to": str,
                "error": str or None
            }
        """
        pass

    @abstractmethod
    def get_provider_name(self) -> str:
        """
        Get the name of the email provider

        Returns:
            str: Provider name (e.g., "Resend", "Brevo")
        """
        pass

    @abstractmethod
    def is_configured(self) -> bool:
        """
        Check if the provider is properly configured

        Returns:
            bool: True if provider is ready to send emails, False otherwise
        """
        pass
