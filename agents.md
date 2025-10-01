# Agent Guide - Build2Learn Registration System

This document helps AI agents understand the codebase structure and where to make specific types of changes.

## Project Structure

```
b2l_registration/
├── backend/                 # FastAPI backend
│   └── app/
│       ├── main.py         # FastAPI app entry point
│       ├── core/           # Core functionality
│       │   └── database.py # Database connection (Turso)
│       ├── api/            # API route handlers
│       │   ├── events.py
│       │   ├── registrations.py
│       │   ├── qr_codes.py
│       │   └── event_fields.py
│       ├── services/       # Business logic
│       │   ├── event_service.py
│       │   ├── registration_service.py
│       │   └── qr_code_service.py
│       └── models/         # Pydantic models
│           ├── event.py
│           ├── registration.py
│           └── qr_code.py
└── frontend/               # React + Vite frontend
    └── src/
        ├── pages/          # Page components
        │   ├── HomePage.jsx          # Public registration page
        │   ├── ThankYouPage.jsx      # Success page after registration
        │   ├── CheckInPage.jsx       # QR code check-in page
        │   └── Dashboard.jsx         # Admin dashboard
        ├── components/     # Reusable components
        │   ├── EventForm.jsx         # Create/Edit event form
        │   ├── RegistrationsList.jsx # View registrations
        │   └── QRCodeModal.jsx       # QR code generation
        ├── services/       # API service layer
        │   └── api.js      # Axios API calls
        └── styles/
            └── index.css   # TailwindCSS styles
```

## Where to Make Changes

### Adding New Features

#### Backend API Endpoints
- **Location**: `backend/app/api/`
- **When**: Adding new REST endpoints
- **Pattern**: Create new router file or add to existing
- **Example**: `backend/app/api/events.py`

#### Business Logic
- **Location**: `backend/app/services/`
- **When**: Adding complex business logic, database operations
- **Pattern**: Create service methods that interact with database
- **Example**: `backend/app/services/event_service.py`

#### Database Schema Changes
- **Location**: Database is managed via raw SQL in services
- **When**: Adding new tables or fields
- **Note**: Using Turso (libsql) - no ORM, direct SQL execution
- **Pattern**: Add CREATE TABLE or ALTER statements in service initialization

#### API Models/Validation
- **Location**: `backend/app/models/`
- **When**: Defining request/response schemas
- **Pattern**: Use Pydantic BaseModel for validation
- **Example**: `backend/app/models/event.py`

### Frontend Changes

#### Public Pages (With Animations)
- **Location**: `frontend/src/pages/`
- **Files**:
  - `HomePage.jsx` - Main registration form (uses Framer Motion)
  - `ThankYouPage.jsx` - Success page (confetti, animations)
  - `CheckInPage.jsx` - QR check-in (ripple effects)
- **Note**: These use Framer Motion for animations, maintain consistency
- **Style**: Gradient backgrounds, glassmorphism, smooth transitions

#### Admin Dashboard (Simple UI)
- **Location**: `frontend/src/pages/Dashboard.jsx`
- **Access**: `/dashboard_under` (no authentication)
- **Note**: Keep UI simple, no fancy animations needed
- **Components**: EventForm, RegistrationsList

#### Reusable Components
- **Location**: `frontend/src/components/`
- **When**: Creating reusable UI elements
- **Key Components**:
  - `EventForm.jsx` - Event creation/editing with dynamic fields
  - `RegistrationsList.jsx` - Display registrations with CSV export
  - `QRCodeModal.jsx` - Generate and display QR codes

#### API Integration
- **Location**: `frontend/src/services/api.js`
- **When**: Adding new API calls
- **Pattern**: Use axios instances with proper error handling
- **Structure**: Organized by resource (eventsApi, registrationsApi, etc.)

### Styling Changes

#### Global Styles
- **Location**: `frontend/src/styles/index.css`
- **Framework**: TailwindCSS
- **Pattern**: Use utility classes, custom CSS for complex animations

#### Component Styles
- **Pattern**: Use inline Tailwind classes
- **Animations**: Framer Motion for public pages only

## Key Features & Implementation

### Event Management
- **Backend**: `backend/app/api/events.py`, `backend/app/services/event_service.py`
- **Frontend**: `frontend/src/components/EventForm.jsx`
- **Features**:
  - Create/edit/delete events
  - Dynamic form fields per event
  - Only one active event at a time
  - Event cloning
  - Field auto-generation from labels (first 10 chars, lowercase, no special chars)

### Registration System
- **Backend**: `backend/app/api/registrations.py`, `backend/app/services/registration_service.py`
- **Frontend**: `frontend/src/pages/HomePage.jsx`
- **Features**:
  - Auto-fill based on email/phone from previous registrations
  - Dynamic form rendering based on event fields
  - User profile storage for auto-fill

### QR Code System
- **Backend**: `backend/app/api/qr_codes.py`, `backend/app/services/qr_code_service.py`
- **Frontend**: `frontend/src/components/QRCodeModal.jsx`
- **Features**:
  - Generate QR codes with custom messages or URLs
  - Check-in functionality
  - QR types: 'url' or 'text'

### CSV Export
- **Location**: `frontend/src/components/RegistrationsList.jsx`
- **Features**: Export registrations with dynamic fields
- **Note**: Properly escapes CSV data, avoids duplicate fields

## Database Schema

### Tables
1. **events** - Event information
2. **registrations** - User registrations for events
3. **user_profiles** - Stored user data for auto-fill
4. **event_fields** - Dynamic fields per event
5. **qr_codes** - Generated QR codes for events

### Key Relationships
- Event → Event Fields (one-to-many)
- Event → Registrations (one-to-many)
- Event → QR Codes (one-to-many)
- User Profile → Registrations (one-to-many via email/phone)

## Technology Stack

### Backend
- **Framework**: FastAPI
- **Database**: Turso (libsql-client, then libsql package)
- **Language**: Python 3.11+
- **Key Libraries**: pydantic, qrcode, Pillow

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Animations**: Framer Motion (public pages only)
- **State Management**: React Query (@tanstack/react-query)
- **Forms**: React Hook Form
- **Icons**: Lucide React
- **HTTP Client**: Axios

## Common Patterns

### Backend API Pattern
```python
@router.get("/")
async def get_items():
    items = await ItemService.get_all()
    return items

@router.post("/", response_model=ItemResponse)
async def create_item(item: ItemCreate):
    created = await ItemService.create(item)
    return created
```

### Frontend API Call Pattern
```javascript
export const itemsApi = {
  getAll: () => axios.get('/api/items/'),
  create: (data) => axios.post('/api/items/', data),
  update: (id, data) => axios.put(`/api/items/${id}`, data),
};
```

### Frontend Component Pattern (with animations)
```javascript
import { motion } from 'framer-motion';

export default function Component() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Content */}
    </motion.div>
  );
}
```

## Important Notes

### DO
- ✅ Use Framer Motion for animations on public pages
- ✅ Auto-generate field identifiers from labels
- ✅ Maintain field ordering using field_order
- ✅ Keep dashboard UI simple and functional
- ✅ Use TailwindCSS utility classes
- ✅ Handle errors gracefully with toast notifications
- ✅ Follow REST API conventions with trailing slashes

### DON'T
- ❌ Add authentication (not required per spec)
- ❌ Add animations to dashboard pages
- ❌ Use an ORM (direct SQL with Turso)
- ❌ Allow multiple active events simultaneously
- ❌ Manual field identifiers (auto-generate from labels)
- ❌ Forget to handle email/phone for auto-fill

## Deployment

### Backend
- **Platform**: Render
- **Config**: `render.yaml`
- **Database**: Turso (cloud SQLite)
- **Environment Variables**: Set in Render dashboard

### Frontend
- **Platform**: Render (static site)
- **Build**: `npm run build`
- **Output**: `dist/`

## Access Points

- **Public Registration**: `/` (http://localhost:3000)
- **Dashboard**: `/dashboard_under` (http://localhost:3000/dashboard_under)
- **Thank You Page**: `/thank-you` (after registration)
- **Check-in**: `/check-in/:eventId/:qrId` (QR code redirect)
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Development Workflow

1. **Backend Changes**: Modify files in `backend/app/`, server auto-reloads
2. **Frontend Changes**: Modify files in `frontend/src/`, HMR updates instantly
3. **Database Changes**: Update SQL in service initialization
4. **New Features**: Follow the patterns above, keep consistency
5. **Testing**: Manual testing via UI and API docs

## Quick Reference

### Start Servers
```bash
# Backend
cd backend
source venv/bin/activate
python3 -m app.main

# Frontend
cd frontend
npm run dev
```

### Key Environment Variables
- `TURSO_DATABASE_URL` - Turso database URL
- `TURSO_AUTH_TOKEN` - Turso authentication token

### Common Tasks
- **Add field to event**: Update EventForm.jsx, add to form submission
- **Add API endpoint**: Create router in api/, add service method
- **Add animation**: Use Framer Motion in public pages
- **Export data**: Update RegistrationsList.jsx CSV logic
- **Change styling**: Use Tailwind classes or update index.css
