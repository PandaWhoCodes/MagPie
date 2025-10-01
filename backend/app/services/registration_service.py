import uuid
import json
from typing import Optional
from app.core.database import db
from app.schemas.registration import (
    RegistrationCreate,
    RegistrationResponse,
    UserProfileResponse,
)


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

        return await RegistrationService.get_registration(registration_id)

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
        """Get user profile for auto-fill"""
        if email:
            profile = await db.fetch_one(
                "SELECT * FROM user_profiles WHERE email = ?", [email]
            )
        elif phone:
            profile = await db.fetch_one(
                "SELECT * FROM user_profiles WHERE phone = ?", [phone]
            )
        else:
            return None

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
