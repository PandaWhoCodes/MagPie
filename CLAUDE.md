# Claude Code Session Notes

## Project Overview
Build2Learn Registration System - A full-stack event registration management platform with dynamic form fields, QR code check-ins, and auto-fill capabilities.

## Architecture
- **Backend**: FastAPI (Python 3.11+) - Running on http://0.0.0.0:8000
- **Frontend**: React 18 + Vite - Running on http://localhost:3000/
- **Database**: Turso (libsql) - SQLite-compatible cloud database (local: `local.db`)
- **Deployment**: Render (both frontend and backend)

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
- **Styling**: TailwindCSS
- **Animations**: Framer Motion (public pages only), Motion (theme-specific animations)
- **State Management**: React Query (@tanstack/react-query)
- **Forms**: React Hook Form
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Theming**: Custom theme system with multiple visual styles

## Quick Start Commands
```bash
# Start Backend
cd backend && source venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Start Frontend
cd frontend && npm run dev
```

## Project Structure
```
b2l_registration/
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
- **Dashboard**: http://localhost:3000/dashboard_under (simple UI, no auth)
- **Thank You Page**: http://localhost:3000/thank-you (after registration)
- **Check-in**: `/check-in/:eventId/:qrId` (QR code redirect)
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## API Endpoints
- Root: http://0.0.0.0:8000/
- Health Check: http://0.0.0.0:8000/health
- API Routes: `/api/events`, `/api/registrations`, `/api/qr_codes`, `/api/event_fields`, `/api/branding`, `/api/whatsapp`

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

### DON'T ❌
- Add authentication (not required per spec)
- Add animations to dashboard pages
- Use an ORM (direct SQL with Turso)
- Allow multiple active events simultaneously
- Manual field identifiers (auto-generate from labels)
- Forget to handle email/phone for auto-fill

## Environment Variables

### Backend (.env)
- `TURSO_DATABASE_URL` - Turso database URL
- `TURSO_AUTH_TOKEN` - Turso authentication token
- `FRONTEND_URL` - Frontend URL for CORS
- `TWILIO_ACCOUNT_SID` - Twilio account identifier (for WhatsApp)
- `TWILIO_AUTH_TOKEN` - Twilio authentication token (for WhatsApp)
- `TWILIO_WHATSAPP_NUMBER` - Twilio WhatsApp number (default: whatsapp:+14155238886)

## Common Development Tasks
- **Add field to event**: Update EventForm.jsx, add to form submission
- **Add API endpoint**: Create router in api/, add service method
- **Add animation**: Use Framer Motion in public pages
- **Export data**: Update RegistrationsList.jsx CSV logic
- **Change styling**: Use Tailwind classes or update index.css
- **Send WhatsApp messages**: Use "Send WhatsApp" button in registrations list (dashboard)
- **Change theme**: Dashboard → Branding Settings → Select theme → Save Changes
- **Add new theme**: Create theme config in themes.js, add CSS in styles/themes/, update HomePage conditional rendering

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
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment

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
