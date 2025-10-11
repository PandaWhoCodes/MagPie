"""Email service using Resend for sending registration confirmation emails"""

import resend
import logging
from typing import Optional, Dict, Any
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        """Initialize the Resend email service"""
        self.api_key = os.getenv('RESEND_API_KEY')
        self.from_email = os.getenv('RESEND_FROM_EMAIL', 'onboarding@resend.dev')

        if self.api_key:
            resend.api_key = self.api_key
            logger.info("Resend email service initialized")
        else:
            logger.warning("RESEND_API_KEY not found in environment variables")

    def send_registration_confirmation(
        self,
        to_email: str,
        name: str,
        event_name: str,
        registration_data: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Send a registration confirmation email

        Args:
            to_email: Recipient email address
            name: Recipient name
            event_name: Name of the event
            registration_data: Additional registration details

        Returns:
            bool: True if email sent successfully, False otherwise
        """
        if not self.api_key:
            logger.error("Cannot send email: RESEND_API_KEY not configured")
            return False

        try:
            # Create email HTML content
            html_content = self._create_confirmation_html(name, event_name, registration_data)

            # Send email using Resend
            response = resend.Emails.send({
                "from": self.from_email,
                "to": to_email,
                "subject": f"Registration Confirmed - {event_name}",
                "html": html_content
            })

            if response.get('id'):
                logger.info(f"Email sent successfully to {to_email}. Message ID: {response['id']}")
                return True
            else:
                logger.error(f"Failed to send email to {to_email}: {response}")
                return False

        except Exception as e:
            logger.error(f"Error sending email to {to_email}: {str(e)}")
            return False

    def send_welcome_email(self, to_email: str, name: str) -> bool:
        """
        Send a welcome email to new users

        Args:
            to_email: Recipient email address
            name: Recipient name

        Returns:
            bool: True if email sent successfully, False otherwise
        """
        if not self.api_key:
            logger.error("Cannot send email: RESEND_API_KEY not configured")
            return False

        try:
            html_content = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #333; text-align: center;">Welcome to MagPie Events!</h1>
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            border-radius: 10px; padding: 30px; margin: 20px 0; color: white;">
                    <h2>Hello {name}! 👋</h2>
                    <p style="font-size: 16px; line-height: 1.6;">
                        Welcome to MagPie Event Registration Platform! We're excited to have you join our community.
                    </p>
                    <p style="font-size: 16px; line-height: 1.6;">
                        You can now easily register for events, get QR codes for check-in, and manage your registrations.
                    </p>
                </div>
                <div style="text-align: center; margin-top: 30px;">
                    <p style="color: #666;">Thank you for choosing MagPie!</p>
                </div>
            </div>
            """

            response = resend.Emails.send({
                "from": self.from_email,
                "to": to_email,
                "subject": "Welcome to MagPie Events!",
                "html": html_content
            })

            if response.get('id'):
                logger.info(f"Welcome email sent to {to_email}. Message ID: {response['id']}")
                return True
            else:
                logger.error(f"Failed to send welcome email to {to_email}: {response}")
                return False

        except Exception as e:
            logger.error(f"Error sending welcome email to {to_email}: {str(e)}")
            return False

    def _create_confirmation_html(
        self,
        name: str,
        event_name: str,
        registration_data: Optional[Dict[str, Any]] = None
    ) -> str:
        """Create HTML content for registration confirmation email"""

        # Build registration details HTML if data provided
        details_html = ""
        if registration_data:
            details_items = []
            for key, value in registration_data.items():
                if key not in ['name', 'email'] and value:
                    # Convert field names to readable format
                    field_name = key.replace('_', ' ').title()
                    details_items.append(f"<li><strong>{field_name}:</strong> {value}</li>")

            if details_items:
                details_html = f"""
                <div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h3 style="color: #333; margin-bottom: 15px;">Registration Details</h3>
                    <ul style="list-style: none; padding: 0; margin: 0; color: #666;">
                        {''.join(details_items)}
                    </ul>
                </div>
                """

        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333; text-align: center;">Registration Confirmed! 🎉</h1>

            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border-radius: 10px; padding: 30px; margin: 20px 0; color: white; text-align: center;">
                <h2>Thank you, {name}!</h2>
                <p style="font-size: 18px; margin: 10px 0;">
                    You're successfully registered for
                </p>
                <h3 style="font-size: 24px; margin: 15px 0;">{event_name}</h3>
            </div>

            {details_html}

            <div style="background: #e8f4fd; border-left: 4px solid #0084ff; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #333;">
                    <strong>What's Next?</strong><br>
                    Look out for a QR code that will be sent to you closer to the event date.
                    This will be your ticket for quick check-in!
                </p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 14px;">
                    If you have any questions, please don't hesitate to contact us.
                </p>
                <p style="color: #999; font-size: 12px; margin-top: 10px;">
                    © 2024 MagPie Event Registration Platform. All rights reserved.
                </p>
            </div>
        </div>
        """

        return html_content

# Create a singleton instance
email_service = EmailService()