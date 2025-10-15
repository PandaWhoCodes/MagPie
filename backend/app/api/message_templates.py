from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.models.message_template import MessageTemplate, MessageTemplateCreate, MessageTemplateUpdate
from app.services.message_template_service import message_template_service
from app.core.auth import clerk_auth, AuthenticatedUser

router = APIRouter(prefix="/api/message-templates", tags=["message_templates"])


@router.post("/", response_model=MessageTemplate)
async def create_template(
    template_data: MessageTemplateCreate,
    auth: AuthenticatedUser = Depends(clerk_auth)
):
    """Create a new message template (protected)"""
    try:
        return await message_template_service.create_template(template_data, auth)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[MessageTemplate])
async def get_all_templates(
    auth: AuthenticatedUser = Depends(clerk_auth)
):
    """Get all message templates (protected)"""
    try:
        return await message_template_service.get_all_templates(auth)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{template_id}", response_model=MessageTemplate)
async def get_template(
    template_id: str,
    auth: AuthenticatedUser = Depends(clerk_auth)
):
    """Get a specific message template (protected)"""
    template = await message_template_service.get_template(template_id, auth)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template


@router.put("/{template_id}", response_model=MessageTemplate)
async def update_template(
    template_id: str,
    template_data: MessageTemplateUpdate,
    auth: AuthenticatedUser = Depends(clerk_auth)
):
    """Update a message template (protected)"""
    template = await message_template_service.update_template(template_id, template_data, auth)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template


@router.delete("/{template_id}")
async def delete_template(
    template_id: str,
    auth: AuthenticatedUser = Depends(clerk_auth)
):
    """Delete a message template (protected)"""
    try:
        await message_template_service.delete_template(template_id, auth)
        return {"message": "Template deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
