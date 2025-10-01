from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class EventFieldCreate(BaseModel):
    """Schema for creating event field"""

    field_name: str
    field_type: str  # text, email, phone, select, textarea, checkbox, radio
    field_label: str
    is_required: bool = False
    field_options: Optional[str] = None  # JSON string for select/radio options
    field_order: int = 0


class EventFieldResponse(EventFieldCreate):
    """Schema for event field response"""

    id: str
    event_id: str


class EventCreate(BaseModel):
    """Schema for creating event"""

    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    date: str  # ISO format date
    time: str
    venue: str
    venue_address: Optional[str] = None
    venue_map_link: Optional[str] = None
    is_active: bool = False
    fields: List[EventFieldCreate] = []


class EventUpdate(BaseModel):
    """Schema for updating event"""

    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    venue: Optional[str] = None
    venue_address: Optional[str] = None
    venue_map_link: Optional[str] = None
    is_active: Optional[bool] = None


class EventResponse(BaseModel):
    """Schema for event response"""

    id: str
    name: str
    description: Optional[str]
    date: str
    time: str
    venue: str
    venue_address: Optional[str]
    venue_map_link: Optional[str]
    is_active: bool
    created_at: str
    updated_at: str
    fields: List[EventFieldResponse] = []
