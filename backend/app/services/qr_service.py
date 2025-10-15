import uuid
import qrcode
import io
import base64
from app.core.database import db
from app.core.auth import AuthenticatedUser
from app.schemas.qr_code import QRCodeCreate, QRCodeResponse


class QRService:
    """Service for QR code management"""

    @staticmethod
    async def create_qr_code(qr_data: QRCodeCreate, auth) -> QRCodeResponse:
        """Create a QR code for an event"""
        qr_id = str(uuid.uuid4())

        # Generate QR code image
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )

        # Create check-in URL
        check_in_url = f"http://localhost:3000/check-in/{qr_data.event_id}/{qr_id}"
        qr.add_data(check_in_url)
        qr.make(fit=True)

        # Create image
        img = qr.make_image(fill_color="black", back_color="white")

        # Convert to base64
        img_buffer = io.BytesIO()
        img.save(img_buffer, format="PNG")
        img_base64 = base64.b64encode(img_buffer.getvalue()).decode()

        # Save to database
        await db.execute(
            """
            INSERT INTO qr_codes (id, event_id, message, qr_type, admin_user_id)
            VALUES (?, ?, ?, ?, ?)
        """,
            [qr_id, qr_data.event_id, qr_data.message, qr_data.qr_type, auth.user_id],
        )

        qr_code = await db.fetch_one("SELECT * FROM qr_codes WHERE id = ?", [qr_id])

        return QRCodeResponse(
            id=qr_code["id"],
            event_id=qr_code["event_id"],
            message=qr_code["message"],
            qr_type=qr_code["qr_type"],
            admin_user_id=qr_code["admin_user_id"],
            qr_image=img_base64,
            created_at=qr_code["created_at"],
        )

    @staticmethod
    async def get_qr_code(qr_id: str, auth: AuthenticatedUser) -> dict:
        """Get QR code details"""
        qr_code = await db.fetch_one("SELECT * FROM qr_codes WHERE id = ? AND admin_user_id = ?", [qr_id, auth.user_id])
        if not qr_code:
            return None

        return {
            "id": qr_code["id"],
            "event_id": qr_code["event_id"],
            "message": qr_code["message"],
            "qr_type": qr_code["qr_type"],
            "admin_user_id": qr_code["admin_user_id"],
            "created_at": qr_code["created_at"],
        }

    @staticmethod
    async def get_event_qr_codes(event_id: str, auth: AuthenticatedUser) -> list:
        """Get all QR codes for an event"""
        # First verify the event belongs to the admin
        event = await db.fetch_one("SELECT id FROM events WHERE id = ? AND admin_user_id = ?", [event_id, auth.user_id])
        if not event:
            return []

        qr_codes = await db.fetch_all(
            "SELECT * FROM qr_codes WHERE event_id = ? ORDER BY created_at DESC",
            [event_id],
        )

        return [
            {
                "id": qr["id"],
                "event_id": qr["event_id"],
                "message": qr["message"],
                "qr_type": qr["qr_type"],
                "admin_user_id": qr["admin_user_id"],
                "created_at": qr["created_at"],
            }
            for qr in qr_codes
        ]

    @staticmethod
    async def delete_qr_code(qr_id: str, auth: AuthenticatedUser) -> bool:
        """Delete QR code"""
        await db.execute("DELETE FROM qr_codes WHERE id = ? AND admin_user_id = ?", [qr_id, auth.user_id])
        return True
