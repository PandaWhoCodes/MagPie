# Deployment Summary - Fly.io Setup Complete ✅

Your MagPie Event Registration Platform is now ready for deployment to fly.io!

## What Was Done

### 1. Multi-Stage Dockerfile Created ✅
- **Location**: `/Dockerfile` (project root)
- **Stage 1**: Builds React frontend with Node.js 18 Alpine
- **Stage 2**: Python 3.11 runtime serving static frontend
- **Security**: Runs as non-root user
- **Performance**: Uvicorn with 2 workers

### 2. FastAPI Static File Serving ✅
- **Modified**: `backend/app/main.py`
- Serves built React app from `/frontend/dist`
- Mounts `/assets` for JS, CSS, fonts, images
- Catch-all route for SPA routing (React Router)
- API routes excluded from catch-all

### 3. Frontend API Configuration ✅
- **Modified**: `frontend/src/services/api.js`
- Uses relative URLs (`/api`) for production
- Falls back to `VITE_API_URL` for local development
- No CORS issues in production (same domain)

### 4. Fly.io Configuration ✅
- **Created**: `fly.toml`
- App: `b2l-registration`
- Region: Singapore (sin)
- Port: 8080
- Auto-scaling enabled
- Health checks configured

### 5. Build Optimization ✅
- **Created**: `.dockerignore` - Excludes unnecessary files from Docker build
- **Created**: `.flyignore` - Optimizes fly.io upload context

### 6. Documentation ✅
- **Created**: `docs/FLY_DEPLOYMENT.md` - Complete deployment guide
- **Updated**: `CLAUDE.md` - Added fly.io deployment section
- **Updated**: `frontend/.env.example` - Documented environment variables
- **Updated**: `CHANGELOG.md` - Documented all changes

## Quick Deployment

```bash
# 1. Install flyctl
brew install flyctl

# 2. Authenticate
fly auth login

# 3. Create app
fly apps create b2l-registration

# 4. Set secrets
fly secrets set \
  TURSO_DATABASE_URL="libsql://b2lregistration-pandawhocodes.aws-ap-south-1.turso.io" \
  TURSO_AUTH_TOKEN="your_turso_token" \
  CLERK_SECRET_KEY="sk_test_..." \
  TWILIO_ACCOUNT_SID="ACxxxxxxxxx" \
  TWILIO_AUTH_TOKEN="your_twilio_token" \
  TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886" \
  RESEND_API_KEY="re_..." \
  RESEND_FROM_EMAIL="onboarding@resend.dev" \
  VITE_CLERK_PUBLISHABLE_KEY="pk_test_..." \
  FRONTEND_URL="https://b2l-registration.fly.dev"

# 5. Deploy (build secrets need actual VALUES, not just names)
export CLERK_PUB_KEY=$(grep VITE_CLERK_PUBLISHABLE_KEY frontend/.env | cut -d '=' -f2)
fly deploy --build-secret VITE_CLERK_PUBLISHABLE_KEY=$CLERK_PUB_KEY

# Or pass directly:
fly deploy --build-secret VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key

# 6. Open app
fly open
```

## What You Need

### Required Secrets
Copy these from your current `.env` files:

**From `backend/.env`:**
- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `CLERK_SECRET_KEY`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_NUMBER`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

**From `frontend/.env`:**
- `VITE_CLERK_PUBLISHABLE_KEY`

**New:**
- `FRONTEND_URL` - Set to `https://b2l-registration.fly.dev` (or your custom domain)

## Architecture Changes

### Before (Render - Separate Services)
```
Frontend (Static Site) ─────┐
                             ├─→ Internet ─→ Users
Backend API (Web Service) ──┘
```
- Two separate services
- CORS configuration needed
- More complex management

### After (Fly.io - Unified App)
```
Single App (FastAPI + React) ─→ Internet ─→ Users
```
- One app instance
- No CORS issues (same domain)
- Simpler deployment
- Lower cost

## Local Development

**No changes needed!** Your local development setup still works:

```bash
# Start both servers (as before)
./start.sh

# Or manually:
cd backend && source venv/bin/activate && uvicorn app.main:app --reload
cd frontend && npm run dev
```

The frontend still uses `http://localhost:8000/api` via `VITE_API_URL` in development.

## Production URLs

After deployment, your app will be available at:
- **Frontend**: `https://b2l-registration.fly.dev`
- **API**: `https://b2l-registration.fly.dev/api`
- **Health**: `https://b2l-registration.fly.dev/health`

## Post-Deployment Steps

1. **Update Clerk Allowed Origins**
   - Go to [Clerk Dashboard](https://dashboard.clerk.com)
   - Add `https://b2l-registration.fly.dev`

2. **Test All Features**
   - Registration form
   - Dashboard authentication
   - QR code generation
   - WhatsApp notifications
   - Email notifications

3. **Monitor Application**
   ```bash
   fly logs
   fly status
   fly dashboard
   ```

## Cost Estimate

**Fly.io Pricing:**
- **Free tier**: 3 shared-cpu-1x VMs, 256MB RAM (sufficient for testing)
- **Production**: ~$5-10/month for 512MB RAM, 1 shared CPU
- **Auto-scaling**: Saves money by stopping machines during low traffic

**Much cheaper than Render's separate frontend + backend!**

## Documentation

- **Full Guide**: [docs/FLY_DEPLOYMENT.md](docs/FLY_DEPLOYMENT.md)
- **Project Docs**: [CLAUDE.md](CLAUDE.md)
- **Changes**: [CHANGELOG.md](CHANGELOG.md)

## Troubleshooting

### Build Fails
```bash
# Check build logs
fly logs

# Verify secrets are set
fly secrets list
```

### Frontend 404
```bash
# SSH into container
fly ssh console

# Check if frontend dist exists
ls -la frontend/dist/
```

### API Errors
```bash
# Check application logs
fly logs

# Verify database connection
fly ssh console
env | grep TURSO
```

## Need Help?

- **Fly.io Docs**: https://fly.io/docs/
- **Project Issues**: https://github.com/PandaWhoCodes/b2l_registration/issues
- **Deployment Guide**: [docs/FLY_DEPLOYMENT.md](docs/FLY_DEPLOYMENT.md)

---

## Summary

✅ Dockerfile created with multi-stage build
✅ FastAPI configured to serve static frontend
✅ Frontend API URLs updated for production
✅ Fly.io configuration ready
✅ Documentation complete
✅ Local development unchanged

**You're ready to deploy! 🚀**

Run `fly deploy --build-secret VITE_CLERK_PUBLISHABLE_KEY` to get started.
