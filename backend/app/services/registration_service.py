import uuid
import json
import logging
from typing import Optional
from app.core.database import db
from app.schemas.registration import (
    RegistrationCreate,
    RegistrationResponse,
    UserProfileResponse,
)
from app.services.email_service import email_service

logger = logging.getLogger(__name__)


class RegistrationService:
    """Service for registration management"""

    @staticmethod
    async def create_registration(
        registration_data: RegistrationCreate,
    ) -> RegistrationResponse:
        """Create a new registration"""
        registration_id = str(uuid.uuid4())

        # Insert registration
        await db.execute(
            """
            INSERT INTO registrations (id, event_id, email, phone, form_data)
            VALUES (?, ?, ?, ?, ?)
        """,
            [
                registration_id,
                registration_data.event_id,
                registration_data.email,
                registration_data.phone,
                json.dumps(registration_data.form_data),
            ],
        )

        # Update or create user profile for auto-fill feature
        await RegistrationService.update_user_profile(
            registration_data.email,
            registration_data.phone,
            registration_data.form_data,
        )

        # Send confirmation email
        await RegistrationService._send_confirmation_email(
            registration_data.event_id,
            registration_data.email,
            registration_data.form_data,
        )

        return await RegistrationService.get_registration(registration_id)

    @staticmethod
    async def get_event_registration_status(event_id: str) -> Optional[dict]:
        """Get event registration status by event ID."""
        event = await db.fetch_one(
            "SELECT id, registrations_open FROM events WHERE id = ?",
            [event_id],
        )
        if not event:
            return None

        return {
            "id": event["id"],
            "registrations_open": True if event["registrations_open"] is None else bool(event["registrations_open"]),
        }

    @staticmethod
    async def get_registration(registration_id: str) -> Optional[RegistrationResponse]:
        """Get registration by ID"""
        reg = await db.fetch_one(
            "SELECT * FROM registrations WHERE id = ?", [registration_id]
        )
        if not reg:
            return None

        return RegistrationResponse(
            id=reg["id"],
            event_id=reg["event_id"],
            email=reg["email"],
            phone=reg["phone"],
            form_data=json.loads(reg["form_data"]),
            is_checked_in=bool(reg["is_checked_in"]),
            checked_in_at=reg["checked_in_at"],
            created_at=reg["created_at"],
        )

    @staticmethod
    async def get_user_profile(
        email: Optional[str] = None, phone: Optional[str] = None
    ) -> Optional[UserProfileResponse]:
        """Get user profile for auto-fill - requires both email AND phone to match"""
        # Both email and phone are required for auto-fill
        if not email or not phone:
            return None

        # Look up profile where both email AND phone match
        profile = await db.fetch_one(
            "SELECT * FROM user_profiles WHERE email = ? AND phone = ?",
            [email, phone]
        )

        if not profile:
            return None

        return UserProfileResponse(
            email=profile["email"],
            phone=profile["phone"],
            profile_data=json.loads(profile["profile_data"]),
        )

    @staticmethod
    async def update_user_profile(
        email: str, phone: str, form_data: dict
    ) -> None:
        """Update or create user profile"""
        profile_id = str(uuid.uuid4())

        # Check if profile exists
        existing = await db.fetch_one(
            "SELECT id FROM user_profiles WHERE email = ?", [email]
        )

        if existing:
            # Update existing profile
            await db.execute(
                """
                UPDATE user_profiles
                SET phone = ?, profile_data = ?, last_updated = CURRENT_TIMESTAMP
                WHERE email = ?
            """,
                [phone, json.dumps(form_data), email],
            )
        else:
            # Create new profile
            await db.execute(
                """
                INSERT INTO user_profiles (id, email, phone, profile_data)
                VALUES (?, ?, ?, ?)
            """,
                [profile_id, email, phone, json.dumps(form_data)],
            )

    @staticmethod
    async def check_in_user(event_id: str, email: str) -> bool:
        """Check in a user for an event"""
        # Find registration
        reg = await db.fetch_one(
            "SELECT id FROM registrations WHERE event_id = ? AND email = ?",
            [event_id, email],
        )

        if not reg:
            return False

        # Update check-in status
        await db.execute(
            """
            UPDATE registrations
            SET is_checked_in = 1, checked_in_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """,
            [reg["id"]],
        )

        return True

    @staticmethod
    async def is_user_registered(event_id: str, email: str) -> bool:
        """Check if user is already registered for an event"""
        reg = await db.fetch_one(
            "SELECT id FROM registrations WHERE event_id = ? AND email = ?",
            [event_id, email],
        )
        return reg is not None

    @staticmethod
    async def _send_confirmation_email(
        event_id: str, email: str, form_data: dict
    ) -> None:
        """Send registration confirmation email"""
        try:
            # Get full event details for email
            event = await db.fetch_one(
                "SELECT name, date, time, venue, venue_address, venue_map_link FROM events WHERE id = ?",
                [event_id]
            )

            if not event:
                logger.warning(f"Event {event_id} not found for confirmation email")
                return

            event_name = event["name"]

            # Build event details dict
            event_details = {
                "name": event_name,
                "date": event["date"],
                "time": event["time"],
                "venue": event["venue"],
                "venue_address": event["venue_address"],
                "venue_map_link": event["venue_map_link"],
            }

            # Get event fields for label mapping (field_name -> field_label)
            event_fields = await db.fetch_all(
                "SELECT field_name, field_label FROM event_fields WHERE event_id = ?",
                [event_id]
            )
            field_labels = {f["field_name"]: f["field_label"] for f in event_fields}

            # Get user's name from form_data
            name = form_data.get("name", form_data.get("full_name", "Participant"))

            # Send confirmation email (non-blocking, don't fail registration if email fails)
            success = email_service.send_registration_confirmation(
                to_email=email,
                name=name,
                event_name=event_name,
                registration_data=form_data,
                event_details=event_details,
                field_labels=field_labels,
            )

            if success:
                logger.info(f"Confirmation email sent to {email} for event {event_name}")
            else:
                logger.warning(f"Failed to send confirmation email to {email}")

        except Exception as e:
            # Log error but don't fail the registration
            logger.error(f"Error sending confirmation email to {email}: {str(e)}")
