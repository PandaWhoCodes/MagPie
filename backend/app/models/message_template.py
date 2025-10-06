from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class MessageTemplateBase(BaseModel):
    template_name: str = Field(..., description="Name of the message template")
    template_text: str = Field(..., description="Template text with optional {{variables}}")


class MessageTemplateCreate(MessageTemplateBase):
    pass


class MessageTemplateUpdate(BaseModel):
    template_name: Optional[str] = None
    template_text: Optional[str] = None


class MessageTemplate(MessageTemplateBase):
    id: str
    created_at: str
    updated_at: str
    variables: List[str] = Field(default_factory=list, description="Extracted variables from template")

    class Config:
        from_attributes = True


class WhatsAppBulkMessageRequest(BaseModel):
    event_id: str
    message: Optional[str] = None
    template_id: Optional[str] = None
    template_variables: Optional[dict] = Field(default_factory=dict, description="Variable values for template substitution")
    send_to: str = Field(default="all", description="all or subset")
    filter_field: Optional[str] = None
    filter_value: Optional[str] = None
