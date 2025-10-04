# Changelog

All notable changes to the Build2Learn Registration System will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Test migration table to verify schema migration system
  - `backend/app/core/schema_manager.py:140-152` - Added `test_migration` table definition with 4 columns and 1 index
  - Table includes: id (primary key), test_field, test_number, new_test_column, created_at
  - Index created on `test_field` column for performance testing
- Footer component with Build2Learn branding
  - `frontend/src/components/Footer.jsx` - New footer component with animated heart and link to build2learn.in
  - Added footer to all pages: HomePage, ThankYouPage, CheckInPage, Dashboard, NoEventPage
  - Features animated pulsing heart emoji and hover effect on Build2Learn link
- Demo video link to README
  - `README.md:5-7` - Added demo video section with Google Drive link at the top of README

### Changed
- Improved schema migration error handling for WAL conflicts
  - `backend/app/core/schema_manager.py:217-252` - Enhanced `add_column()` method with WAL conflict retry logic
  - Added automatic retry mechanism with 0.1s delay for transient WAL conflicts
  - Better error messages for migration failures
  - `backend/app/core/database.py:15-33` - Reordered connection flow to run schema migrations before remote sync
  - Prevents WAL conflicts during schema updates by avoiding concurrent sync operations
  - Added try-catch wrapper around remote sync with warning message on failure
  - `backend/app/core/schema_manager.py:319-325` - Removed premature sync call after schema migration

## [1.0.0] - 2025-10-02

### Initial Release - Production Ready System

#### Backend Features ✅

##### Core Infrastructure
- **FastAPI Framework** - Modern async web framework with automatic API documentation
- **Turso Database Integration** - Embedded replica with remote sync for better performance
- **Schema Management System** - Automated database schema versioning and migrations
- **CORS Configuration** - Proper cross-origin support for frontend communication
- **Health Check Endpoints** - `/health` and `/` for monitoring

##### Database Architecture
- **5 Core Tables**:
  - `events` - Event information and metadata
  - `registrations` - User registration data with JSON form responses
  - `user_profiles` - User data storage for auto-fill functionality
  - `event_fields` - Dynamic custom fields per event
  - `qr_codes` - QR code configurations and tracking
- **Schema Versioning** - Automated migrations with `schema_version` table
- **Embedded Replica** - Local SQLite with remote Turso sync

##### API Endpoints

**Events API** (`/api/events`)
- `GET /api/events/` - List all events
- `GET /api/events/active/` - Get currently active event
- `GET /api/events/{id}` - Get specific event details
- `POST /api/events/` - Create new event
- `PATCH /api/events/{id}` - Update event details
- `POST /api/events/{id}/toggle` - Activate/deactivate event (only one active at a time)
- `POST /api/events/{id}/clone` - Clone event with new name
- `DELETE /api/events/{id}` - Delete event
- `GET /api/events/{id}/registrations/` - Get all registrations for event

**Registrations API** (`/api/registrations`)
- `POST /api/registrations/` - Create new registration
- `GET /api/registrations/{id}` - Get specific registration
- `GET /api/registrations/profile/autofill/` - Get user profile for auto-fill (by email or phone)
- `POST /api/registrations/check-in/{event_id}` - Check-in user via QR code

**QR Codes API** (`/api/qr-codes`)
- `POST /api/qr-codes/` - Generate QR code with custom message/URL
- `GET /api/qr-codes/{id}` - Get QR code details and image
- `GET /api/qr-codes/event/{event_id}` - List all QR codes for an event
- `DELETE /api/qr-codes/{id}` - Delete QR code

**Event Fields API** (`/api/event-fields`)
- Dynamic field management for event registration forms
- Field types: text, email, phone, textarea, select, checkbox, radio
- Required/optional field configuration
- Field ordering support

**Branding API** (`/api/branding`)
- Custom event branding and styling options

##### Business Logic Services
- **EventService** - Event management, activation, cloning
- **RegistrationService** - Registration processing, duplicate prevention, auto-fill
- **QRCodeService** - QR code generation with qrcode library, image storage
- **User Profile Management** - Automatic profile creation/update on registration

##### Data Models (Pydantic)
- Request/response validation for all endpoints
- Type safety and automatic API documentation
- Error handling with proper HTTP status codes

#### Frontend Features ✅

##### Core Technologies
- **React 18** - Modern component-based UI
- **Vite** - Lightning-fast build tool with HMR
- **TailwindCSS** - Utility-first styling framework
- **Framer Motion** - Smooth animations for public pages
- **React Query** - Server state management and caching
- **React Hook Form** - Performant form handling
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client with interceptors
- **Lucide React** - Modern icon library
- **React Hot Toast** - Elegant notifications

##### Pages & Routes

**Public Pages** (Animated, Glassmorphism Design)
- **HomePage** (`/`) - Registration form for active event
  - Gradient backgrounds with animated mesh
  - Auto-fill on email/phone input (1-second debounce)
  - Dynamic form rendering based on event fields
  - Real-time validation
  - Duplicate registration prevention
  - Success animation with confetti effect

- **ThankYouPage** (`/thank-you`) - Post-registration success page
  - Confetti celebration animation
  - Event details recap
  - Social sharing options

- **CheckInPage** (`/check-in/:eventId/:qrId`) - QR code check-in flow
  - Email-based check-in
  - Ripple animation effects
  - Custom message/URL display after check-in
  - Error handling for invalid QR codes

**Admin Pages** (Simple, Functional Design)
- **Dashboard** (`/dashboard_under`) - Event management hub
  - Event list with quick actions
  - Create new event button
  - Event statistics overview
  - No authentication required (as per spec)

##### Components

**Event Management**
- **EventForm** - Create/edit events with dynamic fields
  - Event details (name, description, date, time, venue)
  - Google Maps link integration
  - Dynamic field builder with 7 field types
  - Field identifier auto-generation (first 10 chars, lowercase, no special chars)
  - Field ordering with drag-and-drop support
  - Required field toggles
  - Select/radio/checkbox options management

**Registration Management**
- **RegistrationsList** - View and manage registrations
  - Search by email or phone
  - Check-in status indicators
  - Expandable registration details
  - CSV export with proper escaping
  - Dynamic columns based on event fields
  - Registration count statistics

**QR Code System**
- **QRCodeModal** - Generate and manage QR codes
  - QR type selection (message/URL)
  - Custom content input
  - QR code preview
  - Download as PNG
  - QR code list for event
  - Delete functionality

##### UI/UX Features
- **Responsive Design** - Mobile-first, works on all screen sizes
- **Loading States** - Skeleton loaders and spinners
- **Error Handling** - Toast notifications for all actions
- **Form Validation** - Real-time client-side validation
- **Animations** - Smooth transitions with Framer Motion (public pages only)
- **Glassmorphism** - Modern frosted glass effect on cards
- **Gradient Backgrounds** - Animated mesh gradients
- **Dark Mode Ready** - Color scheme prepared for dark mode

##### Auto-fill System
- Triggers on email or phone input change
- 1-second debounce to prevent excessive API calls
- Fetches user profile from previous registrations
- Auto-populates matching fields
- Preserves user-entered values
- Visual feedback during loading

##### CSV Export
- Exports all registration data
- Dynamic columns based on event fields
- Proper CSV escaping for special characters
- Includes event metadata
- Check-in status included
- Timestamp formatting

#### Key Features & Workflows ✅

##### Event Management Workflow
1. Admin creates event with custom fields
2. System auto-generates field identifiers
3. Admin activates event (deactivates others automatically)
4. Event appears on public homepage
5. Users can register
6. Admin can view registrations, generate QR codes
7. Admin can clone event for similar future events
8. Admin can edit or delete events

##### Registration Workflow
1. User visits homepage
2. System fetches active event
3. User enters email/phone
4. System auto-fills known fields after 1 second
5. User completes remaining fields
6. System validates and prevents duplicates
7. Registration saved with user profile update
8. User redirected to thank you page
9. Confetti animation plays

##### QR Code Check-in Workflow
1. Admin generates QR code with custom message/URL
2. QR code displayed/downloaded
3. User scans QR code at event
4. User redirected to check-in page
5. User enters email
6. System auto-checks them in
7. Custom message/URL displayed
8. Ripple animation plays

##### Auto-fill Workflow
1. User types email or phone
2. 1-second debounce timer starts
3. System queries user_profiles table
4. If profile found, auto-fills matching fields
5. User reviews and completes form
6. On submission, profile updated with latest data

#### Technical Highlights ✅

##### Performance Optimizations
- Embedded replica for faster database queries
- React Query caching for reduced API calls
- Debounced auto-fill to minimize requests
- Code splitting with lazy loading
- Optimized bundle size with Vite

##### Security Considerations
- Input validation on backend (Pydantic)
- SQL injection prevention (parameterized queries)
- CORS properly configured
- XSS prevention (React escaping)
- CSV injection prevention (proper escaping)

##### Developer Experience
- Hot reload on both frontend and backend
- Automatic API documentation (FastAPI Swagger)
- Type safety with Pydantic models
- Clear code organization
- Comprehensive error messages

#### Configuration & Deployment ✅

##### Environment Variables
**Backend** (`.env`):
- `TURSO_DATABASE_URL` - Turso database connection URL
- `TURSO_AUTH_TOKEN` - Turso authentication token
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:3000)

**Frontend** (`.env`):
- `VITE_API_URL` - Backend API URL (default: http://localhost:8000)

##### Deployment Setup
- **Platform**: Render
- **Configuration**: `render.yaml` for infrastructure as code
- **Database**: Turso cloud SQLite with embedded replica
- **Frontend**: Static site build
- **Backend**: FastAPI with Uvicorn

##### Development Setup
- Python 3.11+ virtual environment
- Node.js 18+ with npm
- Local SQLite with Turso sync
- Hot reload enabled

#### Known Limitations & Future Considerations 📝

##### Current Limitations
- No authentication system (access dashboard via `/dashboard_under`)
- Single active event at a time
- No email notifications
- No payment integration
- CSV export only (no Excel)
- No bulk registration import
- No event templates
- No analytics dashboard
- No multi-language support

##### Intentional Design Decisions
- No authentication (as per requirements)
- Simple dashboard UI (functional over fancy)
- No animations on admin pages (performance)
- Direct SQL instead of ORM (flexibility)
- Embedded replica (performance over real-time consistency)

---

## How to Use This Changelog

When making changes to the system, add entries under the appropriate version and category:

### Categories
- **Added** - New features
- **Changed** - Changes to existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security improvements

### Example Entry Format
```markdown
## [1.1.0] - YYYY-MM-DD

### Added
- New feature description with file references
  - `backend/app/api/new_feature.py` - New API endpoint
  - `frontend/src/components/NewComponent.jsx` - UI component

### Fixed
- Bug description and fix details
  - `backend/app/services/service.py:123` - Fixed logic error

### Changed
- Change description
  - `frontend/src/pages/Dashboard.jsx` - Updated UI layout
```

---

**Note**: This changelog should be updated whenever changes are made to the codebase. See [claude.md](claude.md) for changelog update requirements.
