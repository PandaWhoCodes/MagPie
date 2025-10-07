from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import get_settings
from app.core.database import db
from app.api import events, registrations, qr_codes, event_fields, branding, whatsapp, message_templates

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
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "*"],  # Allow frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(events.router, prefix="/api")
app.include_router(registrations.router, prefix="/api")
app.include_router(qr_codes.router, prefix="/api")
app.include_router(event_fields.router, prefix="/api")
app.include_router(branding.router, prefix="/api")
app.include_router(whatsapp.router, prefix="/api")
app.include_router(message_templates.router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "MagPie Event Registration API",
        "version": settings.APP_VERSION,
        "status": "running",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
