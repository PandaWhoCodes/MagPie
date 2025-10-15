from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from app.schemas.event import EventCreate, EventUpdate, EventResponse
from app.services.event_service import EventService
from app.core.auth import clerk_auth, AuthenticatedUser

router = APIRouter(prefix="/events", tags=["events"])


@router.post("/", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(
    event: EventCreate,
    auth: AuthenticatedUser = Depends(clerk_auth)
):
    """Create a new event (protected)"""
    try:
        return await EventService.create_event(event, auth)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create event: {str(e)}",
        )


@router.get("/", response_model=List[EventResponse])
async def get_all_events(
    auth: AuthenticatedUser = Depends(clerk_auth)
):
    """Get all events for the authenticated admin (protected)"""
    try:
        return await EventService.get_all_events(auth)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch events: {str(e)}",
        )


@router.get("/active", response_model=EventResponse)
async def get_active_event():
    """Get currently active event for the authenticated admin (protected)"""
    try:
        event = await EventService.get_active_events()
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
async def get_event(
    event_id: str,
    auth: AuthenticatedUser = Depends(clerk_auth)
):
    """Get event by ID (protected)"""
    try:
        event = await EventService.get_event(event_id, auth)
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
async def update_event(
    event_id: str,
    event: EventUpdate,
    auth: AuthenticatedUser = Depends(clerk_auth)
):
    """Update event (protected)"""
    try:
        updated_event = await EventService.update_event(event_id, event, auth)
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
async def toggle_event_status(
    event_id: str,
    auth: AuthenticatedUser = Depends(clerk_auth)
):
    """Toggle event active status (protected)"""
    try:
        event = await EventService.toggle_event_status(event_id, auth)
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
async def clone_event(
    event_id: str,
    new_name: str,
    auth: AuthenticatedUser = Depends(clerk_auth)
):
    """Clone an existing event (protected)"""
    try:
        event = await EventService.clone_event(event_id, new_name, auth)
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
async def delete_event(
    event_id: str,
    auth: AuthenticatedUser = Depends(clerk_auth)
):
    """Delete event (protected)"""
    try:
        await EventService.delete_event(event_id, auth)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete event: {str(e)}",
        )


@router.get("/{event_id}/registrations")
async def get_event_registrations(
    event_id: str,
    auth: AuthenticatedUser = Depends(clerk_auth)
):
    """Get all registrations for an event (protected)"""
    try:
        return await EventService.get_event_registrations(event_id, auth)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch registrations: {str(e)}",
        )
