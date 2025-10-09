from fastapi import APIRouter, HTTPException, Depends
from app.models.branding import BrandingSettings, BrandingUpdate
from app.services.branding_service import BrandingService
from app.core.auth import clerk_auth, AuthenticatedUser

router = APIRouter(prefix="/branding", tags=["branding"])


@router.get("/", response_model=BrandingSettings)
async def get_branding():
    """Get current branding settings"""
    branding = await BrandingService.get_branding()
    if not branding:
        raise HTTPException(status_code=404, detail="Branding settings not found")
    return branding


@router.put("/", response_model=BrandingSettings)
async def update_branding(
    update: BrandingUpdate,
    auth: AuthenticatedUser = Depends(clerk_auth)
):
    """Update branding settings (protected)"""
    branding = await BrandingService.update_branding(update)
    if not branding:
        raise HTTPException(status_code=404, detail="Failed to update branding settings")
    return branding
