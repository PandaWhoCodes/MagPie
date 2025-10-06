"""
WhatsApp messaging service using Twilio API
Handles bulk messaging to event registrants
"""

import os
import re
import json
from typing import List, Dict, Any, Optional
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException
from app.core.database import db
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class WhatsAppService:
    """Service for WhatsApp messaging via Twilio"""

    def __init__(self):
        """Initialize Twilio client"""
        self.account_sid = os.getenv('TWILIO_ACCOUNT_SID')
        self.auth_token = os.getenv('TWILIO_AUTH_TOKEN')
        self.whatsapp_number = os.getenv('TWILIO_WHATSAPP_NUMBER', 'whatsapp:+14155238886')

        if not self.account_sid or not self.auth_token:
            raise ValueError("Twilio credentials not found in environment variables")

        self.client = Client(self.account_sid, self.auth_token)

    @staticmethod
    def format_phone_number(phone: str) -> str:
        """
        Format phone number for WhatsApp
        - If no + prefix, add +91 (India)
        - If already has +, keep as is
        - Add whatsapp: prefix for Twilio
        """
        # Remove any whitespace
        phone = phone.strip()

        # If already has +, use as is
        if phone.startswith('+'):
            return f"whatsapp:{phone}"

        # If no +, add +91 for India
        return f"whatsapp:+91{phone}"

    def send_message(self, to_number: str, message: str) -> Dict[str, Any]:
        """
        Send a single WhatsApp message

        Args:
            to_number: Phone number (will be formatted automatically)
            message: Message text to send

        Returns:
            Dict with status, message_sid, and error (if any)
        """
        try:
            # Format phone number
            formatted_number = self.format_phone_number(to_number)

            # Send message via Twilio
            twilio_message = self.client.messages.create(
                from_=self.whatsapp_number,
                body=message,
                to=formatted_number
            )

            return {
                "success": True,
                "message_sid": twilio_message.sid,
                "status": twilio_message.status,
                "to": formatted_number,
                "error": None
            }

        except TwilioRestException as e:
            return {
                "success": False,
                "message_sid": None,
                "status": "failed",
                "to": to_number,
                "error": str(e)
            }
        except Exception as e:
            return {
                "success": False,
                "message_sid": None,
                "status": "failed",
                "to": to_number,
                "error": f"Unexpected error: {str(e)}"
            }

    async def send_bulk_messages(
        self,
        event_id: str,
        message: str,
        filter_field: Optional[str] = None,
        filter_value: Optional[str] = None,
        template_variables: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Send WhatsApp messages to all or subset of registrants of an event

        Args:
            event_id: Event ID to send messages for
            message: Message text to send (can contain {{variables}})
            filter_field: Field name to filter registrations by (optional)
            filter_value: Value to match for filtering (optional)
            template_variables: Dict of global variable substitutions (optional)

        Returns:
            Dict with summary of sent messages (success, failed, total)
        """
        # Get all registrations for the event
        registrations = await db.fetch_all(
            """
            SELECT id, email, phone, form_data
            FROM registrations
            WHERE event_id = ?
            ORDER BY created_at DESC
            """,
            [event_id]
        )

        if not registrations:
            return {
                "success": False,
                "total": 0,
                "sent": 0,
                "failed": 0,
                "results": [],
                "error": "No registrations found for this event"
            }

        # Filter registrations if filter_field and filter_value are provided
        if filter_field and filter_value:
            filtered_registrations = []
            for reg in registrations:
                form_data = json.loads(reg.get('form_data', '{}'))
                if form_data.get(filter_field) == filter_value:
                    filtered_registrations.append(reg)
            registrations = filtered_registrations

        if not registrations:
            return {
                "success": False,
                "total": 0,
                "sent": 0,
                "failed": 0,
                "results": [],
                "error": f"No registrations found matching filter: {filter_field}={filter_value}"
            }

        # Send messages to all filtered registrants
        results = []
        sent_count = 0
        failed_count = 0

        for reg in registrations:
            phone = reg.get('phone', '')
            form_data = json.loads(reg.get('form_data', '{}'))

            # Prepare message with variable substitution
            personalized_message = message

            # First apply global template variables
            if template_variables:
                for var_name, var_value in template_variables.items():
                    personalized_message = personalized_message.replace(f"{{{{{var_name}}}}}", str(var_value))

            # Then apply per-user variables from form_data
            for field_name, field_value in form_data.items():
                personalized_message = personalized_message.replace(f"{{{{{field_name}}}}}", str(field_value))

            # Send message
            result = self.send_message(phone, personalized_message)

            # Track result
            if result['success']:
                sent_count += 1
            else:
                failed_count += 1

            # Store result with registration info
            results.append({
                "registration_id": reg['id'],
                "email": reg['email'],
                "phone": phone,
                "status": result['status'],
                "message_sid": result['message_sid'],
                "error": result['error']
            })

        return {
            "success": True,
            "total": len(registrations),
            "sent": sent_count,
            "failed": failed_count,
            "results": results
        }

    async def get_event_registrants_count(self, event_id: str) -> int:
        """Get count of registrants for an event"""
        result = await db.fetch_one(
            "SELECT COUNT(*) as count FROM registrations WHERE event_id = ?",
            [event_id]
        )
        return result['count'] if result else 0

    async def get_distinct_field_values(self, event_id: str, field_name: str) -> List[str]:
        """Get distinct values for a field from all registrations of an event"""
        registrations = await db.fetch_all(
            """
            SELECT form_data
            FROM registrations
            WHERE event_id = ?
            """,
            [event_id]
        )

        distinct_values = set()
        for reg in registrations:
            form_data = json.loads(reg.get('form_data', '{}'))
            value = form_data.get(field_name)
            if value:
                distinct_values.add(str(value))

        return sorted(list(distinct_values))
