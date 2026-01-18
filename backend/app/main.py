from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
from pathlib import Path

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

    # Catch-all route for SPA routing
    # This must be last to not override API routes
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """Serve the React SPA for all non-API routes"""
        # If path starts with api/, let it 404 normally (API route not found)
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API endpoint not found")

        # Serve index.html for all other routes (SPA routing)
        index_path = frontend_dist_path / "index.html"
        if index_path.exists():
            return FileResponse(str(index_path))
        else:
            raise HTTPException(status_code=404, detail="Frontend not found")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
