"""
Email API endpoints for sending bulk emails to event registrants
"""

from fastapi import APIRouter, HTTPException, status, Depends
from typing import Dict, Optional
from pydantic import BaseModel, Field
from app.services.email_messaging_service import EmailMessagingService
from app.services.message_template_service import message_template_service
from app.core.auth import clerk_auth, AuthenticatedUser

router = APIRouter(prefix="/email", tags=["email"])


class BulkEmailRequest(BaseModel):
    """Request model for sending bulk emails"""
    event_id: str
    subject: str
    message: Optional[str] = None
    template_id: Optional[str] = None  # UUID stored as TEXT in database
    template_variables: Optional[Dict[str, str]] = Field(default_factory=dict)
    send_to: str = "all"  # "all" or "subset"
    filter_field: Optional[str] = None
    filter_value: Optional[str] = None


@router.post("/send-bulk/", status_code=status.HTTP_200_OK)
async def send_bulk_emails(
    request: BulkEmailRequest,
    auth: AuthenticatedUser = Depends(clerk_auth)
):
    """
    Send emails to all or subset of registrants of an event (protected)

    - **event_id**: Event ID to send emails for
    - **subject**: Email subject line
    - **message**: Direct message text (optional if template_id provided)
    - **template_id**: ID of message template to use (optional)
    - **template_variables**: Variables to substitute in template (optional)
    - **send_to**: "all" or "subset"
    - **filter_field**: Field name to filter by (required if send_to="subset")
    - **filter_value**: Value to match for filtering (required if send_to="subset")

    Returns summary of sent emails (success, failed, total)
    """
    try:
        # Initialize email service
        email_service = EmailMessagingService()

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

        # Send bulk emails
        result = await email_service.send_bulk_emails(
            event_id=request.event_id,
            subject=request.subject,
            message=message_text,
            template_variables=request.template_variables,
            send_to=request.send_to,
            filter_field=request.filter_field,
            filter_value=request.filter_value
        )

        return result

    except ValueError as e:
        # Resend credentials not configured
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Email service not configured: {str(e)}"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send emails: {str(e)}"
        )


@router.get("/field-values/{event_id}/{field_name}", status_code=status.HTTP_200_OK)
async def get_field_distinct_values(
    event_id: str,
    field_name: str,
    auth: AuthenticatedUser = Depends(clerk_auth)
):
    """
    Get distinct values for a field from event registrations (protected)

    - **event_id**: Event ID
    - **field_name**: Field name to get distinct values for

    Returns list of distinct values for filtering
    """
    try:
        email_service = EmailMessagingService()
        values = await email_service.get_field_distinct_values(event_id, field_name)

        return {
            "field": field_name,
            "values": values
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get field values: {str(e)}"
        )