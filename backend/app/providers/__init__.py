"""
Email provider package
Provides a flexible email provider system with support for multiple providers
"""

from .email_provider import EmailProvider
from .resend_provider import ResendEmailProvider
from .brevo_provider import BrevoEmailProvider
from .email_factory import EmailProviderFactory, get_email_provider

__all__ = [
    'EmailProvider',
    'ResendEmailProvider',
    'BrevoEmailProvider',
    'EmailProviderFactory',
    'get_email_provider'
]
