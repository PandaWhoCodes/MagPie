from fastapi import APIRouter, HTTPException
from typing import List
from app.models.message_template import MessageTemplate, MessageTemplateCreate, MessageTemplateUpdate
from app.services.message_template_service import message_template_service

router = APIRouter(prefix="/api/message-templates", tags=["message_templates"])


@router.post("/", response_model=MessageTemplate)
async def create_template(template_data: MessageTemplateCreate):
    """Create a new message template"""
    try:
        return await message_template_service.create_template(template_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[MessageTemplate])
async def get_all_templates():
    """Get all message templates"""
    try:
        return await message_template_service.get_all_templates()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{template_id}", response_model=MessageTemplate)
async def get_template(template_id: str):
    """Get a specific message template"""
    template = await message_template_service.get_template(template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template


@router.put("/{template_id}", response_model=MessageTemplate)
async def update_template(template_id: str, template_data: MessageTemplateUpdate):
    """Update a message template"""
    template = await message_template_service.update_template(template_id, template_data)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template


@router.delete("/{template_id}")
async def delete_template(template_id: str):
    """Delete a message template"""
    try:
        await message_template_service.delete_template(template_id)
        return {"message": "Template deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
