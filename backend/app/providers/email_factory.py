"""
Email provider factory
Creates and configures the appropriate email provider based on environment configuration
"""

import os
import logging
from typing import Optional
from dotenv import load_dotenv

from .email_provider import EmailProvider
from .resend_provider import ResendEmailProvider
from .brevo_provider import BrevoEmailProvider

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)


class EmailProviderFactory:
    """Factory for creating email providers"""

    # Supported providers
    RESEND = "resend"
    BREVO = "brevo"

    _instance: Optional[EmailProvider] = None

    @classmethod
    def get_provider(cls) -> EmailProvider:
        """
        Get the configured email provider instance (singleton)

        Returns:
            EmailProvider instance based on EMAIL_PROVIDER environment variable

        Raises:
            ValueError: If provider is not supported or not configured properly
        """
        # Return cached instance if available
        if cls._instance is not None:
            return cls._instance

        # Get provider from environment (default to brevo)
        provider_name = os.getenv('EMAIL_PROVIDER', 'brevo').lower()

        logger.info(f"Initializing email provider: {provider_name}")

        # Create provider based on configuration
        if provider_name == cls.RESEND:
            cls._instance = cls._create_resend_provider()
        elif provider_name == cls.BREVO:
            cls._instance = cls._create_brevo_provider()
        else:
            raise ValueError(
                f"Unsupported email provider: {provider_name}. "
                f"Supported providers: {cls.RESEND}, {cls.BREVO}"
            )

        # Verify provider is configured
        if not cls._instance.is_configured():
            logger.error(
                f"{cls._instance.get_provider_name()} provider not properly configured. "
                "Check your environment variables."
            )
            raise ValueError(
                f"{cls._instance.get_provider_name()} provider not configured. "
                "Please check your environment variables."
            )

        logger.info(f"Email provider '{cls._instance.get_provider_name()}' initialized successfully")
        return cls._instance

    @classmethod
    def _create_resend_provider(cls) -> ResendEmailProvider:
        """Create and configure Resend provider"""
        api_key = os.getenv('RESEND_API_KEY')
        from_email = os.getenv('RESEND_FROM_EMAIL', 'onboarding@resend.dev')

        if not api_key:
            logger.warning("RESEND_API_KEY not found in environment variables")

        return ResendEmailProvider(
            api_key=api_key,
            from_email=from_email
        )

    @classmethod
    def _create_brevo_provider(cls) -> BrevoEmailProvider:
        """Create and configure Brevo provider"""
        api_key = os.getenv('BREVO_API_KEY')
        from_email = os.getenv('BREVO_FROM_EMAIL', 'noreply@yourdomain.com')
        from_name = os.getenv('BREVO_FROM_NAME', 'MagPie Events')

        if not api_key:
            logger.warning("BREVO_API_KEY not found in environment variables")

        return BrevoEmailProvider(
            api_key=api_key,
            from_email=from_email,
            from_name=from_name
        )

    @classmethod
    def reset(cls):
        """Reset the singleton instance (useful for testing)"""
        cls._instance = None


# Convenience function to get provider
def get_email_provider() -> EmailProvider:
    """
    Get the configured email provider

    Returns:
        EmailProvider instance

    Raises:
        ValueError: If provider is not supported or not configured properly
    """
    return EmailProviderFactory.get_provider()
