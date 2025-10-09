"""
WhatsApp messaging API endpoints
"""

from fastapi import APIRouter, HTTPException, status, Depends
from typing import Dict, Any, Optional
from app.models.message_template import WhatsAppBulkMessageRequest
from app.services.whatsapp_service import WhatsAppService
from app.services.message_template_service import message_template_service
from app.core.auth import clerk_auth, AuthenticatedUser

router = APIRouter(prefix="/whatsapp", tags=["whatsapp"])


@router.post("/send-bulk/", status_code=status.HTTP_200_OK)
async def send_bulk_whatsapp_messages(
    request: WhatsAppBulkMessageRequest,
    auth: AuthenticatedUser = Depends(clerk_auth)
):
    """
    Send WhatsApp messages to all or subset of registrants of an event (protected)

    - **event_id**: Event ID to send messages for
    - **message**: Direct message text (optional if template_id provided)
    - **template_id**: ID of message template to use (optional)
    - **template_variables**: Variables to substitute in template (optional)
    - **send_to**: "all" or "subset"
    - **filter_field**: Field name to filter by (required if send_to="subset")
    - **filter_value**: Value to match for filtering (required if send_to="subset")

    Returns summary of sent messages (success, failed, total)
    """
    try:
        # Initialize WhatsApp service
        whatsapp_service = WhatsAppService()

        # Determine the message to send
        message_text = request.message

        # If template_id is provided, load and process template
        if request.template_id:
            template = await message_template_service.get_template(request.template_id)
            if not template:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Template not found"
                )

            message_text = template.template_text

            # Apply global template variables
            if request.template_variables:
                message_text = message_template_service.substitute_variables(
                    message_text,
                    request.template_variables
                )

        if not message_text:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Either message or template_id must be provided"
            )

        # Send bulk messages with optional filtering
        result = await whatsapp_service.send_bulk_messages(
            event_id=request.event_id,
            message=message_text,
            filter_field=request.filter_field if request.send_to == "subset" else None,
            filter_value=request.filter_value if request.send_to == "subset" else None,
            template_variables=request.template_variables
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
    except HTTPException:
        raise
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


@router.get("/field-values/{event_id}/{field_name}", status_code=status.HTTP_200_OK)
async def get_field_distinct_values(event_id: str, field_name: str):
    """
    Get distinct values for a field from event registrations

    - **event_id**: Event ID
    - **field_name**: Field name to get distinct values for

    Returns list of distinct values for filtering
    """
    try:
        whatsapp_service = WhatsAppService()
        values = await whatsapp_service.get_distinct_field_values(event_id, field_name)

        return {
            "event_id": event_id,
            "field_name": field_name,
            "values": values
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get field values: {str(e)}"
        )
