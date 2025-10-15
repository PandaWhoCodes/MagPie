from pydantic import BaseModel
from typing import Optional


class QRCodeCreate(BaseModel):
    """Schema for creating QR code"""

    event_id: str
    message: str
    qr_type: str = "message"  # message or url


class QRCodeResponse(BaseModel):
    """Schema for QR code response"""

    id: str
    event_id: str
    message: str
    qr_type: str
    admin_user_id: str
    qr_image: str  # Base64 encoded image
    created_at: str
