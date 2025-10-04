"""
WhatsApp messaging API endpoints
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Dict, Any
from app.services.whatsapp_service import WhatsAppService

router = APIRouter(prefix="/whatsapp", tags=["whatsapp"])


class BulkMessageRequest(BaseModel):
    """Request schema for sending bulk WhatsApp messages"""
    event_id: str
    message: str


class MessageResponse(BaseModel):
    """Response schema for message sending"""
    success: bool
    total: int
    sent: int
    failed: int
    results: list


@router.post("/send-bulk/", response_model=MessageResponse, status_code=status.HTTP_200_OK)
async def send_bulk_whatsapp_messages(request: BulkMessageRequest):
    """
    Send WhatsApp messages to all registrants of an event

    - **event_id**: Event ID to send messages for
    - **message**: Message text to send to all registrants

    Returns summary of sent messages (success, failed, total)
    """
    try:
        # Initialize WhatsApp service
        whatsapp_service = WhatsAppService()

        # Send bulk messages
        result = await whatsapp_service.send_bulk_messages(
            event_id=request.event_id,
            message=request.message
        )

        if not result['success'] and result.get('error'):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=result['error']
            )

        return result

    except ValueError as e:
        # Twilio credentials not configured
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"WhatsApp service not configured: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send messages: {str(e)}"
        )


@router.get("/registrants-count/{event_id}", status_code=status.HTTP_200_OK)
async def get_registrants_count(event_id: str):
    """
    Get count of registrants for an event

    - **event_id**: Event ID

    Returns the number of people who will receive the message
    """
    try:
        whatsapp_service = WhatsAppService()
        count = await whatsapp_service.get_event_registrants_count(event_id)

        return {
            "event_id": event_id,
            "count": count
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get registrants count: {str(e)}"
        )
