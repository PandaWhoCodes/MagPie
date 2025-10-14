"""
Email messaging service for bulk email sending
Handles bulk email sending to event registrants using configured provider
"""

import logging
from typing import List, Dict, Any, Optional
from app.core.database import db
from app.providers import get_email_provider

logger = logging.getLogger(__name__)


class EmailMessagingService:
    """Service for email messaging using configured provider"""

    def __init__(self):
        """Initialize email provider"""
        try:
            self.provider = get_email_provider()
            logger.info(f"Email messaging service initialized with {self.provider.get_provider_name()} provider")
        except ValueError as e:
            logger.error(f"Failed to initialize email messaging service: {str(e)}")
            raise

    def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str
    ) -> Dict[str, Any]:
        """
        Send a single email

        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: HTML content of the email

        Returns:
            Dict with status and error (if any)
        """
        try:
            result = self.provider.send_email(
                to_email=to_email,
                subject=subject,
                html_content=html_content
            )
            return result

        except Exception as e:
            return {
                "success": False,
                "message_id": None,
                "to": to_email,
                "error": str(e)
            }

    async def send_bulk_emails(
        self,
        event_id: str,
        subject: str,
        message: str,
        template_variables: Optional[Dict[str, str]] = None,
        send_to: str = "all",
        filter_field: Optional[str] = None,
        filter_value: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Send bulk emails to event registrants

        Args:
            event_id: Event ID to send emails for
            subject: Email subject
            message: Message text (can include {{variables}})
            template_variables: Variables to substitute in message
            send_to: "all" or "subset"
            filter_field: Field name to filter by (if send_to="subset")
            filter_value: Value to match for filtering (if send_to="subset")

        Returns:
            Summary of sent emails (success, failed, total)
        """
        try:
            # Get registrations from database with event name
            registrations = await db.fetch_all(
                """
                SELECT r.id, r.email, r.phone, r.form_data, e.name as event_name
                FROM registrations r
                JOIN events e ON r.event_id = e.id
                WHERE r.event_id = ?
                ORDER BY r.created_at DESC
                """,
                [event_id]
            )

            if not registrations:
                return {
                    "total": 0,
                    "sent": 0,
                    "failed": 0,
                    "results": []
                }

            # Filter registrations if needed
            filtered_registrations = []
            for reg in registrations:
                # Parse form_data JSON
                import json
                form_data = json.loads(reg.get('form_data', '{}'))

                # Add to list based on filter
                if send_to == "all":
                    filtered_registrations.append(reg)
                elif send_to == "subset" and filter_field and filter_value:
                    if form_data.get(filter_field) == filter_value:
                        filtered_registrations.append(reg)

            # Send emails
            results = []
            sent_count = 0
            failed_count = 0

            for reg in filtered_registrations:
                # Parse form_data for this registration
                import json
                form_data = json.loads(reg.get('form_data', '{}'))

                # Personalize message
                personalized_message = message

                # Replace template variables
                if template_variables:
                    for var_name, var_value in template_variables.items():
                        personalized_message = personalized_message.replace(
                            f"{{{{{var_name}}}}}",
                            str(var_value)
                        )

                # Replace form data variables
                for field_name, field_value in form_data.items():
                    if field_value:
                        personalized_message = personalized_message.replace(
                            f"{{{{{field_name}}}}}",
                            str(field_value)
                        )

                # Also replace email and phone from registration
                personalized_message = personalized_message.replace("{{email}}", reg.get('email', ''))
                personalized_message = personalized_message.replace("{{phone}}", reg.get('phone', '') or '')

                # Create HTML content with header and footer
                html_content = f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                border-radius: 10px 10px 0 0; padding: 30px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">MagPie Events</h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
                            {reg.get('event_name', 'Event')}
                        </p>
                    </div>

                    <!-- Main Content -->
                    <div style="background: white; padding: 30px; border-left: 1px solid #e5e7eb;
                                border-right: 1px solid #e5e7eb;">
                        <div style="white-space: pre-wrap; line-height: 1.6; color: #374151;">
{personalized_message}
                        </div>
                    </div>

                    <!-- Footer -->
                    <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb;
                                border-radius: 0 0 10px 10px; text-align: center;">
                        <p style="color: #6b7280; font-size: 14px; margin: 0;">
                            Thank you for registering with MagPie Event Platform
                        </p>
                        <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
                            © 2024 MagPie Events. All rights reserved.
                        </p>
                    </div>
                </div>
                """

                # Send email
                result = self.send_email(
                    to_email=reg.get('email', ''),
                    subject=subject,
                    html_content=html_content
                )

                if result['success']:
                    sent_count += 1
                else:
                    failed_count += 1

                results.append({
                    "email": reg.get('email', ''),
                    "success": result['success'],
                    "message_id": result.get('message_id'),
                    "error": result.get('error')
                })

            return {
                "total": len(filtered_registrations),
                "sent": sent_count,
                "failed": failed_count,
                "results": results
            }

        except Exception as e:
            logger.error(f"Error sending bulk emails: {str(e)}")
            raise

    async def get_field_distinct_values(
        self,
        event_id: str,
        field_name: str
    ) -> List[str]:
        """
        Get distinct values for a field from event registrations

        Args:
            event_id: Event ID
            field_name: Field name to get distinct values for

        Returns:
            List of distinct values
        """
        try:
            query = """
                SELECT form_data
                FROM registrations
                WHERE event_id = ?
            """
            result = await db.execute(query, [event_id])
            rows = result.fetchall()

            # Extract unique values for the field
            values = set()
            import json
            for row in rows:
                # Row is a tuple, form_data is the first element
                form_data_json = row[0] if row else None
                if form_data_json:
                    form_data = json.loads(form_data_json)
                    value = form_data.get(field_name)
                    if value and value != '':
                        values.add(str(value))

            return sorted(list(values))

        except Exception as e:
            logger.error(f"Error getting field values: {str(e)}")
            raise