# Build2Learn Registration System

A professional, production-ready event registration system for Build2Learn with a Luma-inspired design.

## 🎥 Demo

Watch the demo video: [Build2Learn Registration System Demo](https://drive.google.com/file/d/1LoGf9au5TWb-CxOKrGy-izX913Js2pK4/view?usp=sharing)

## Features

### 🎯 Core Features
- **Event Management Dashboard** - Create, edit, clone, and manage events
- **Dynamic Registration Forms** - Add custom fields for each event
- **Auto-fill Functionality** - Automatically fills forms based on user's previous registrations
- **Event Activation** - Only one event can be active at a time
- **QR Code Check-ins** - Generate QR codes for attendee check-ins
- **WhatsApp Notifications** - Send bulk WhatsApp messages to all registrants ✨ NEW!
- **Registration Analytics** - View all registrations with export to CSV
- **Responsive Design** - Works perfectly on desktop and mobile

### 🔐 Admin Features (No Authentication Required)
Access dashboard at `/dashboard_under` to:
- Create new events with custom registration fields
- Clone existing events
- Activate/deactivate events
- View all registrations for each event
- **Send WhatsApp messages to all registrants** ✨ NEW!
- Export registrations to CSV
- Generate QR codes for check-ins with custom messages/URLs
- Delete events

### 👥 User Features
- View active event details
- Register with auto-filled forms (if previously registered)
- Check-in via QR code
- Clean, modern UI inspired by Luma

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Turso** - Serverless SQLite database
- **Pydantic** - Data validation
- **qrcode** - QR code generation
- **Twilio** - WhatsApp messaging API

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Query** - Data fetching
- **React Hook Form** - Form management
- **React Router** - Routing

## Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

5. Update `.env` with your credentials:
```
TURSO_DATABASE_URL=libsql://b2lregistration-pandawhocodes.aws-ap-south-1.turso.io
TURSO_AUTH_TOKEN=your_token_here
FRONTEND_URL=http://localhost:3000

# Optional: For WhatsApp feature (see docs/WHATSAPP_SETUP.md)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

6. Run the backend:
```bash
python -m app.main
```

Backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional, defaults to localhost:8000):
```bash
cp .env.example .env
```

4. Run the frontend:
```bash
npm run dev
```

Frontend will be available at `http://localhost:3000`

## Usage Guide

### Creating an Event

1. Go to `http://localhost:3000/dashboard_under`
2. Click "Create Event"
3. Fill in event details:
   - Event name, description
   - Date and time
   - Venue details with optional Google Maps link
   - Custom registration fields (email and phone are mandatory by default)
4. Choose field types: text, email, phone, textarea, select, checkbox, radio
5. Mark fields as required if needed
6. Click "Create Event"

### Managing Events

- **Activate/Deactivate**: Click the toggle icon to activate an event (only one can be active)
- **Edit**: Click the edit icon to modify event details
- **Clone**: Click the copy icon to duplicate an event with a new name
- **View Registrations**: Click the users icon to see all registrations
- **Create QR Code**: Click the QR icon to generate check-in QR codes
- **Delete**: Click the trash icon to permanently delete an event

### QR Code Check-ins

1. In the dashboard, click QR icon for an event
2. Create a new QR code with:
   - Type: Message (for WiFi password, instructions) or URL (for links)
   - Content: The message or URL to show after check-in
3. Download the QR code image
4. When attendees scan the QR code:
   - They enter their email
   - System automatically checks them in
   - Displays the message/URL you configured

### Viewing Registrations

1. Click the users icon on any event
2. Features:
   - Search by email or phone
   - See check-in status
   - View detailed form responses
   - Export all data to CSV
   - **Send WhatsApp messages to all registrants** ✨ NEW!

### 📱 WhatsApp Notifications (NEW!)

Send bulk WhatsApp messages to all event registrants with one click!

**Features:**
- 📤 Bulk messaging to all registrants
- 📱 Automatic phone number formatting (+91 for India)
- 📊 Real-time delivery tracking
- ✅ Success/failure statistics
- 💰 Cost-effective: FREE sandbox testing (50 msgs/day)

**How to Setup:**
1. See [WhatsApp Setup Guide](docs/WHATSAPP_SETUP.md) for complete instructions
2. Sign up for Twilio account (FREE trial with $15-20 credit)
3. Add Twilio credentials to `.env`
4. Recipients join sandbox by sending `join <code>` to +1 415 523 8886
5. Click "Send WhatsApp" button in registrations list

**Pricing:**
- **Sandbox**: FREE (50 messages/day on trial)
- **Production**: ~₹0.75/message (~$0.009 USD)

### User Registration Flow

1. User visits `http://localhost:3000`
2. If no active event: Shows "No events" page
3. If active event exists:
   - User enters email/phone
   - System auto-fills known information after 1 second
   - User completes remaining fields
   - Submits registration
4. User cannot register twice for the same event

## API Endpoints

### Events
- `GET /api/events` - Get all events
- `GET /api/events/active` - Get active event
- `GET /api/events/{id}` - Get event by ID
- `POST /api/events` - Create event
- `PATCH /api/events/{id}` - Update event
- `POST /api/events/{id}/toggle` - Toggle event status
- `POST /api/events/{id}/clone` - Clone event
- `DELETE /api/events/{id}` - Delete event
- `GET /api/events/{id}/registrations` - Get registrations

### Registrations
- `POST /api/registrations` - Create registration
- `GET /api/registrations/{id}` - Get registration
- `GET /api/registrations/profile/autofill` - Get user profile for auto-fill
- `POST /api/registrations/check-in/{event_id}` - Check in user

### QR Codes
- `POST /api/qr-codes` - Create QR code
- `GET /api/qr-codes/{id}` - Get QR code
- `GET /api/qr-codes/event/{event_id}` - Get event QR codes
- `DELETE /api/qr-codes/{id}` - Delete QR code

### WhatsApp
- `POST /api/whatsapp/send-bulk/` - Send bulk WhatsApp messages
- `GET /api/whatsapp/registrants-count/{event_id}` - Get registrants count

## Database Schema

### Events Table
- Event information (name, date, time, venue)
- Active status
- Timestamps

### Event Fields Table
- Custom form fields for each event
- Field configuration (type, required, options)

### Registrations Table
- User registration data
- Check-in status
- Form responses (JSON)

### User Profiles Table
- Stores user data for auto-fill feature
- Updated on each registration

### QR Codes Table
- QR code configurations
- Messages/URLs for check-in

## Deployment

### Render Deployment

1. Push code to GitHub
2. Connect repository to Render
3. Render will automatically detect `render.yaml`
4. Add `TURSO_AUTH_TOKEN` as environment variable
5. Deploy

### Manual Deployment

**Backend:**
```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm run build
# Serve the dist folder with any static file server
```

## Environment Variables

### Backend
- `TURSO_DATABASE_URL` - Turso database URL
- `TURSO_AUTH_TOKEN` - Turso authentication token
- `FRONTEND_URL` - Frontend URL for CORS
- `TWILIO_ACCOUNT_SID` - Twilio account SID (optional, for WhatsApp)
- `TWILIO_AUTH_TOKEN` - Twilio auth token (optional, for WhatsApp)
- `TWILIO_WHATSAPP_NUMBER` - Twilio WhatsApp number (optional, for WhatsApp)

### Frontend
- `VITE_API_URL` - Backend API URL

## Features Breakdown

### ✅ Implemented Features

1. **Luma-like Dashboard**
   - Beautiful, modern UI
   - Event cards with quick actions
   - Stats overview
   - Responsive design

2. **Event Management**
   - Create events with custom fields
   - Clone existing events
   - Edit event details
   - Activate/deactivate events
   - Delete events

3. **Dynamic Registration Forms**
   - Email and phone (mandatory)
   - Custom fields with multiple types
   - Field validation
   - Auto-fill from previous registrations

4. **QR Code System**
   - Generate QR codes for check-ins
   - Support for messages and URLs
   - Download QR code images
   - Automatic check-in on scan

5. **Registration Management**
   - View all registrations
   - Search functionality
   - Export to CSV
   - Check-in status tracking

6. **WhatsApp Notifications** ✨ NEW!
   - Send bulk WhatsApp messages to all registrants
   - Automatic phone number formatting
   - Real-time delivery tracking
   - Success/failure statistics
   - Twilio API integration

7. **User Experience**
   - Clean, modern design
   - Responsive on all devices
   - Toast notifications
   - Loading states
   - Error handling

## Security Notes

- Currently no authentication for dashboard (accessed via `/dashboard_under`)
- For production, add authentication middleware
- Validate all inputs on backend
- Rate limiting recommended for production

## Future Enhancements

- Add authentication for admin dashboard
- Email notifications for registrations
- SMS reminders
- Event analytics dashboard
- Multi-language support
- Payment integration
- Team registrations

## Support

For issues or questions, please contact the Build2Learn team or create an issue in the repository.

## License

MIT License - Feel free to use and modify for your needs.
