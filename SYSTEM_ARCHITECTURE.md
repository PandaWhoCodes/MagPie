# System Architecture - Build2Learn Registration System

## Table of Contents
1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [System Design](#system-design)
4. [Database Architecture](#database-architecture)
5. [Backend Architecture](#backend-architecture)
6. [Frontend Architecture](#frontend-architecture)
7. [Data Flow](#data-flow)
8. [API Design](#api-design)
9. [Security Architecture](#security-architecture)
10. [Deployment Architecture](#deployment-architecture)
11. [Performance Considerations](#performance-considerations)

---

## Overview

The Build2Learn Registration System is a full-stack event management and registration platform built with modern technologies. It follows a client-server architecture with a React frontend, FastAPI backend, and Turso (SQLite) database.

### Key Characteristics
- **Architecture Pattern**: Client-Server, REST API
- **Database Strategy**: Embedded replica with remote sync
- **State Management**: Server-side with client caching
- **Authentication**: None (as per requirements)
- **Deployment**: Stateless containers on Render

### Design Principles
1. **Simplicity** - No unnecessary complexity or over-engineering
2. **Performance** - Embedded replica, client-side caching, debounced requests
3. **Flexibility** - Dynamic form fields, no rigid schema constraints
4. **User Experience** - Smooth animations, auto-fill, instant feedback
5. **Developer Experience** - Hot reload, type safety, clear separation of concerns

---

## Technology Stack

### Backend Stack
```
FastAPI (Web Framework)
    ├── Pydantic (Data Validation)
    ├── Uvicorn (ASGI Server)
    ├── libsql (Database Client)
    ├── qrcode + Pillow (QR Generation)
    ├── Twilio (WhatsApp Messaging)
    └── Python 3.11+ (Runtime)
```

### Frontend Stack
```
React 18 (UI Library)
    ├── Vite (Build Tool)
    ├── TailwindCSS (Styling)
    ├── Framer Motion (Animations)
    ├── React Query (State Management)
    ├── React Hook Form (Form Handling)
    ├── React Router DOM (Routing)
    ├── Axios (HTTP Client)
    └── Lucide React (Icons)
```

### Database Stack
```
Turso (Cloud SQLite)
    ├── Embedded Replica (Local Copy)
    ├── Remote Sync (Cloud Backup)
    └── libsql Protocol
```

### Deployment Stack
```
Render (Platform)
    ├── Web Service (Backend)
    ├── Static Site (Frontend)
    └── Environment Variables
```

---

## System Design

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Browser    │  │    Mobile    │  │   Tablet     │         │
│  │  (React App) │  │  (React App) │  │ (React App)  │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
└─────────┼──────────────────┼──────────────────┼────────────────┘
          │                  │                  │
          │        HTTPS/REST API (Axios)       │
          │                  │                  │
┌─────────┼──────────────────┼──────────────────┼────────────────┐
│         │       Application Layer (FastAPI)   │                │
│  ┌──────▼──────────────────▼──────────────────▼──────┐         │
│  │              API Gateway (CORS)                    │         │
│  ├────────────────────────────────────────────────────┤         │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │  │
│  │  │  Events  │  │   Regs   │  │ QR Codes │  │ WhatsApp │  │  │
│  │  │ Router   │  │  Router  │  │  Router  │  │  Router  │  │  │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  │  │
│  └───────┼─────────────┼─────────────┼──────────────┘         │
│  ┌───────▼─────────────▼─────────────▼──────────────┐         │
│  │           Service Layer (Business Logic)          │         │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │  │
│  │  │  Event   │  │   Reg    │  │  QRCode  │  │ WhatsApp │  │  │
│  │  │ Service  │  │ Service  │  │ Service  │  │ Service  │  │  │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  │  │
│  └───────┼─────────────┼─────────────┼─────────────┘         │
└──────────┼─────────────┼─────────────┼───────────────────────┘
           │             │             │
           │      Database Layer       │
           │             │             │
┌──────────▼─────────────▼─────────────▼───────────────────────┐
│                  Database Manager                             │
│  ┌──────────────────────────────────────────────────┐        │
│  │         Embedded Replica (local.db)              │        │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │        │
│  │  │events│ │ regs │ │users │ │fields│ │ qrs  │  │        │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘  │        │
│  └────────────────────┬─────────────────────────────┘        │
│                       │ Sync                                  │
│  ┌────────────────────▼─────────────────────────────┐        │
│  │   Turso Cloud (Remote Database)                  │        │
│  │   libsql://b2lregistration-*.turso.io            │        │
│  └──────────────────────────────────────────────────┘        │
└───────────────────────────────────────────────────────────────┘
```

### Component Interaction Diagram

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │ Interacts
       ▼
┌─────────────────────────────────────────┐
│         Frontend (React)                │
│  ┌─────────────────────────────────┐   │
│  │  Pages                          │   │
│  │  ├─ HomePage (Registration)     │   │
│  │  ├─ Dashboard (Admin)           │   │
│  │  ├─ ThankYouPage                │   │
│  │  └─ CheckInPage (QR)            │   │
│  └──────────┬──────────────────────┘   │
│  ┌──────────▼──────────────────────┐   │
│  │  Components                     │   │
│  │  ├─ EventForm                   │   │
│  │  ├─ RegistrationsList           │   │
│  │  └─ QRCodeModal                 │   │
│  └──────────┬──────────────────────┘   │
│  ┌──────────▼──────────────────────┐   │
│  │  Services (API Layer)           │   │
│  │  └─ api.js (Axios)              │   │
│  └──────────┬──────────────────────┘   │
└─────────────┼───────────────────────────┘
              │ HTTP/REST
┌─────────────▼───────────────────────────┐
│         Backend (FastAPI)               │
│  ┌─────────────────────────────────┐   │
│  │  API Routes                     │   │
│  │  ├─ /api/events                 │   │
│  │  ├─ /api/registrations          │   │
│  │  ├─ /api/qr-codes               │   │
│  │  ├─ /api/event-fields           │   │
│  │  └─ /api/branding               │   │
│  └──────────┬──────────────────────┘   │
│  ┌──────────▼──────────────────────┐   │
│  │  Services (Business Logic)      │   │
│  │  ├─ EventService                │   │
│  │  ├─ RegistrationService         │   │
│  │  ├─ QRCodeService               │   │
│  │  └─ WhatsAppService             │   │
│  └──────────┬──────────────────────┘   │
│  ┌──────────▼──────────────────────┐   │
│  │  Database Manager               │   │
│  │  └─ execute/fetch methods       │   │
│  └──────────┬──────────────────────┘   │
└─────────────┼───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│         Database (Turso)                │
│  ┌─────────────────────────────────┐   │
│  │  Local Replica (SQLite)         │   │
│  └──────────┬──────────────────────┘   │
│             │ Sync                      │
│  ┌──────────▼──────────────────────┐   │
│  │  Remote Cloud (Turso)           │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## Database Architecture

### Schema Overview

```sql
-- Schema Version Tracking
CREATE TABLE schema_version (
    version INTEGER PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events Table
CREATE TABLE events (
    id TEXT PRIMARY KEY,                    -- UUID
    name TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,                     -- ISO date string
    time TEXT NOT NULL,                     -- Time string
    venue TEXT NOT NULL,
    venue_map_link TEXT,                    -- Google Maps URL
    is_active BOOLEAN DEFAULT 0,            -- Only one can be active
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event Fields (Dynamic Form Configuration)
CREATE TABLE event_fields (
    id TEXT PRIMARY KEY,                    -- UUID
    event_id TEXT NOT NULL,
    field_label TEXT NOT NULL,              -- Display label
    field_identifier TEXT NOT NULL,         -- Auto-generated from label
    field_type TEXT NOT NULL,               -- text, email, phone, textarea, select, checkbox, radio
    is_required BOOLEAN DEFAULT 0,
    options TEXT,                           -- JSON array for select/checkbox/radio
    field_order INTEGER DEFAULT 0,          -- For ordering fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Registrations Table
CREATE TABLE registrations (
    id TEXT PRIMARY KEY,                    -- UUID
    event_id TEXT NOT NULL,
    email TEXT NOT NULL,                    -- Required field
    phone TEXT NOT NULL,                    -- Required field
    form_data TEXT NOT NULL,                -- JSON object with all form responses
    checked_in BOOLEAN DEFAULT 0,           -- Check-in status
    checked_in_at TIMESTAMP,                -- Check-in timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    UNIQUE(event_id, email)                 -- Prevent duplicate registrations
);

-- User Profiles (For Auto-fill)
CREATE TABLE user_profiles (
    id TEXT PRIMARY KEY,                    -- UUID
    email TEXT UNIQUE,                      -- Primary identifier
    phone TEXT,                             -- Secondary identifier
    profile_data TEXT NOT NULL,             -- JSON object with all known fields
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- QR Codes Table
CREATE TABLE qr_codes (
    id TEXT PRIMARY KEY,                    -- UUID
    event_id TEXT NOT NULL,
    qr_type TEXT NOT NULL,                  -- 'url' or 'text'
    qr_content TEXT NOT NULL,               -- The message or URL
    qr_image_data TEXT NOT NULL,            -- Base64 encoded PNG
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);
```

### Entity Relationships

```
┌──────────────────┐
│     Events       │
│  ┌────────────┐  │
│  │ id (PK)    │◄─┼────────────┐
│  │ name       │  │            │
│  │ is_active  │  │            │
│  └────────────┘  │            │
└────────┬─────────┘            │
         │                      │
         │ 1:N                  │ 1:N
         │                      │
    ┌────▼──────────────┐  ┌───┴──────────────┐
    │  Event Fields     │  │  Registrations   │
    │  ┌──────────────┐ │  │  ┌─────────────┐ │
    │  │ id (PK)      │ │  │  │ id (PK)     │ │
    │  │ event_id(FK) │ │  │  │ event_id(FK)│ │
    │  │ field_label  │ │  │  │ email       │ │
    │  │ field_type   │ │  │  │ phone       │ │
    │  └──────────────┘ │  │  │ form_data   │ │
    └───────────────────┘  │  │ checked_in  │ │
                           │  └─────────────┘ │
                           └──────┬───────────┘
                                  │
                                  │ N:1 (via email/phone)
                                  │
                           ┌──────▼───────────┐
                           │  User Profiles   │
                           │  ┌─────────────┐ │
                           │  │ id (PK)     │ │
                           │  │ email       │ │
                           │  │ phone       │ │
                           │  │ profile_data│ │
                           │  └─────────────┘ │
                           └──────────────────┘

┌──────────────────┐
│     Events       │◄──────────┐
└──────────────────┘           │
                               │ 1:N
                        ┌──────┴──────────┐
                        │   QR Codes      │
                        │  ┌────────────┐ │
                        │  │ id (PK)    │ │
                        │  │ event_id(FK)│ │
                        │  │ qr_type    │ │
                        │  │ qr_content │ │
                        │  │ qr_image   │ │
                        │  └────────────┘ │
                        └─────────────────┘
```

### Database Connection Strategy

```
Application Startup
       │
       ▼
┌──────────────────────────────────────┐
│  Database.connect()                  │
│  1. Connect to local.db              │
│  2. Set sync_url to Turso            │
│  3. Provide auth_token               │
│  4. Sync with remote                 │
│  5. Initialize SchemaManager         │
│  6. Apply pending migrations         │
└──────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Normal Operation                    │
│  - Reads: Local replica (fast)       │
│  - Writes: Local + sync to cloud     │
│  - Commit: db.commit() + db.sync()   │
└──────────────────────────────────────┘
       │
       ▼
Application Shutdown
       │
       ▼
┌──────────────────────────────────────┐
│  Database.close()                    │
│  - Final sync                        │
│  - Close connection                  │
└──────────────────────────────────────┘
```

### Schema Migration System

```python
class SchemaManager:
    def __init__(self, conn):
        self.conn = conn
        self.migrations = [
            self.migration_001_initial_schema,
            self.migration_002_add_branding,
            # Future migrations go here
        ]

    def sync_schema(self):
        # 1. Create schema_version table if not exists
        # 2. Get current version
        # 3. Apply pending migrations in order
        # 4. Update version after each migration
```

---

## Backend Architecture

### Directory Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI app entry point
│   │
│   ├── core/                      # Core functionality
│   │   ├── __init__.py
│   │   ├── config.py              # Settings (Pydantic BaseSettings)
│   │   ├── database.py            # Database connection manager
│   │   └── schema_manager.py      # Schema migrations
│   │
│   ├── api/                       # API route handlers
│   │   ├── __init__.py
│   │   ├── events.py              # Event CRUD endpoints
│   │   ├── registrations.py       # Registration endpoints
│   │   ├── qr_codes.py            # QR code endpoints
│   │   ├── event_fields.py        # Dynamic fields endpoints
│   │   └── branding.py            # Branding endpoints
│   │
│   ├── services/                  # Business logic
│   │   ├── __init__.py
│   │   ├── event_service.py       # Event management logic
│   │   ├── registration_service.py# Registration logic
│   │   └── qr_code_service.py     # QR code generation
│   │
│   └── models/                    # Pydantic models
│       ├── __init__.py
│       ├── event.py               # Event schemas
│       ├── registration.py        # Registration schemas
│       └── qr_code.py             # QR code schemas
│
├── requirements.txt               # Python dependencies
├── .env                           # Environment variables
└── local.db                       # Local database replica
```

### Application Lifecycle

```python
# main.py

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler"""
    # Startup
    await db.connect()          # Connect to database
    # Sync happens automatically
    # Schema migrations applied
    print("✅ Database connected")

    yield  # Application runs

    # Shutdown
    await db.close()            # Close database
    print("👋 Database closed")

app = FastAPI(
    title="Build2Learn Registration",
    version="1.0.0",
    lifespan=lifespan,
)
```

### Request Flow

```
HTTP Request
    │
    ▼
┌─────────────────────────────┐
│  FastAPI Router             │
│  - Route matching           │
│  - CORS check               │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  Pydantic Validation        │
│  - Parse request body       │
│  - Validate types           │
│  - Return 422 if invalid    │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  Route Handler              │
│  - Extract parameters       │
│  - Call service method      │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  Service Layer              │
│  - Business logic           │
│  - Data transformation      │
│  - Database operations      │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  Database Manager           │
│  - Execute SQL              │
│  - Commit transaction       │
│  - Sync to cloud            │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  Response                   │
│  - Serialize with Pydantic  │
│  - Add headers              │
│  - Return JSON              │
└─────────────────────────────┘
```

### Service Layer Pattern

```python
# services/event_service.py

class EventService:
    @staticmethod
    async def create_event(event_data: EventCreate) -> dict:
        # 1. Generate UUID
        event_id = str(uuid4())

        # 2. Insert event
        await db.execute(
            "INSERT INTO events (...) VALUES (...)",
            [event_id, event_data.name, ...]
        )

        # 3. Insert event fields
        for field in event_data.fields:
            field_id = str(uuid4())
            identifier = generate_identifier(field.label)
            await db.execute(
                "INSERT INTO event_fields (...) VALUES (...)",
                [field_id, event_id, field.label, identifier, ...]
            )

        # 4. Return created event
        return await EventService.get_event_by_id(event_id)
```

---

## Frontend Architecture

### Directory Structure

```
frontend/
├── src/
│   ├── main.jsx                   # React entry point
│   ├── App.jsx                    # Root component with routing
│   │
│   ├── pages/                     # Page components
│   │   ├── HomePage.jsx           # Public registration (animated)
│   │   ├── ThankYouPage.jsx       # Post-registration (animated)
│   │   ├── CheckInPage.jsx        # QR check-in (animated)
│   │   └── Dashboard.jsx          # Admin dashboard (simple)
│   │
│   ├── components/                # Reusable components
│   │   ├── EventForm.jsx          # Create/edit event form
│   │   ├── RegistrationsList.jsx  # View registrations
│   │   └── QRCodeModal.jsx        # QR code management
│   │
│   ├── services/                  # API integration
│   │   └── api.js                 # Axios API calls
│   │
│   └── styles/                    # Styling
│       └── index.css              # TailwindCSS + custom styles
│
├── package.json                   # Dependencies
├── vite.config.js                 # Vite configuration
├── tailwind.config.js             # Tailwind configuration
└── .env                           # Environment variables
```

### Component Hierarchy

```
App (Router)
│
├─ HomePage (Public)
│  └─ Registration Form
│     ├─ Email/Phone inputs (with auto-fill)
│     └─ Dynamic fields (from event)
│
├─ ThankYouPage (Public)
│  └─ Success message with confetti
│
├─ CheckInPage (Public)
│  └─ Check-in form
│     └─ Email input + custom message display
│
└─ Dashboard (Admin)
   ├─ Event List
   │  └─ Event Cards (with action buttons)
   │
   ├─ EventForm Modal
   │  ├─ Basic event details
   │  └─ Dynamic field builder
   │
   ├─ RegistrationsList Modal
   │  ├─ Search bar
   │  ├─ Registration table
   │  └─ CSV export button
   │
   └─ QRCodeModal
      ├─ QR code generator
      ├─ QR code preview
      └─ QR code list
```

### State Management Strategy

```
┌──────────────────────────────────────┐
│         React Query                  │
│  (Server State Management)           │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  Query Keys                    │ │
│  │  - ['events']                  │ │
│  │  - ['events', eventId]         │ │
│  │  - ['event', 'active']         │ │
│  │  - ['registrations', eventId]  │ │
│  │  - ['qr-codes', eventId]       │ │
│  │  - ['user-profile', identifier]│ │
│  └────────────────────────────────┘ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  Features                      │ │
│  │  - Automatic caching           │ │
│  │  - Background refetching       │ │
│  │  - Optimistic updates          │ │
│  │  - Error handling              │ │
│  │  - Loading states              │ │
│  └────────────────────────────────┘ │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│      React Hook Form                 │
│  (Form State Management)             │
│                                      │
│  - Field registration                │
│  - Validation                        │
│  - Error messages                    │
│  - Submit handling                   │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│       Local State                    │
│  (useState, useEffect)               │
│                                      │
│  - UI state (modals, dropdowns)      │
│  - Temporary form data               │
│  - Animation triggers                │
└──────────────────────────────────────┘
```

### API Service Layer

```javascript
// services/api.js

// Axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Organized by resource
export const eventsApi = {
  getAll: () => api.get('/api/events/'),
  getActive: () => api.get('/api/events/active/'),
  getById: (id) => api.get(`/api/events/${id}`),
  create: (data) => api.post('/api/events/', data),
  update: (id, data) => api.patch(`/api/events/${id}`, data),
  toggle: (id) => api.post(`/api/events/${id}/toggle`),
  clone: (id, name) => api.post(`/api/events/${id}/clone`, { new_name: name }),
  delete: (id) => api.delete(`/api/events/${id}`),
  getRegistrations: (id) => api.get(`/api/events/${id}/registrations/`),
};

// Similar structure for registrations, qr_codes, etc.
```

### Animation Strategy

```
Public Pages (HomePage, ThankYouPage, CheckInPage)
    │
    ├─ Framer Motion animations
    │  ├─ Page transitions (fade, slide)
    │  ├─ Form field animations (stagger)
    │  ├─ Button hover effects
    │  ├─ Confetti (success celebration)
    │  └─ Ripple effects (check-in)
    │
    └─ Glassmorphism UI
       ├─ Backdrop blur
       ├─ Translucent backgrounds
       └─ Gradient borders

Admin Pages (Dashboard)
    │
    └─ No animations (simple & fast)
       ├─ Standard transitions
       └─ Functional UI
```

---

## Data Flow

### Registration Flow (Complete)

```
1. User arrives at homepage
        │
        ▼
┌──────────────────────────────────────┐
│  GET /api/events/active/             │
│  - Fetch currently active event      │
│  - Returns event + fields            │
└───────────────┬──────────────────────┘
                │
                ▼
        Event displayed
        Form rendered with dynamic fields
                │
                ▼
2. User enters email or phone
        │
        ▼ (1-second debounce)
┌──────────────────────────────────────┐
│  GET /api/registrations/profile/     │
│  autofill?email=...&phone=...        │
│  - Fetch user profile                │
│  - Returns profile_data (JSON)       │
└───────────────┬──────────────────────┘
                │
                ▼
        Auto-fill matching fields
        User completes remaining fields
                │
                ▼
3. User submits form
        │
        ▼
┌──────────────────────────────────────┐
│  POST /api/registrations/            │
│  {                                   │
│    event_id: "...",                  │
│    email: "...",                     │
│    phone: "...",                     │
│    form_data: { ... }                │
│  }                                   │
└───────────────┬──────────────────────┘
                │
                ▼
┌──────────────────────────────────────┐
│  Backend Processing                  │
│  1. Check for duplicate (event+email)│
│  2. Create registration record       │
│  3. Upsert user_profile              │
│  4. Return registration ID           │
└───────────────┬──────────────────────┘
                │
                ▼
        Success response
        Redirect to /thank-you
        Confetti animation plays
```

### Event Creation Flow

```
1. Admin clicks "Create Event"
        │
        ▼
   EventForm modal opens
        │
        ▼
2. Admin fills event details
   - Name, description
   - Date, time, venue
   - Adds custom fields
        │
        ▼
3. Admin submits form
        │
        ▼
┌──────────────────────────────────────┐
│  POST /api/events/                   │
│  {                                   │
│    name: "...",                      │
│    description: "...",               │
│    date: "...",                      │
│    time: "...",                      │
│    venue: "...",                     │
│    venue_map_link: "...",            │
│    fields: [                         │
│      {                               │
│        label: "Full Name",           │
│        type: "text",                 │
│        required: true,               │
│        order: 0                      │
│      },                              │
│      ...                             │
│    ]                                 │
│  }                                   │
└───────────────┬──────────────────────┘
                │
                ▼
┌──────────────────────────────────────┐
│  Backend Processing                  │
│  1. Generate event UUID              │
│  2. Insert into events table         │
│  3. For each field:                  │
│     - Generate field UUID            │
│     - Auto-generate identifier       │
│     - Insert into event_fields       │
│  4. Return complete event            │
└───────────────┬──────────────────────┘
                │
                ▼
        Success response
        Event added to list
        Modal closes
        React Query refetches
```

### QR Code Check-in Flow

```
1. User scans QR code
        │
        ▼
   Redirect to /check-in/:eventId/:qrId
        │
        ▼
┌──────────────────────────────────────┐
│  GET /api/qr-codes/:qrId             │
│  - Fetch QR code details             │
│  - Validate QR exists                │
└───────────────┬──────────────────────┘
                │
                ▼
   Check-in page displayed
   User enters email
        │
        ▼
2. User submits email
        │
        ▼
┌──────────────────────────────────────┐
│  POST /api/registrations/            │
│  check-in/:eventId                   │
│  { email: "..." }                    │
└───────────────┬──────────────────────┘
                │
                ▼
┌──────────────────────────────────────┐
│  Backend Processing                  │
│  1. Find registration by event+email │
│  2. Update checked_in = 1            │
│  3. Set checked_in_at = now          │
│  4. Return success                   │
└───────────────┬──────────────────────┘
                │
                ▼
        Success response
        Display custom message/URL
        Ripple animation plays
```

### WhatsApp Bulk Messaging Flow

```
1. Admin clicks "Send WhatsApp" button
        │
        ▼
   WhatsAppModal opens
   Shows registrant count
        │
        ▼
2. Admin types message
        │
        ▼
3. Admin clicks "Send"
        │
        ▼
┌──────────────────────────────────────┐
│  POST /api/whatsapp/send-bulk/       │
│  {                                   │
│    event_id: "...",                  │
│    message: "..."                    │
│  }                                   │
└───────────────┬──────────────────────┘
                │
                ▼
┌──────────────────────────────────────┐
│  WhatsAppService.send_bulk_messages  │
│  1. Fetch all registrations          │
│  2. Format phone numbers (+91)       │
│  3. Send via Twilio API              │
│  4. Track success/failure            │
└───────────────┬──────────────────────┘
                │
                ▼
        Response with statistics
        {
          success: true,
          total: 50,
          sent: 48,
          failed: 2,
          results: [...]
        }
                │
                ▼
   Display summary in modal
   Show failed messages if any
```

---

## API Design

### RESTful Conventions

```
Resource: Events

GET    /api/events/              # List all events
GET    /api/events/active/       # Get active event (special)
GET    /api/events/{id}          # Get specific event
POST   /api/events/              # Create event
PATCH  /api/events/{id}          # Update event
DELETE /api/events/{id}          # Delete event

POST   /api/events/{id}/toggle   # Action: Toggle active status
POST   /api/events/{id}/clone    # Action: Clone event

GET    /api/events/{id}/registrations/  # Sub-resource

# WhatsApp API
POST   /api/whatsapp/send-bulk/              # Send bulk messages
GET    /api/whatsapp/registrants-count/{event_id}  # Get count
```

### Request/Response Patterns

**Create Event Request:**
```json
POST /api/events/
{
  "name": "Tech Workshop 2025",
  "description": "Learn web development",
  "date": "2025-10-15",
  "time": "10:00 AM",
  "venue": "Tech Hub, Building A",
  "venue_map_link": "https://maps.google.com/...",
  "fields": [
    {
      "label": "Full Name",
      "type": "text",
      "required": true,
      "order": 0
    },
    {
      "label": "T-Shirt Size",
      "type": "select",
      "required": true,
      "options": ["S", "M", "L", "XL"],
      "order": 1
    }
  ]
}
```

**Create Event Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Tech Workshop 2025",
  "description": "Learn web development",
  "date": "2025-10-15",
  "time": "10:00 AM",
  "venue": "Tech Hub, Building A",
  "venue_map_link": "https://maps.google.com/...",
  "is_active": false,
  "created_at": "2025-10-02T12:00:00Z",
  "updated_at": "2025-10-02T12:00:00Z",
  "fields": [
    {
      "id": "650e8400-e29b-41d4-a716-446655440001",
      "event_id": "550e8400-e29b-41d4-a716-446655440000",
      "field_label": "Full Name",
      "field_identifier": "fullname",
      "field_type": "text",
      "is_required": true,
      "options": null,
      "field_order": 0
    },
    {
      "id": "750e8400-e29b-41d4-a716-446655440002",
      "event_id": "550e8400-e29b-41d4-a716-446655440000",
      "field_label": "T-Shirt Size",
      "field_identifier": "tshirtsiz",
      "field_type": "select",
      "is_required": true,
      "options": "[\"S\", \"M\", \"L\", \"XL\"]",
      "field_order": 1
    }
  ]
}
```

### Error Handling

```json
// Validation Error (422)
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}

// Business Logic Error (400)
{
  "detail": "Cannot activate event: another event is already active"
}

// Not Found (404)
{
  "detail": "Event not found"
}

// Server Error (500)
{
  "detail": "Internal server error"
}
```

---

## Security Architecture

### Current Security Measures

1. **Input Validation**
   - Pydantic models validate all inputs
   - Type checking prevents injection
   - Required fields enforced

2. **SQL Injection Prevention**
   - Parameterized queries only
   - No string concatenation
   ```python
   # Safe
   await db.execute("SELECT * FROM events WHERE id = ?", [event_id])

   # Never done
   await db.execute(f"SELECT * FROM events WHERE id = '{event_id}'")
   ```

3. **CORS Configuration**
   - Whitelist frontend URL
   - Credentials allowed
   - Proper headers

4. **XSS Prevention**
   - React auto-escapes output
   - No dangerouslySetInnerHTML
   - Content-Type headers set

5. **CSV Injection Prevention**
   - Proper escaping in CSV export
   - Quote all fields
   - Escape special characters

### Security Limitations (Intentional)

1. **No Authentication**
   - Dashboard accessible to anyone via `/dashboard_under`
   - No user management
   - No role-based access control
   - **Reason**: Per requirements, simplicity

2. **No Rate Limiting**
   - APIs can be called frequently
   - No request throttling
   - **Recommendation**: Add in production

3. **No HTTPS Enforcement**
   - Local development uses HTTP
   - **Recommendation**: Use HTTPS in production (Render provides this)

### Future Security Enhancements

```
Priority 1 (Production Must-Have):
├─ Add authentication (JWT or session-based)
├─ Rate limiting (per IP or per user)
├─ HTTPS enforcement
└─ Security headers (CSP, HSTS, etc.)

Priority 2 (Nice to Have):
├─ API key authentication for external access
├─ Audit logging for admin actions
├─ Input sanitization for file uploads
└─ CAPTCHA for public registration
```

---

## Deployment Architecture

### Local Development

```
┌──────────────────────────────────┐
│  Developer Machine               │
│                                  │
│  ┌────────────────────────────┐ │
│  │  Frontend (Vite Dev Server)│ │
│  │  http://localhost:3000     │ │
│  │  - Hot Module Replacement  │ │
│  └────────────────────────────┘ │
│                                  │
│  ┌────────────────────────────┐ │
│  │  Backend (Uvicorn --reload)│ │
│  │  http://localhost:8000     │ │
│  │  - Auto-reload on change   │ │
│  └────────────────────────────┘ │
│                                  │
│  ┌────────────────────────────┐ │
│  │  Database (local.db)       │ │
│  │  - Embedded replica        │ │
│  │  - Syncs to Turso cloud    │ │
│  └────────────────────────────┘ │
└──────────────────────────────────┘
```

### Production Deployment (Render)

```
┌─────────────────────────────────────────────────────────┐
│                    Render Platform                      │
│                                                         │
│  ┌────────────────────────────────────────────────┐   │
│  │  Static Site (Frontend)                        │   │
│  │  https://b2l-registration.onrender.com         │   │
│  │                                                │   │
│  │  - Built from /frontend                        │   │
│  │  - npm run build                               │   │
│  │  - Serves /dist folder                         │   │
│  │  - CDN caching                                 │   │
│  └────────────────┬───────────────────────────────┘   │
│                   │ HTTPS/REST API                     │
│  ┌────────────────▼───────────────────────────────┐   │
│  │  Web Service (Backend)                         │   │
│  │  https://b2l-api.onrender.com                  │   │
│  │                                                │   │
│  │  - Python 3.11 runtime                         │   │
│  │  - uvicorn app.main:app                        │   │
│  │  - Auto-deploy on push                         │   │
│  │  - Health check: /health                       │   │
│  │  - Environment variables from dashboard        │   │
│  └────────────────┬───────────────────────────────┘   │
└────────────────────┼──────────────────────────────────┘
                     │
                     │ libsql protocol
                     │
┌────────────────────▼──────────────────────────────────┐
│              Turso Cloud Database                     │
│  libsql://b2lregistration-*.aws-ap-south-1.turso.io  │
│                                                       │
│  - SQLite-compatible                                  │
│  - Multi-region replication                           │
│  - Automatic backups                                  │
│  - Low latency with embedded replica                  │
└───────────────────────────────────────────────────────┘
```

### Deployment Configuration (`render.yaml`)

```yaml
services:
  # Backend Service
  - type: web
    name: b2l-registration-api
    env: python
    buildCommand: "pip install -r requirements.txt"
    startCommand: "uvicorn app.main:app --host 0.0.0.0 --port $PORT"
    envVars:
      - key: TURSO_DATABASE_URL
        sync: false  # Set in dashboard
      - key: TURSO_AUTH_TOKEN
        sync: false  # Set in dashboard
      - key: FRONTEND_URL
        value: https://b2l-registration.onrender.com
    healthCheckPath: /health

  # Frontend Service
  - type: web
    name: b2l-registration-frontend
    env: static
    buildCommand: "cd frontend && npm install && npm run build"
    staticPublishPath: frontend/dist
```

### Environment Configuration

**Backend (.env):**
```env
TURSO_DATABASE_URL=libsql://b2lregistration-*.aws-ap-south-1.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...
FRONTEND_URL=http://localhost:3000  # or production URL
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:8000  # or production URL
```

---

## Performance Considerations

### Backend Performance

1. **Database Strategy**
   ```
   Embedded Replica Benefits:
   ├─ Read queries: ~1ms (local SQLite)
   ├─ Write queries: ~5-10ms (local + sync)
   ├─ No network latency for reads
   └─ Automatic sync to cloud for durability

   Trade-offs:
   ├─ Slightly stale reads (eventual consistency)
   └─ Extra disk space for replica
   ```

2. **Query Optimization**
   - Indexes on foreign keys
   - Limit result sets
   - Use prepared statements
   - Batch operations where possible

3. **Response Caching**
   - Currently no caching layer
   - React Query caches on client
   - Future: Add Redis for active event

### Frontend Performance

1. **Build Optimizations**
   ```
   Vite automatically:
   ├─ Code splitting
   ├─ Tree shaking
   ├─ Minification
   ├─ Asset optimization
   └─ Lazy loading
   ```

2. **React Query Caching**
   ```javascript
   {
     staleTime: 5 * 60 * 1000,  // 5 minutes
     cacheTime: 10 * 60 * 1000, // 10 minutes
     refetchOnWindowFocus: false,
   }
   ```

3. **Debouncing**
   - Auto-fill: 1-second debounce
   - Search: 300ms debounce
   - Prevents excessive API calls

4. **Animation Performance**
   - Framer Motion uses GPU acceleration
   - Will-change CSS hints
   - Only animate transform and opacity

### Scalability Considerations

**Current Limits:**
```
Events: Unlimited (practical limit ~10,000)
Registrations per event: ~100,000
Concurrent users: ~1,000
Database size: 5GB (Turso free tier)
API requests: Unlimited
```

**Bottlenecks:**
```
1. QR code generation (CPU-intensive)
   → Solution: Generate async or cache

2. CSV export for large datasets
   → Solution: Streaming response or background job

3. Turso free tier limits
   → Solution: Upgrade to paid tier

4. Single active event restriction
   → Solution: Business logic, not technical
```

---

## Monitoring & Observability

### Health Checks

```python
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "timestamp": datetime.utcnow().isoformat()
    }
```

### Logging Strategy

```
Backend:
├─ Application logs: print() statements
├─ Error logs: FastAPI automatic
├─ Access logs: Uvicorn
└─ Database logs: libsql client

Frontend:
├─ Error boundary: React
├─ Console errors: Browser DevTools
└─ Network logs: Axios interceptors
```

### Future Monitoring Enhancements

```
Priority 1:
├─ Structured logging (JSON)
├─ Error tracking (Sentry)
├─ Performance monitoring (APM)
└─ Uptime monitoring (Render or external)

Priority 2:
├─ User analytics (PostHog, Mixpanel)
├─ Database query profiling
├─ API response time tracking
└─ Business metrics dashboard
```

---

## Conclusion

This architecture provides a solid foundation for the Build2Learn Registration System. It balances simplicity with functionality, performance with maintainability, and current needs with future scalability.

### Key Strengths
- Simple, easy to understand
- Fast performance with embedded replica
- Flexible with dynamic form fields
- Good separation of concerns
- Type-safe with Pydantic
- Modern frontend with smooth UX

### Areas for Improvement
- Add authentication in production
- Implement rate limiting
- Add comprehensive monitoring
- Consider caching layer for scale
- Improve error handling and recovery

### Maintenance Guidelines
1. Keep CHANGELOG.md updated with all changes
2. Document new features in this file
3. Update claude.md with development notes
4. Follow existing patterns for consistency
5. Test thoroughly before deploying

---

**Last Updated**: 2025-10-02
**Version**: 1.0.0
**Maintained By**: Build2Learn Team
