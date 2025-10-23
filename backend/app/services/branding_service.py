from typing import Optional
from app.core.database import db
from app.models.branding import BrandingSettings, BrandingUpdate
from app.core.cache import get_cached, set_cached, invalidate_cache, generate_cache_key
from datetime import datetime

# Cache configuration
BRANDING_CACHE_KEY = "branding:default"
BRANDING_CACHE_TTL = 6 * 60 * 60  # 6 hours (in seconds)


class BrandingService:
    @staticmethod
    async def get_branding() -> Optional[BrandingSettings]:
        """Get current branding settings (cached)"""
        # Try to get from cache first
        cached_branding = await get_cached(BRANDING_CACHE_KEY)
        if cached_branding:
            return BrandingSettings(**cached_branding)

        # Cache miss - fetch from database
        result = await db.fetch_one(
            "SELECT * FROM branding_settings WHERE id = 'default'"
        )
        if result:
            branding = BrandingSettings(**result)
            # Store in cache (convert to dict for serialization)
            await set_cached(BRANDING_CACHE_KEY, branding.model_dump(), BRANDING_CACHE_TTL)
            return branding
        return None

    @staticmethod
    async def update_branding(update: BrandingUpdate) -> Optional[BrandingSettings]:
        """Update branding settings and invalidate cache"""
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

        # Invalidate the cache so next request fetches fresh data
        await invalidate_cache(BRANDING_CACHE_KEY)

        return await BrandingService.get_branding()
