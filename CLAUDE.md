# Claude Code Session Notes

## Project Overview
MagPie Event Registration Platform - A full-stack event registration management platform with dynamic form fields, QR code check-ins, and auto-fill capabilities.

## Architecture
- **Backend**: FastAPI (Python 3.11+) - Running on http://0.0.0.0:8000
- **Frontend**: React 18 + Vite - Running on http://localhost:3000/
- **Database**: Turso (libsql) - SQLite-compatible cloud database (local: `local.db`)
- **Deployment**:
  - **Fly.io** (Recommended): Single unified app, FastAPI serves static frontend
  - **Render**: Separate frontend and backend services (legacy)

## Current Status
Both servers are running and operational.

## Technology Stack

### Backend
- **Framework**: FastAPI
- **Database**: Turso (libsql-client, no ORM - direct SQL)
- **Key Libraries**: pydantic, qrcode, Pillow, twilio (WhatsApp messaging), python-dotenv
- **API Docs**: http://localhost:8000/docs

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Authentication**: Clerk (@clerk/clerk-react)
- **Styling**: TailwindCSS + shadcn/ui
- **Animations**: Motion One (lightweight, 5.8KB) - See [ANIMATION_PATTERNS.md](ANIMATION_PATTERNS.md)
- **State Management**: React Query (@tanstack/react-query)
- **Forms**: React Hook Form
- **Icons**: Inline SVG (performance optimized)
- **HTTP Client**: Axios
- **Theming**: 22 professional themes via theme-presets.js

## Quick Start Commands

### Option 1: One-Command Startup (Recommended)
```bash
# Start both servers with one command
./start.sh
```

### Option 2: Manual Startup
```bash
# Start Backend
cd backend && source venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Start Frontend (in a new terminal)
cd frontend && npm run dev
```

## Project Structure
```
magpie/
├── backend/
│   └── app/
│       ├── main.py           # FastAPI entry point
│       ├── core/             # Database, config
│       ├── api/              # Route handlers (events, registrations, qr_codes, event_fields, branding, whatsapp)
│       ├── services/         # Business logic (event, registration, qr_code, whatsapp)
│       └── models/           # Pydantic models
└── frontend/
    └── src/
        ├── pages/            # HomePage, Dashboard, ThankYouPage, CheckInPage
        ├── components/       # EventForm, RegistrationsList, QRCodeModal, WhatsAppModal
        │   └── themes/       # Theme-specific components (AnimatedBackground)
        ├── config/           # Configuration files (themes.js)
        ├── services/         # api.js (axios API calls)
        └── styles/           # TailwindCSS, theme-specific styles
            └── themes/       # Theme-specific CSS files
```

## Access Points
- **Public Registration**: http://localhost:3000/ (theme-based UI - Default or Midnight Black)
- **Dashboard**: http://localhost:3000/dashboard (protected with Clerk authentication)
- **Sign In**: http://localhost:3000/sign-in (Clerk authentication page)
- **Thank You Page**: http://localhost:3000/thank-you (after registration)
- **Check-in**: `/check-in/:eventId/:qrId` (QR code redirect)
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## API Endpoints
- Root: http://0.0.0.0:8000/
- Health Check: http://0.0.0.0:8000/health
- API Routes: `/api/events`, `/api/registrations`, `/api/qr_codes`, `/api/event_fields`, `/api/branding`, `/api/whatsapp`, `/api/email`

### ⚠️ IMPORTANT: API Prefix Requirement
**ALL new API endpoints MUST be under the `/api` prefix.**
- ✅ Correct: `router = APIRouter(prefix="/email", tags=["email"])` with `app.include_router(email.router, prefix="/api")`
- ❌ Wrong: Endpoints outside `/api` prefix
- This ensures consistency and proper frontend integration
- The frontend `api.js` is configured with base URL `http://localhost:8000/api`

## Database Schema
### Tables
1. **events** - Event information
2. **registrations** - User registrations for events
3. **user_profiles** - Stored user data for auto-fill
4. **event_fields** - Dynamic fields per event
5. **qr_codes** - Generated QR codes for events
6. **branding_settings** - Site branding and theme configuration
7. **message_templates** - WhatsApp message templates

### Key Relationships
- Event → Event Fields (one-to-many)
- Event → Registrations (one-to-many)
- Event → QR Codes (one-to-many)
- User Profile → Registrations (one-to-many via email/phone)

## Key Features

### Event Management
- Create/edit/delete events
- Dynamic form fields per event
- Only one active event at a time
- Event cloning
- Field auto-generation from labels (first 10 chars, lowercase, no special chars)

### Registration System
- Auto-fill based on email/phone from previous registrations
- Dynamic form rendering based on event fields
- User profile storage for auto-fill

### QR Code System
- Generate QR codes with custom messages or URLs
- Check-in functionality
- QR types: 'url' or 'text'

### CSV Export
- Export registrations with dynamic fields
- Properly escapes CSV data, avoids duplicate fields

### WhatsApp Notifications
- Send bulk WhatsApp messages to all event registrants
- Automatic phone number formatting (+91 for India)
- Uses Twilio WhatsApp Business API
- Track message delivery status
- See failed messages with detailed error info
- Sandbox: FREE testing (50 msgs/day)
- Production: ~₹0.75/message

### Email Notifications
- Send beautiful HTML emails to all event registrants
- Uses Resend API for reliable email delivery
- Beautiful email templates with MagPie branding (gradient header, clean content, professional footer)
- Support for message templates and variable substitution (`{{fieldname}}`)
- Send to all registrants or filtered subset by field value
- Track email delivery status
- Free tier: 100 emails/day, 3,000 emails/month
- No credit card required for testing
- Setup: Get API key from https://resend.com/api-keys
- Files:
  - `backend/app/services/email_service.py` - Registration confirmation emails
  - `backend/app/services/email_messaging_service.py` - Bulk email service
  - `backend/app/api/email.py` - API endpoints at `/api/email`
  - `frontend/src/components/EmailModal.jsx` - Email composition modal

### Theme System
- **Two Available Themes**:
  - **Default**: Colorful gradients (purple/blue/pink), full event info cards, detailed layout
  - **Midnight Black**: Sleek dark theme with pure black background, subtle orbs, floating particles
- Theme selection in Dashboard → Branding Settings
- Persists in database (branding_settings.theme)
- Both themes support all features (auto-fill, dynamic fields, validation)
- Theme-specific animations and styling
- Files:
  - `frontend/src/components/themes/AnimatedBackground.jsx` - Theme-aware background
  - `frontend/src/config/themes.js` - Theme configuration
  - `frontend/src/styles/themes/midnight-black.css` - Midnight Black styles
  - `frontend/src/pages/HomePage.jsx` - Conditional rendering based on theme

## Development Notes

### DO ✅
- Use Framer Motion for animations on public pages
- Auto-generate field identifiers from labels
- Maintain field ordering using field_order
- Keep dashboard UI simple and functional
- Use TailwindCSS utility classes
- Handle errors gracefully with toast notifications
- Follow REST API conventions with trailing slashes
- **ALL new API endpoints MUST be under `/api` prefix** - See API Prefix Requirement above
- **Run tests after EVERY backend change**: `cd backend && source venv/bin/activate && pytest`
- **Update tests when modifying existing functionality** - Keep test coverage accurate

### DON'T ❌
- Add animations to dashboard pages
- Use an ORM (direct SQL with Turso)
- Allow multiple active events simultaneously
- Manual field identifiers (auto-generate from labels)
- Forget to handle email/phone for auto-fill
- Skip running tests after backend changes
- Leave outdated tests after functionality updates
- **Create API endpoints outside the `/api` prefix** - This breaks frontend integration

## Environment Variables

### Backend (.env)
- `TURSO_DATABASE_URL` - Turso database URL
- `TURSO_AUTH_TOKEN` - Turso authentication token
- `FRONTEND_URL` - Frontend URL for CORS
- `CLERK_SECRET_KEY` - Clerk secret key for backend API authentication
- `TWILIO_ACCOUNT_SID` - Twilio account identifier (for WhatsApp)
- `TWILIO_AUTH_TOKEN` - Twilio authentication token (for WhatsApp)
- `TWILIO_WHATSAPP_NUMBER` - Twilio WhatsApp number (default: whatsapp:+14155238886)
- `RESEND_API_KEY` - Resend API key for email service (get from https://resend.com/api-keys)
- `RESEND_FROM_EMAIL` - Email sender address (default: onboarding@resend.dev for testing)

### Frontend (.env)
- `VITE_API_URL` - Backend API URL (default: http://localhost:8000/api)
- `VITE_CLERK_PUBLISHABLE_KEY` - Clerk publishable key for authentication

## Common Development Tasks
- **Add field to event**: Update EventForm.jsx, add to form submission
- **Add API endpoint**: Create router in api/, add service method
- **Add animation**: Use animation components from `frontend/src/components/animations/` - See [ANIMATION_PATTERNS.md](ANIMATION_PATTERNS.md) for 35+ ready-to-use patterns
- **Export data**: Update RegistrationsList.jsx CSV logic
- **Change styling**: Use Tailwind classes or update index.css
- **Send WhatsApp messages**: Use "Send WhatsApp" button in registrations list (dashboard)
- **Send Email messages**: Use "Send Email" button in registrations list (dashboard)
- **Change theme**: Dashboard → Branding Settings → Select theme → Save Changes
- **Add new theme**: Create theme config in themes.js, add CSS in styles/themes/, update HomePage conditional rendering

## Authentication Setup (Clerk)

The dashboard is protected with Clerk authentication (both frontend and backend). To set up:

### Quick Setup:
1. Sign up at https://clerk.com
2. Create a new application
3. Copy your **Publishable Key** and **Secret Key** from the API Keys page
4. Add to `frontend/.env`:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
   ```
5. Add to `backend/.env`:
   ```
   CLERK_SECRET_KEY=sk_test_...
   ```
6. Add users via Clerk dashboard at https://dashboard.clerk.com
7. Users can sign in at http://localhost:3000/sign-in

### Key Features:
- **User Management**: Add/remove users via Clerk dashboard (no code needed)
- **Pre-built UI**: Beautiful sign-in/sign-up forms out of the box
- **Free Tier**: 10,000 monthly active users included
- **UserButton**: Profile dropdown with sign-out in dashboard header
- **Protected Routes**: Dashboard automatically redirects unauthenticated users
- **Backend Security**: All dashboard API endpoints require valid JWT token
- **Public Routes**: Registration form endpoints remain accessible without auth

### Protected vs Public API Routes:

**Protected (require authentication):**
- All event management endpoints (create, update, delete, toggle, clone)
- View all events and registrations
- QR code management
- Event field management (write operations)
- Branding settings updates
- WhatsApp bulk messaging
- Message template management

**Public (no authentication required):**
- `GET /api/events/active` - For registration form
- `POST /api/registrations/` - Submit registration
- `GET /api/registrations/profile/autofill` - Auto-fill user data
- `POST /api/registrations/check-in/{event_id}` - QR code check-in
- `GET /api/branding/` - Get theme settings
- `GET /api/events/{event_id}/fields/` - Get event fields for registration form

## WhatsApp Integration Setup
See [WHATSAPP_SETUP.md](docs/WHATSAPP_SETUP.md) for complete setup instructions.

### Quick Setup:
1. Sign up at https://www.twilio.com/try-twilio
2. Get Account SID and Auth Token
3. Add credentials to `backend/.env`
4. Activate WhatsApp Sandbox
5. Recipients send `join <code>` to +1 415 523 8886
6. Click "Send WhatsApp" button in dashboard registrations list

## Documentation

Complete documentation is available in the `/docs` directory:
- [Setup Guide](docs/SETUP.md) - Installation and configuration
- [Features Guide](docs/FEATURES.md) - Detailed feature documentation
- [API Reference](docs/API.md) - API endpoints and examples
- [WhatsApp Setup](docs/WHATSAPP_SETUP.md) - WhatsApp integration guide
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment (Render, legacy)
- [Fly.io Deployment](docs/FLY_DEPLOYMENT.md) - **Recommended deployment guide**
- [Animation Quick Start](ANIMATION_QUICK_START.md) - Get started with animations in 5 minutes ⚡
- [Animation Patterns](ANIMATION_PATTERNS.md) - 35+ ready-to-use animation components
- [UI Enhancement Guide](UI_ENHANCEMENT_GUIDE.md) - Comprehensive animation library guide

## Deployment Options

### Option 1: Fly.io (Recommended) 🚀
**Single unified app deployment** - FastAPI serves the React frontend as static files.

**Advantages:**
- ✅ Simpler management (one app vs two)
- ✅ Lower cost (single app instance)
- ✅ No CORS issues (same domain)
- ✅ Faster deployment
- ✅ Better for monolithic architecture
- ✅ Built-in SSL and CDN

**Quick Deploy:**
```bash
# 1. Install flyctl
brew install flyctl  # or see docs/FLY_DEPLOYMENT.md

# 2. Authenticate
fly auth login

# 3. Create app
fly apps create b2l-registration

# 4. Set secrets (see docs/FLY_DEPLOYMENT.md for full list)
fly secrets set TURSO_DATABASE_URL="..." CLERK_SECRET_KEY="..."

# 5. Deploy
fly deploy --build-secret VITE_CLERK_PUBLISHABLE_KEY
```

**See [docs/FLY_DEPLOYMENT.md](docs/FLY_DEPLOYMENT.md) for complete guide.**

### Option 2: Render (Legacy)
**Separate frontend and backend services.**

Configured via `render.yaml`. Frontend served as static site, backend as web service.

**See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for legacy deployment guide.**

## Notes
- Backend uses Turso database (SQLite-compatible)
- CORS configured to allow frontend communication
- Hot reload enabled on both servers
- No authentication required
- See [agents.md](agents.md) for detailed implementation patterns and guidelines
- See [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md) for comprehensive architecture documentation

## ⚠️ IMPORTANT: Changelog Requirement

**EVERY TIME YOU MAKE A CHANGE TO THE CODEBASE, YOU MUST UPDATE [CHANGELOG.md](CHANGELOG.md)**

### When to Update Changelog
- ✅ Adding new features
- ✅ Fixing bugs
- ✅ Changing existing functionality
- ✅ Removing features
- ✅ Security improvements
- ✅ Performance optimizations
- ✅ Database schema changes
- ✅ API endpoint modifications
- ✅ UI/UX updates

### How to Update Changelog

1. **Determine the version number**
   - If no unreleased section exists, create one: `## [Unreleased]`
   - For releases, use semantic versioning: `## [1.1.0] - YYYY-MM-DD`

2. **Choose the appropriate category**
   - **Added** - New features
   - **Changed** - Changes to existing functionality
   - **Deprecated** - Soon-to-be removed features
   - **Removed** - Removed features
   - **Fixed** - Bug fixes
   - **Security** - Security improvements

3. **Write a clear entry**
   ```markdown
   ### Added
   - Feature description with context
     - `path/to/file.py:line_number` - What was added
     - `path/to/component.jsx` - Related frontend changes
   ```

### Example Changelog Entry

```markdown
## [Unreleased]

### Added
- Email notification system for new registrations
  - `backend/app/services/email_service.py` - New service for sending emails
  - `backend/app/api/registrations.py:45` - Trigger email after registration
  - `backend/requirements.txt` - Added sendgrid dependency

### Fixed
- Auto-fill not working for phone numbers with country code
  - `frontend/src/pages/HomePage.jsx:123` - Updated regex pattern
  - `backend/app/services/registration_service.py:67` - Normalize phone format

### Changed
- Dashboard UI now shows registration count per event
  - `frontend/src/pages/Dashboard.jsx:89` - Added counter badge
  - `frontend/src/components/EventCard.jsx` - Updated card layout
```

### Changelog Update Checklist

Before considering your work complete:

- [ ] Changes documented in CHANGELOG.md
- [ ] Version number determined (if applicable)
- [ ] Category selected (Added/Changed/Fixed/etc.)
- [ ] File paths and line numbers included
- [ ] Clear description of what changed and why
- [ ] Related changes grouped together

### Why This Matters

1. **Traceability** - Track what changed, when, and why
2. **Collaboration** - Help other developers understand changes
3. **Debugging** - Quickly identify when bugs were introduced
4. **Releases** - Generate release notes easily
5. **Documentation** - Living history of the project

**Remember**: If you don't update the changelog, the change didn't happen! 📝
