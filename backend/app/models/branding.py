from pydantic import BaseModel
from typing import Optional


class BrandingSettings(BaseModel):
    id: str
    site_title: str
    site_headline: str
    logo_url: Optional[str] = None
    text_style: str = 'gradient'
    updated_at: str


class BrandingUpdate(BaseModel):
    site_title: Optional[str] = None
    site_headline: Optional[str] = None
    logo_url: Optional[str] = None
    text_style: Optional[str] = None
