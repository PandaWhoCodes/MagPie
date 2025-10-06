from typing import Optional
from app.core.database import db
from app.models.branding import BrandingSettings, BrandingUpdate
from datetime import datetime


class BrandingService:
    @staticmethod
    async def get_branding() -> Optional[BrandingSettings]:
        """Get current branding settings"""
        result = await db.fetch_one(
            "SELECT * FROM branding_settings WHERE id = 'default'"
        )
        if result:
            return BrandingSettings(**result)
        return None

    @staticmethod
    async def update_branding(update: BrandingUpdate) -> Optional[BrandingSettings]:
        """Update branding settings"""
        # Build update query dynamically
        fields = []
        values = []

        if update.site_title is not None:
            fields.append("site_title = ?")
            values.append(update.site_title)

        if update.site_headline is not None:
            fields.append("site_headline = ?")
            values.append(update.site_headline)

        if update.logo_url is not None:
            fields.append("logo_url = ?")
            values.append(update.logo_url)

        if update.text_style is not None:
            fields.append("text_style = ?")
            values.append(update.text_style)

        if update.theme is not None:
            fields.append("theme = ?")
            values.append(update.theme)

        if not fields:
            return await BrandingService.get_branding()

        fields.append("updated_at = ?")
        values.append(datetime.utcnow().isoformat())
        values.append("default")

        query = f"""
            UPDATE branding_settings
            SET {', '.join(fields)}
            WHERE id = ?
        """

        await db.execute(query, values)
        return await BrandingService.get_branding()
