from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from contextlib import asynccontextmanager
from pathlib import Path
import html
import re

from dotenv import load_dotenv
load_dotenv()

from app.core.config import get_settings
from app.core.database import db
from app.api import events, registrations, qr_codes, event_fields, branding, whatsapp, message_templates, email

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler"""
    # Startup
    await db.connect()
    print("✅ Database connected successfully")
    yield
    # Shutdown
    await db.close()
    print("👋 Database connection closed")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
    redirect_slashes=True,  # Allow both /path and /path/ URLs
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "*"],  # Allow frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Debug middleware to log auth headers
@app.middleware("http")
async def log_auth_middleware(request: Request, call_next):
    if request.url.path.startswith("/api/events") and request.method != "OPTIONS":
        auth_header = request.headers.get("Authorization", "")
        print(f"DEBUG: Path: {request.url.path}, Auth header present: {bool(auth_header)}, Token prefix: {auth_header[:30] if auth_header else 'None'}")
    response = await call_next(request)
    return response

# Include routers
app.include_router(events.router, prefix="/api")
app.include_router(registrations.router, prefix="/api")
app.include_router(qr_codes.router, prefix="/api")
app.include_router(event_fields.router, prefix="/api")
app.include_router(branding.router, prefix="/api")
app.include_router(whatsapp.router, prefix="/api")
app.include_router(message_templates.router)
app.include_router(email.router, prefix="/api")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


# Static files setup for serving frontend
# Check if frontend dist directory exists (for production deployment)
frontend_dist_path = Path(__file__).parent.parent.parent / "frontend" / "dist"
if frontend_dist_path.exists():
    # Mount static assets directory (JS, CSS, fonts, images)
    assets_path = frontend_dist_path / "assets"
    if assets_path.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_path)), name="assets")

    # Cache for OG-injected HTML (regenerated every 5 minutes or when event changes)
    _og_cache = {"html": None, "event_id": None, "timestamp": 0}

    async def get_og_injected_html() -> str:
        """Get index.html with dynamic OG tags, cached for performance"""
        import time
        from app.services.event_service import EventService

        index_path = frontend_dist_path / "index.html"
        current_time = time.time()
        cache_ttl = 300  # 5 minutes

        # Check if cache is still valid
        if (
            _og_cache["html"]
            and current_time - _og_cache["timestamp"] < cache_ttl
        ):
            return _og_cache["html"]

        # Read base HTML
        html_content = index_path.read_text()

        # Try to inject OG tags from active event
        try:
            active_event = await EventService.get_active_event()
            if active_event:
                event_name = html.escape(active_event.name)
                desc = active_event.description or ""
                event_description = html.escape(
                    desc[:200] + "..." if len(desc) > 200 else desc
                )
                # Remove markdown syntax for cleaner OG description
                event_description = re.sub(r'[#*_`\[\]()]', '', event_description)

                og_title = f"{event_name} - Build2Learn"

                # Replace OG tags
                replacements = [
                    (r'<title>[^<]*</title>', f'<title>{og_title}</title>'),
                    (r'<meta name="description" content="[^"]*"', f'<meta name="description" content="{event_description}"'),
                    (r'<meta property="og:title" content="[^"]*"', f'<meta property="og:title" content="{og_title}"'),
                    (r'<meta property="og:description" content="[^"]*"', f'<meta property="og:description" content="{event_description}"'),
                    (r'<meta name="twitter:title" content="[^"]*"', f'<meta name="twitter:title" content="{og_title}"'),
                    (r'<meta name="twitter:description" content="[^"]*"', f'<meta name="twitter:description" content="{event_description}"'),
                ]
                for pattern, replacement in replacements:
                    html_content = re.sub(pattern, replacement, html_content)

                _og_cache["event_id"] = active_event.id
        except Exception:
            pass  # Use default HTML on error

        # Update cache
        _og_cache["html"] = html_content
        _og_cache["timestamp"] = current_time

        return html_content

    # Catch-all route for SPA routing
    # This must be last to not override API routes
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """Serve the React SPA for all non-API routes"""
        # If path starts with api/, let it 404 normally (API route not found)
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API endpoint not found")

        # Check if frontend exists
        index_path = frontend_dist_path / "index.html"
        if not index_path.exists():
            raise HTTPException(status_code=404, detail="Frontend not found")

        # Return cached OG-injected HTML
        html_content = await get_og_injected_html()
        return HTMLResponse(content=html_content)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
