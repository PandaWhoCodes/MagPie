"""Email service for sending registration confirmation emails"""

import logging
from typing import Optional, Dict, Any
from app.providers import get_email_provider

# Configure logging
logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        """Initialize the email service with configured provider"""
        try:
            self.provider = get_email_provider()
            logger.info(f"Email service initialized with {self.provider.get_provider_name()} provider")
        except ValueError as e:
            logger.error(f"Failed to initialize email service: {str(e)}")
            self.provider = None

    def send_registration_confirmation(
        self,
        to_email: str,
        name: str,
        event_name: str,
        registration_data: Optional[Dict[str, Any]] = None,
        event_details: Optional[Dict[str, Any]] = None,
        field_labels: Optional[Dict[str, str]] = None
    ) -> bool:
        """
        Send a registration confirmation email

        Args:
            to_email: Recipient email address
            name: Recipient name
            event_name: Name of the event
            registration_data: Additional registration details
            event_details: Event details (date, time, venue, address, map link)
            field_labels: Mapping of field_name -> field_label for full labels

        Returns:
            bool: True if email sent successfully, False otherwise
        """
        if not self.provider:
            logger.error("Cannot send email: Email provider not configured")
            return False

        try:
            # Create email HTML content
            html_content = self._create_confirmation_html(
                name, event_name, registration_data, event_details, field_labels
            )

            # Send email using configured provider
            result = self.provider.send_email(
                to_email=to_email,
                subject=f"Registration Confirmed - {event_name}",
                html_content=html_content
            )

            if result['success']:
                logger.info(f"Email sent successfully to {to_email}. Message ID: {result['message_id']}")
                return True
            else:
                logger.error(f"Failed to send email to {to_email}: {result['error']}")
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
        if not self.provider:
            logger.error("Cannot send email: Email provider not configured")
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

            result = self.provider.send_email(
                to_email=to_email,
                subject="Welcome to MagPie Events!",
                html_content=html_content
            )

            if result['success']:
                logger.info(f"Welcome email sent to {to_email}. Message ID: {result['message_id']}")
                return True
            else:
                logger.error(f"Failed to send welcome email to {to_email}: {result['error']}")
                return False

        except Exception as e:
            logger.error(f"Error sending welcome email to {to_email}: {str(e)}")
            return False

    def _format_time_12h(self, time_str: str) -> str:
        """Convert 24-hour time format to 12-hour format with AM/PM"""
        if not time_str:
            return ""
        try:
            # Handle both "HH:MM" and "HH:MM - HH:MM" formats
            def convert_single(t):
                t = t.strip()
                parts = t.split(":")
                hours = int(parts[0])
                minutes = parts[1] if len(parts) > 1 else "00"
                period = "PM" if hours >= 12 else "AM"
                display_hours = hours % 12 or 12
                return f"{display_hours}:{minutes} {period}"

            if "-" in time_str:
                start, end = time_str.split("-")
                return f"{convert_single(start)} - {convert_single(end)} IST"
            return f"{convert_single(time_str)} IST"
        except Exception:
            return time_str

    def _create_google_calendar_url(self, event_details: Dict[str, Any]) -> str:
        """Create a Google Calendar add event URL"""
        import urllib.parse
        from datetime import datetime

        if not event_details:
            return ""

        try:
            # Parse date (expected format: YYYY-MM-DD)
            date_str = event_details.get("date", "")
            time_str = event_details.get("time", "")

            # Parse start time
            start_hour, start_min = 9, 0  # default
            if time_str:
                time_part = time_str.split("-")[0].strip() if "-" in time_str else time_str
                time_parts = time_part.split(":")
                start_hour = int(time_parts[0])
                start_min = int(time_parts[1]) if len(time_parts) > 1 else 0

            # Parse end time (default: 2 hours after start)
            end_hour, end_min = start_hour + 2, start_min
            if time_str and "-" in time_str:
                end_part = time_str.split("-")[1].strip()
                end_parts = end_part.split(":")
                end_hour = int(end_parts[0])
                end_min = int(end_parts[1]) if len(end_parts) > 1 else 0

            # Build datetime strings (format: YYYYMMDDTHHMMSS)
            if date_str:
                date_parts = date_str.split("-")
                year, month, day = int(date_parts[0]), int(date_parts[1]), int(date_parts[2])
                start_dt = f"{year:04d}{month:02d}{day:02d}T{start_hour:02d}{start_min:02d}00"
                end_dt = f"{year:04d}{month:02d}{day:02d}T{end_hour:02d}{end_min:02d}00"
            else:
                return ""

            # Build location string
            location_parts = []
            if event_details.get("venue"):
                location_parts.append(event_details["venue"])
            if event_details.get("venue_address"):
                location_parts.append(event_details["venue_address"])
            location = ", ".join(location_parts)

            # Build Google Calendar URL
            params = {
                "action": "TEMPLATE",
                "text": event_details.get("name", "Event"),
                "dates": f"{start_dt}/{end_dt}",
                "ctz": "Asia/Kolkata",
                "details": f"You are registered for {event_details.get('name', 'this event')}.\n\nSee you there!",
                "location": location,
            }

            base_url = "https://calendar.google.com/calendar/render"
            return f"{base_url}?{urllib.parse.urlencode(params)}"
        except Exception as e:
            logger.error(f"Error creating Google Calendar URL: {e}")
            return ""

    def _create_confirmation_html(
        self,
        name: str,
        event_name: str,
        registration_data: Optional[Dict[str, Any]] = None,
        event_details: Optional[Dict[str, Any]] = None,
        field_labels: Optional[Dict[str, str]] = None
    ) -> str:
        """Create HTML content for registration confirmation email"""

        # Build event details section
        event_info_html = ""
        if event_details:
            formatted_time = self._format_time_12h(event_details.get("time", ""))
            venue = event_details.get("venue", "")
            venue_address = event_details.get("venue_address", "")
            map_link = event_details.get("venue_map_link", "")
            event_date = event_details.get("date", "")

            event_info_html = f"""
            <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #333; margin: 0 0 15px 0; font-size: 16px;">Event Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; color: #666; vertical-align: top; width: 30px;">📅</td>
                        <td style="padding: 8px 0; color: #333;"><strong>Date:</strong> {event_date}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666; vertical-align: top;">🕐</td>
                        <td style="padding: 8px 0; color: #333;"><strong>Time:</strong> {formatted_time}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666; vertical-align: top;">📍</td>
                        <td style="padding: 8px 0; color: #333;">
                            <strong>Venue:</strong> {venue}
                            {f'<br><span style="color: #666; font-size: 13px;">{venue_address}</span>' if venue_address else ''}
                            {f'<br><a href="{map_link}" style="color: #0066cc; text-decoration: none; font-size: 13px;">View on Google Maps →</a>' if map_link else ''}
                        </td>
                    </tr>
                </table>
            </div>
            """

        # Build registration details HTML if data provided
        details_html = ""
        if registration_data:
            details_items = []
            for key, value in registration_data.items():
                if key not in ['name', 'email'] and value:
                    # Use full field label from field_labels mapping, fallback to key
                    if field_labels and key in field_labels:
                        display_name = field_labels[key]
                    else:
                        # Fallback: convert underscores to spaces and title case
                        display_name = key.replace('_', ' ').title()
                    details_items.append(
                        f'<tr><td style="padding: 6px 0; color: #666; vertical-align: top;">'
                        f'<strong>{display_name}:</strong></td>'
                        f'<td style="padding: 6px 0 6px 10px; color: #333;">{value}</td></tr>'
                    )

            if details_items:
                details_html = f"""
                <div style="background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h3 style="color: #333; margin: 0 0 15px 0; font-size: 16px;">Your Registration Details</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        {''.join(details_items)}
                    </table>
                </div>
                """

        # Generate Google Calendar link
        calendar_url = self._create_google_calendar_url(event_details) if event_details else ""
        calendar_button_html = ""
        if calendar_url:
            calendar_button_html = f"""
            <div style="text-align: center; margin: 25px 0;">
                <a href="{calendar_url}" target="_blank" style="display: inline-block; background: #4285f4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">
                    📅 Add to Google Calendar
                </a>
            </div>
            """

        html_content = f"""
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
            <!-- Header -->
            <div style="text-align: center; padding: 20px 0;">
                <h1 style="color: #333; margin: 0; font-size: 28px;">Registration Confirmed!</h1>
            </div>

            <!-- Main Card -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border-radius: 12px; padding: 30px; margin: 20px 0; color: white; text-align: center;">
                <p style="font-size: 18px; margin: 0 0 10px 0; opacity: 0.9;">
                    Thank you, {name}!
                </p>
                <p style="font-size: 16px; margin: 10px 0; opacity: 0.9;">
                    You're successfully registered for
                </p>
                <h2 style="font-size: 24px; margin: 15px 0 0 0; font-weight: bold;">{event_name}</h2>
            </div>

            {event_info_html}

            {calendar_button_html}

            {details_html}

            <!-- What's Next -->
            <div style="background: #e8f4fd; border-left: 4px solid #0084ff; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; color: #333; font-size: 14px;">
                    <strong>What's Next?</strong><br>
                    Look out for a QR code that will be sent to you closer to the event date.
                    This will be your ticket for quick check-in!
                </p>
            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #666; font-size: 14px; margin: 0 0 10px 0;">
                    If you have any questions, please don't hesitate to contact us.
                </p>
                <p style="color: #999; font-size: 12px; margin: 0;">
                    © 2026 Build2Learn. All rights reserved.
                </p>
            </div>
        </div>
        """

        return html_content

# Create a singleton instance
email_service = EmailService()