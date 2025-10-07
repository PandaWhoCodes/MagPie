# Features Documentation - MagPie Event Registration Platform

Comprehensive guide to all features and functionality.

## Table of Contents
- [Event Management](#event-management)
- [Registration System](#registration-system)
- [QR Code Check-ins](#qr-code-check-ins)
- [WhatsApp Notifications](#whatsapp-notifications)
- [Data Export](#data-export)
- [Auto-fill System](#auto-fill-system)

---

## Event Management

### Creating Events

1. Navigate to Dashboard (`/dashboard_under`)
2. Click **"Create Event"** button
3. Fill in event details:
   - **Event Name**: Required
   - **Description**: Event details
   - **Date**: Event date
   - **Time**: Event start time
   - **Venue**: Physical location
   - **Maps Link**: Optional Google Maps URL

4. Add custom registration fields:
   - **Field Types**: text, email, phone, textarea, select, radio, checkbox
   - **Required/Optional**: Toggle per field
   - **Options**: For select, radio, checkbox fields
   - **Field Order**: Drag to reorder

5. Click **"Create Event"**

**Note**: Email and phone are mandatory fields (auto-included).

### Managing Events

**Event Cards** show:
- Event name and description
- Date, time, venue
- Registration count
- Active/Inactive status
- Quick action buttons

**Available Actions**:
- ✏️ **Edit**: Modify event details and fields
- 🔄 **Clone**: Duplicate event with new name
- 👥 **View Registrations**: See all registrants
- 📱 **Send WhatsApp**: Bulk message to registrants
- 📥 **Export CSV**: Download registration data
- 🔗 **Create QR Code**: Generate check-in QR codes
- 🗑️ **Delete**: Permanently remove event
- ⚡ **Toggle Active**: Activate/deactivate (only one active at a time)

### Event Activation

- **Only one event can be active** at a time
- Active event appears on public registration page
- Toggling activates selected event and deactivates others
- Inactive events preserve all registrations

---

## Registration System

### Public Registration Flow

1. **User visits homepage** (`/`)
2. **Active event loads** automatically
3. **User enters email/phone**
   - System checks for existing profile
   - Auto-fills known data after 1 second
4. **User completes form**
   - All required fields must be filled
   - Dynamic validation per field type
5. **Submits registration**
   - Duplicate check (email + event)
   - Creates/updates user profile
6. **Redirects to Thank You page**
   - Confetti animation
   - Event details recap
   - Social sharing options

### Form Field Types

| Type | Description | Validation |
|------|-------------|------------|
| **text** | Single line text | Max 500 chars |
| **email** | Email address | Valid email format |
| **phone** | Phone number | 10 digits |
| **textarea** | Multi-line text | Max 2000 chars |
| **select** | Dropdown menu | Must select one option |
| **radio** | Single choice | Must select one option |
| **checkbox** | Multiple choices | Can select multiple |

### Duplicate Prevention

- **Key**: Event ID + Email
- Users cannot register twice for same event
- Clear error message if attempted
- Existing registration preserved

---

## QR Code Check-ins

### Creating QR Codes

1. Click **QR icon** on event card
2. Choose **QR Type**:
   - **Message**: Display text after check-in (WiFi passwords, instructions)
   - **URL**: Redirect to URL after check-in (resources, forms)
3. Enter **Content**
4. Click **"Generate QR Code"**
5. **Download** QR code image

### Check-in Flow

1. **User scans QR code** at event
2. **Redirects** to check-in page
3. **User enters email**
4. **System validates**:
   - Registration exists
   - Event matches
   - Not already checked in
5. **Marks as checked in**
   - Updates `checked_in = true`
   - Records `checked_in_at` timestamp
6. **Displays** custom message/URL
7. **Ripple animation** plays

### QR Code Management

- **View All**: See all QR codes for an event
- **Delete**: Remove QR code
- **Regenerate**: Create new with different content
- **Multiple QR codes** allowed per event

---

## WhatsApp Notifications

Send bulk WhatsApp messages to all event registrants with one click.

### Setup Required

1. **Twilio Account** (FREE trial with $15-20 credit)
2. **WhatsApp Sandbox** (for testing)
3. **Credentials** in `.env`

See [WHATSAPP_SETUP.md](WHATSAPP_SETUP.md) for detailed setup.

### Sending Messages

1. **Go to event registrations**
2. **Click "Send WhatsApp"** button (green)
3. **WhatsApp Modal opens**:
   - Shows recipient count
   - Multi-line message textarea
   - Character counter
   - Info about sandbox requirements

4. **Type your message**
   - Supports emojis
   - Multi-line text
   - No character limit (reasonable length recommended)

5. **Click "Send to X People"**
6. **Sending Progress**:
   - Loading spinner
   - "Sending..." state
   - Cannot close modal during send

7. **Results Summary**:
   - Total messages
   - Successfully sent
   - Failed messages
   - **Expandable failed list** with error details

### Phone Number Formatting

**Automatic formatting**:
- **No prefix**: Adds `+91` (India)
- **Has +**: Keeps as is
- **Format**: `whatsapp:+91XXXXXXXXXX`

**Examples**:
- Input: `9876543210` → Output: `whatsapp:+919876543210`
- Input: `+919876543210` → Output: `whatsapp:+919876543210`
- Input: `+14155551234` → Output: `whatsapp:+14155551234`

### Delivery Tracking

**Status codes**:
- `queued`: Message sent to Twilio
- `sent`: Delivered to recipient
- `delivered`: Confirmed delivery
- `failed`: Delivery failed

**Error messages**:
- "Recipient not in sandbox"
- "Invalid phone number"
- "Rate limit exceeded"
- Twilio-specific errors

### Pricing

- **Sandbox (Testing)**: FREE (50 messages/day on trial)
- **Production**: ~₹0.75/message (~$0.009 USD)
- **No monthly fees**: Pay per message only
- **Free window**: 24 hours after user message

---

## Data Export

### CSV Export

**From registrations list**:
1. Click **"Export CSV"** button
2. Downloads: `registrations-{eventId}-{date}.csv`

**Exported Data**:
- Email
- Phone
- Checked In (Yes/No)
- Registered At (timestamp)
- **All custom form fields**
- Properly escaped for Excel

**Features**:
- Handles special characters
- Escapes commas, quotes
- UTF-8 encoding
- Dynamic columns per event

### Data Format

```csv
Email,Phone,Checked In,Registered At,Full Name,T-Shirt Size
user@example.com,9876543210,Yes,2025-10-01 10:00:00,John Doe,M
```

---

## Auto-fill System

Remembers user data across events for faster registration.

### How It Works

1. **User enters email** (or phone)
2. **Waits 1 second** (debounce)
3. **Queries user_profiles** table
4. **Matches by email** (or phone)
5. **Auto-fills matching fields**:
   - Only fields with same identifier
   - Preserves user-entered values
   - Visual loading state

### Profile Storage

**When created**:
- First registration by email/phone

**When updated**:
- Every new registration
- Latest values preserved

**Stored data**:
- Email (unique)
- Phone
- All custom field values (JSON)

### Field Matching

**Match by identifier**:
- Field `identifier` auto-generated from label
- Example: "Full Name" → `fullname`
- Case-insensitive matching

**Not matched**:
- New fields
- Renamed fields (different identifier)
- Deleted fields

---

## User Interface

### Public Pages

**Design**: Animated, glassmorphism, modern

- **Framer Motion animations**
- **Gradient backgrounds**
- **Frosted glass effects**
- **Smooth transitions**
- **Loading states**
- **Toast notifications**

### Dashboard Pages

**Design**: Simple, functional, clean

- **No animations** (performance)
- **Clear typography**
- **Action buttons**
- **Data tables**
- **Responsive grid**
- **Light mode only**

### Responsive Design

**Mobile-first approach**:
- **Phone**: Single column, stacked
- **Tablet**: 2-column grid
- **Desktop**: Full multi-column layout

**Tested on**:
- Mobile (320px - 768px)
- Tablet (768px - 1024px)
- Desktop (1024px+)

---

## Security & Privacy

### Data Protection

- Input validation (Pydantic)
- SQL injection prevention
- XSS protection (React escaping)
- CORS configuration
- Environment variables for secrets

### No Authentication

**Design Decision**: No auth required (as per spec)

**Dashboard Access**: `/dashboard_under` (obscurity)

**For Production**: Add authentication middleware

### Data Storage

- **Database**: Turso (encrypted cloud SQLite)
- **Local replica**: Faster reads, synced to cloud
- **Backups**: Automatic via Turso

---

## Performance

### Optimizations

- **Embedded replica**: Local database copy
- **React Query caching**: Reduced API calls
- **Debounced auto-fill**: 1s delay
- **Code splitting**: Lazy loading
- **Optimized bundle**: Vite build

### Loading States

- Skeleton loaders
- Spinner animations
- Progress indicators
- Disabled buttons during actions

---

## Browser Support

**Tested on**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Mobile**:
- iOS Safari 14+
- Chrome Mobile 90+
- Samsung Internet 14+

---

## Next Steps

- [API Documentation](API.md)
- [Setup Guide](SETUP.md)
- [WhatsApp Setup](WHATSAPP_SETUP.md)
- [Deployment Guide](DEPLOYMENT.md)
