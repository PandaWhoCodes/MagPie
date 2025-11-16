# Multi-stage Dockerfile for MagPie Event Registration Platform
# Stage 1: Build React frontend
# Stage 2: Python runtime with FastAPI serving static frontend

# ============================================
# Stage 1: Frontend Builder
# ============================================
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package files
COPY frontend/package*.json ./

# Install ALL dependencies (including devDependencies needed for build)
RUN npm ci

# Copy frontend source
COPY frontend/ ./

# Build frontend with Vite
# Mount VITE_CLERK_PUBLISHABLE_KEY as build secret
RUN --mount=type=secret,id=VITE_CLERK_PUBLISHABLE_KEY \
    if [ -f /run/secrets/VITE_CLERK_PUBLISHABLE_KEY ]; then \
        export VITE_CLERK_PUBLISHABLE_KEY=$(cat /run/secrets/VITE_CLERK_PUBLISHABLE_KEY); \
    else \
        echo "WARNING: VITE_CLERK_PUBLISHABLE_KEY build secret not provided"; \
        echo "Usage: fly deploy --build-secret VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key"; \
        exit 1; \
    fi && \
    npm run build

# Output is in /app/frontend/dist/

# ============================================
# Stage 2: Python Runtime
# ============================================
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements
COPY backend/requirements.txt ./backend/

# Install Python dependencies
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy built frontend from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Create non-root user for security
RUN adduser --disabled-password --gecos '' appuser && \
    chown -R appuser:appuser /app

USER appuser

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Expose port (fly.io uses 8080)
EXPOSE 8080

# Run uvicorn with production settings
# 2 workers for better performance, no reload
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8080", "--workers", "2"]
