from pydantic import BaseModel, EmailStr, Field
from typing import Dict, Any, Optional


class RegistrationCreate(BaseModel):
    """Schema for creating registration"""

    event_id: str
    email: EmailStr
    phone: str = Field(..., pattern=r"^\d{10}$")
    form_data: Dict[str, Any]  # Dynamic form data based on event fields


class RegistrationResponse(BaseModel):
    """Schema for registration response"""

    id: str
    event_id: str
    email: str
    phone: str
    form_data: Dict[str, Any]
    is_checked_in: bool
    checked_in_at: Optional[str]
    created_at: str


class UserProfileResponse(BaseModel):
    """Schema for user profile response (for auto-fill)"""

    email: str
    phone: Optional[str]
    profile_data: Dict[str, Any]


class CheckInRequest(BaseModel):
    """Schema for check-in request"""

    email: EmailStr
