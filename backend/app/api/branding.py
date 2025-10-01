from fastapi import APIRouter, HTTPException
from app.models.branding import BrandingSettings, BrandingUpdate
from app.services.branding_service import BrandingService

router = APIRouter(prefix="/branding", tags=["branding"])


@router.get("/", response_model=BrandingSettings)
async def get_branding():
    """Get current branding settings"""
    branding = await BrandingService.get_branding()
    if not branding:
        raise HTTPException(status_code=404, detail="Branding settings not found")
    return branding


@router.put("/", response_model=BrandingSettings)
async def update_branding(update: BrandingUpdate):
    """Update branding settings"""
    branding = await BrandingService.update_branding(update)
    if not branding:
        raise HTTPException(status_code=404, detail="Failed to update branding settings")
    return branding
