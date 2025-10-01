from fastapi import APIRouter, HTTPException, status
from typing import List
from app.schemas.event import EventFieldCreate, EventFieldResponse
from app.services.event_service import EventService

router = APIRouter(prefix="/events/{event_id}/fields", tags=["event-fields"])


@router.get("/", response_model=List[EventFieldResponse])
async def get_event_fields(event_id: str):
    """Get all fields for an event"""
    try:
        event = await EventService.get_event(event_id)
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found",
            )
        return event.fields
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch event fields: {str(e)}",
        )


@router.put("/", response_model=List[EventFieldResponse])
async def update_event_fields(event_id: str, fields: List[EventFieldCreate]):
    """Replace all fields for an event"""
    try:
        updated_fields = await EventService.update_event_fields(event_id, fields)
        if updated_fields is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found",
            )
        return updated_fields
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update event fields: {str(e)}",
        )


@router.post("/", response_model=EventFieldResponse, status_code=status.HTTP_201_CREATED)
async def add_event_field(event_id: str, field: EventFieldCreate):
    """Add a new field to an event"""
    try:
        new_field = await EventService.add_event_field(event_id, field)
        if not new_field:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found",
            )
        return new_field
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add event field: {str(e)}",
        )


@router.delete("/{field_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event_field(event_id: str, field_id: str):
    """Delete a field from an event"""
    try:
        success = await EventService.delete_event_field(event_id, field_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Field not found",
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete event field: {str(e)}",
        )