from fastapi import APIRouter, HTTPException, status
from typing import List
from app.schemas.event import EventCreate, EventUpdate, EventResponse
from app.services.event_service import EventService

router = APIRouter(prefix="/events", tags=["events"])


@router.post("/", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(event: EventCreate):
    """Create a new event"""
    try:
        return await EventService.create_event(event)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create event: {str(e)}",
        )


@router.get("/", response_model=List[EventResponse])
async def get_all_events():
    """Get all events"""
    try:
        return await EventService.get_all_events()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch events: {str(e)}",
        )


@router.get("/active", response_model=EventResponse)
async def get_active_event():
    """Get currently active event"""
    try:
        event = await EventService.get_active_event()
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No active event found",
            )
        return event
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch active event: {str(e)}",
        )


@router.get("/{event_id}", response_model=EventResponse)
async def get_event(event_id: str):
    """Get event by ID"""
    try:
        event = await EventService.get_event(event_id)
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found",
            )
        return event
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch event: {str(e)}",
        )


@router.patch("/{event_id}", response_model=EventResponse)
async def update_event(event_id: str, event: EventUpdate):
    """Update event"""
    try:
        updated_event = await EventService.update_event(event_id, event)
        if not updated_event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found",
            )
        return updated_event
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update event: {str(e)}",
        )


@router.post("/{event_id}/toggle", response_model=EventResponse)
async def toggle_event_status(event_id: str):
    """Toggle event active status"""
    try:
        event = await EventService.toggle_event_status(event_id)
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found",
            )
        return event
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to toggle event status: {str(e)}",
        )


@router.post("/{event_id}/clone", response_model=EventResponse)
async def clone_event(event_id: str, new_name: str):
    """Clone an existing event"""
    try:
        event = await EventService.clone_event(event_id, new_name)
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Source event not found",
            )
        return event
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clone event: {str(e)}",
        )


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(event_id: str):
    """Delete event"""
    try:
        await EventService.delete_event(event_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete event: {str(e)}",
        )


@router.get("/{event_id}/registrations")
async def get_event_registrations(event_id: str):
    """Get all registrations for an event"""
    try:
        return await EventService.get_event_registrations(event_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch registrations: {str(e)}",
        )
