# API Documentation - MagPie Event Registration Platform

Complete API reference for all endpoints with request/response examples.

## Base URL

- **Development**: `http://localhost:8000/api`
- **Production**: `https://your-domain.com/api`

## Authentication

All admin endpoints require Clerk authentication. Public endpoints (registration forms, QR check-in) do not require authentication.

**Authentication Headers:**
```
Authorization: Bearer <clerk_jwt_token>
```

**Protected Endpoints:** All endpoints except:
- `POST /api/registrations/` (public registration)
- `GET /api/events/active/` (public active event view)
- `POST /api/registrations/check-in/{event_id}` (QR check-in)
- `GET /api/registrations/profile/autofill` (auto-fill functionality)

---

## Events API

### List All Events

```http
GET /api/events/
```

**Response** (200):
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Tech Workshop 2025",
    "description": "Learn web development",
    "date": "2025-10-15",
    "time": "10:00 AM",
    "venue": "Tech Hub, Building A",
    "venue_map_link": "https://maps.google.com/...",
    "is_active": true,
    "admin_user_id": "user_12345",
    "created_at": "2025-10-01T10:00:00Z",
    "updated_at": "2025-10-01T10:00:00Z",
    "fields": []
  }
]
```

### Get Active Event

```http
GET /api/events/active/
```

**Response** (200):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Tech Workshop 2025",
  "is_active": true,
  "admin_user_id": "user_12345",
  "fields": [
    {
      "id": "field-001",
      "event_id": "550e8400-e29b-41d4-a716-446655440000",
      "field_name": "fullname",
      "field_type": "text",
      "field_label": "Full Name",
      "is_required": true,
      "field_order": 0,
      "admin_user_id": "user_12345"
    }
  ]
}
```

### Create Event

```http
POST /api/events/
```

**Request Body**:
```json
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

**Response** (201):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Tech Workshop 2025",
  "is_active": false,
  "admin_user_id": "user_12345",
  "created_at": "2025-10-01T10:00:00Z",
  "updated_at": "2025-10-01T10:00:00Z",
  "fields": []
}
```

### Update Event

```http
PATCH /api/events/{id}
```

**Request Body** (partial update):
```json
{
  "name": "Updated Event Name",
  "description": "New description"
}
```

### Toggle Event Status

```http
POST /api/events/{id}/toggle
```

Activates the event and deactivates all others (only one event can be active).

### Clone Event

```http
POST /api/events/{id}/clone?new_name=Cloned Event Name
```

**Response** (201):
```json
{
  "id": "new-event-id",
  "name": "Cloned Event Name",
  "is_active": false,
  "admin_user_id": "user_12345",
  "created_at": "2025-10-01T10:00:00Z",
  "updated_at": "2025-10-01T10:00:00Z",
  "fields": []
}
```

### Delete Event

```http
DELETE /api/events/{id}
```

**Response** (204): No content

---

## Registrations API

### Create Registration

```http
POST /api/registrations/
```

**Request Body**:
```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "phone": "9876543210",
  "form_data": {
    "fullname": "John Doe",
    "tshirtsize": "M"
  }
}
```

**Response** (201):
```json
{
  "id": "registration-id",
  "event_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "phone": "9876543210",
  "is_checked_in": false,
  "created_at": "2025-10-01T10:00:00Z"
}
```

### Get Registration

```http
GET /api/registrations/{id}
```

### Get User Profile for Auto-fill

```http
GET /api/registrations/profile/autofill?email=user@example.com
```

or

```http
GET /api/registrations/profile/autofill?phone=9876543210
```

**Response** (200):
```json
{
  "email": "user@example.com",
  "phone": "9876543210",
  "profile_data": {
    "fullname": "John Doe",
    "tshirtsize": "M"
  }
}
```

### Check-in User

```http
POST /api/registrations/check-in/{event_id}
```

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Checked in successfully",
  "registration": {
    "id": "registration-id",
    "is_checked_in": true,
    "checked_in_at": "2025-10-15T10:30:00Z"
  }
}
```

### Get Event Registrations

```http
GET /api/events/{id}/registrations/
```

**Response** (200):
```json
[
  {
    "id": "registration-id",
    "email": "user@example.com",
    "phone": "9876543210",
    "form_data": {...},
    "is_checked_in": true,
    "checked_in_at": "2025-10-15T10:30:00Z",
    "created_at": "2025-10-01T10:00:00Z"
  }
]
```

---

## QR Codes API

### Create QR Code

```http
POST /api/qr-codes/
```

**Request Body**:
```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "WiFi Password: SecurePass123",
  "qr_type": "message"
}
```

or

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "https://example.com/resources",
  "qr_type": "url"
}
```

**Response** (201):
```json
{
  "id": "qr-code-id",
  "event_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "WiFi Password: SecurePass123",
  "qr_type": "text",
  "admin_user_id": "user_12345",
  "qr_image": "base64_encoded_image_data",
  "created_at": "2025-10-01T10:00:00Z"
}
```

### Get QR Code

```http
GET /api/qr-codes/{id}
```

### Get Event QR Codes

```http
GET /api/qr-codes/event/{event_id}
```

### Delete QR Code

```http
DELETE /api/qr-codes/{id}
```

---

## Message Templates API

### Create Message Template

```http
POST /api/message-templates/
```

**Request Body**:
```json
{
  "template_name": "Event Reminder",
  "template_text": "Hi {{name}}! Don't forget about our event on {{date}} at {{venue}}. See you there! 🎉"
}
```

**Response** (201):
```json
{
  "id": "template-id",
  "template_name": "Event Reminder",
  "template_text": "Hi {{name}}! Don't forget about our event on {{date}} at {{venue}}. See you there! 🎉",
  "admin_user_id": "user_12345",
  "created_at": "2025-10-01T10:00:00Z",
  "updated_at": "2025-10-01T10:00:00Z",
  "variables": ["name", "date", "venue"]
}
```

### Get All Message Templates

```http
GET /api/message-templates/
```

**Response** (200):
```json
[
  {
    "id": "template-id",
    "template_name": "Event Reminder",
    "template_text": "Hi {{name}}! Don't forget about our event...",
    "admin_user_id": "user_12345",
    "created_at": "2025-10-01T10:00:00Z",
    "updated_at": "2025-10-01T10:00:00Z",
    "variables": ["name", "date", "venue"]
  }
]
```

### Get Message Template

```http
GET /api/message-templates/{template_id}
```

### Update Message Template

```http
PUT /api/message-templates/{template_id}
```

**Request Body** (partial update):
```json
{
  "template_name": "Updated Reminder",
  "template_text": "Hello {{name}}! Reminder for {{event_name}} on {{date}}."
}
```

### Delete Message Template

```http
DELETE /api/message-templates/{template_id}
```

**Response** (200):
```json
{
  "message": "Template deleted successfully"
}
```

---

## Branding API

### Get Branding Settings

```http
GET /api/branding/
```

**Response** (200):
```json
{
  "id": "default",
  "site_title": "MagPie Events",
  "site_headline": "Where Innovation Meets Community",
  "logo_url": null,
  "text_style": "gradient",
  "theme": "default",
  "updated_at": "2025-10-01T10:00:00Z"
}
```

### Update Branding Settings

```http
PUT /api/branding/
```

**Request Body** (partial update):
```json
{
  "site_title": "My Event Platform",
  "site_headline": "Register for amazing events",
  "logo_url": "https://example.com/logo.png",
  "text_style": "solid",
  "theme": "dark"
}
```

---

## WhatsApp API

### Send Bulk Messages

```http
POST /api/whatsapp/send-bulk/
```

**Request Body**:
```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Hi! Reminder about our event tomorrow. See you there! 🎉",
  "template_id": null,
  "template_variables": null,
  "send_to": "all",
  "filter_field": null,
  "filter_value": null
}
```

or using a template:

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": null,
  "template_id": "template-id",
  "template_variables": {
    "name": "John",
    "event_name": "Tech Workshop",
    "date": "2025-10-15"
  },
  "send_to": "all"
}
```

**Response** (200):
```json
{
  "success": true,
  "total": 50,
  "sent": 48,
  "failed": 2,
  "results": [
    {
      "registration_id": "reg-001",
      "email": "user1@example.com",
      "phone": "9876543210",
      "status": "queued",
      "message_sid": "SM1234567890",
      "error": null
    },
    {
      "registration_id": "reg-002",
      "email": "user2@example.com",
      "phone": "9876543211",
      "status": "failed",
      "message_sid": null,
      "error": "Recipient not in sandbox"
    }
  ]
}
```

### Get Registrants Count

```http
GET /api/whatsapp/registrants-count/{event_id}
```

**Response** (200):
```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440000",
  "count": 50
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "detail": "Validation error message"
}
```

### 404 Not Found

```json
{
  "detail": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "detail": "Internal server error message"
}
```

---

## Rate Limiting

Currently, no rate limiting is implemented. For production, consider adding rate limiting middleware.

---

## CORS

CORS is configured to allow requests from:
- `http://localhost:3000` (development)
- Your production frontend URL (configured via `FRONTEND_URL` env variable)

---

## API Versioning

Currently at version 1.0. All endpoints are under `/api/` prefix.

---

## Interactive API Documentation

Visit `http://localhost:8000/docs` for interactive Swagger UI documentation where you can:
- View all endpoints
- Test API calls directly
- See request/response schemas
- Download OpenAPI specification

---

## Next Steps

- [Features Documentation](FEATURES.md)
- [Setup Guide](SETUP.md)
- [WhatsApp Setup](WHATSAPP_SETUP.md)
- [Deployment Guide](DEPLOYMENT.md)
