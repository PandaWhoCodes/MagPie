from fastapi import APIRouter, HTTPException, status, Query, Depends
from typing import Optional
from app.schemas.registration import (
    RegistrationCreate,
    RegistrationResponse,
    UserProfileResponse,
    CheckInRequest,
)
from app.services.registration_service import RegistrationService
from app.core.auth import clerk_auth, AuthenticatedUser

router = APIRouter(prefix="/registrations", tags=["registrations"])


@router.post("/", response_model=RegistrationResponse, status_code=status.HTTP_201_CREATED)
async def create_registration(registration: RegistrationCreate):
    """Create a new registration"""
    try:
        event = await RegistrationService.get_event_registration_status(registration.event_id)
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found",
            )
        if not event["registrations_open"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Registrations are closed for this event",
            )

        # Check if user is already registered
        is_registered = await RegistrationService.is_user_registered(
            registration.event_id, registration.email
        )
        if is_registered:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already registered for this event",
            )

        return await RegistrationService.create_registration(registration)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create registration: {str(e)}",
        )


@router.get("/{registration_id}", response_model=RegistrationResponse)
async def get_registration(
    registration_id: str,
    auth: AuthenticatedUser = Depends(clerk_auth)
):
    """Get registration by ID (protected)"""
    try:
        registration = await RegistrationService.get_registration(registration_id)
        if not registration:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Registration not found",
            )
        return registration
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch registration: {str(e)}",
        )


@router.get("/profile/autofill", response_model=UserProfileResponse)
async def get_user_profile_for_autofill(
    email: Optional[str] = Query(None), phone: Optional[str] = Query(None)
):
    """Get user profile for auto-fill feature - requires both email AND phone to match"""
    try:
        # Both email and phone are required for auto-fill
        if not email or not phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Both email and phone must be provided",
            )

        profile = await RegistrationService.get_user_profile(email, phone)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No profile found matching both email and phone",
            )
        return profile
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch profile: {str(e)}",
        )


@router.post("/check-in/{event_id}")
async def check_in_user(event_id: str, check_in: CheckInRequest):
    """Check in a user for an event"""
    try:
        success = await RegistrationService.check_in_user(event_id, check_in.email)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Registration not found",
            )
        return {"message": "Successfully checked in", "email": check_in.email}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check in user: {str(e)}",
        )
