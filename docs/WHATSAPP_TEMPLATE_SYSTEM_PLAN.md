# WhatsApp Template-Based Messaging System - Implementation Plan

> **Status:** Planning Phase
> **Branch:** `feature/whatsapp-templates`
> **Estimated Implementation Time:** 6-8 hours

## Problem Statement

WhatsApp Business API has strict messaging policies:
1. **24-Hour Window Limitation:** Free-form messages can only be sent within 24 hours of a user's last message
2. **No Workarounds:** Cannot bypass this restriction
3. **Current Implementation:** Our system only supports free-form messages, making it non-compliant

## Solution: Template-Based Messaging (Industry Standard)

### How Companies Actually Do It

**Key Strategy:** Use Meta-approved message templates for all business-initiated messages

✅ **Template messages can be sent anytime** (no 24-hour limitation)
✅ **Templates support variables** for personalization (e.g., `{{name}}`, `{{event_date}}`)
✅ **Approval is fast** (usually instant, max 48 hours)
✅ **Fully compliant** with WhatsApp Business policies
✅ **Works in sandbox AND production**

## Research Findings

### WhatsApp Messaging Rules (2025)

1. **Session Messages (Free-Form)**
   - Only available within 24 hours of user's last message
   - Completely free to send
   - No template approval needed
   - **Limitation:** Cannot initiate conversations

2. **Template Messages**
   - Can be sent anytime (no 24-hour restriction)
   - Must be pre-approved by Meta
   - Support variable placeholders
   - Small cost per message (~₹0.75)
   - **Perfect for:** Event confirmations, reminders, updates

3. **Approval Process**
   - Submit via Twilio API
   - AI-powered review (usually instant)
   - Manual review if flagged (up to 48 hours)
   - Categories: Utility, Marketing, Authentication

### Compliance Requirements

- ✅ Explicit opt-in required (checkbox during registration)
- ✅ Store opt-in timestamp for audit trail
- ✅ Include "Reply STOP to unsubscribe" in messages
- ✅ Honor opt-outs immediately
- ✅ GDPR-compliant data handling

---

## Implementation Plan

### Phase 1: Database Schema Updates

#### Add to `registrations` table:
```sql
ALTER TABLE registrations ADD COLUMN whatsapp_opt_in INTEGER DEFAULT 0;
ALTER TABLE registrations ADD COLUMN whatsapp_opt_in_timestamp TEXT;
```

#### New table: `whatsapp_approved_templates`
```sql
CREATE TABLE whatsapp_approved_templates (
    id TEXT PRIMARY KEY,
    template_name TEXT NOT NULL UNIQUE,
    template_sid TEXT,  -- Twilio Content SID
    category TEXT NOT NULL,  -- 'utility', 'marketing', 'authentication'
    content TEXT NOT NULL,  -- Template content with {{variables}}
    variables TEXT,  -- JSON array of variable names
    approval_status TEXT DEFAULT 'pending',  -- 'pending', 'approved', 'rejected'
    approved_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_templates_status ON whatsapp_approved_templates(approval_status);
```

#### New table: `whatsapp_message_logs`
```sql
CREATE TABLE whatsapp_message_logs (
    id TEXT PRIMARY KEY,
    registration_id TEXT,
    template_id TEXT,  -- NULL if free-form message
    message_type TEXT NOT NULL,  -- 'template' or 'free_form'
    message_content TEXT,
    phone TEXT,
    delivery_status TEXT,  -- 'sent', 'delivered', 'read', 'failed'
    twilio_sid TEXT,
    error_message TEXT,
    sent_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE,
    FOREIGN KEY (template_id) REFERENCES whatsapp_approved_templates(id)
);

CREATE INDEX idx_message_logs_registration ON whatsapp_message_logs(registration_id);
CREATE INDEX idx_message_logs_phone ON whatsapp_message_logs(phone);
```

---

### Phase 2: Pre-Built Templates (Submit for Approval)

#### Template 1: Event Registration Confirmation (Utility)
```
Hello {{name}}!

Your registration for {{event_name}} is confirmed! 🎉

📅 Date: {{event_date}}
⏰ Time: {{event_time}}
📍 Venue: {{venue}}

See you there!
- Build2Learn Team
```

**Variables:** `name`, `event_name`, `event_date`, `event_time`, `venue`

---

#### Template 2: Event Reminder (Utility)
```
Hi {{name}}!

Reminder: {{event_name}} is tomorrow!

📅 {{event_date}} at {{event_time}}
📍 {{venue}}

Don't forget to bring your confirmation email.

Reply STOP to unsubscribe.
```

**Variables:** `name`, `event_name`, `event_date`, `event_time`, `venue`

---

#### Template 3: General Event Update (Marketing)
```
Hi {{name}}!

We have an important update about {{event_name}}.

{{update_message}}

Reply to this message if you have questions.

- Build2Learn Team
```

**Variables:** `name`, `event_name`, `update_message`

---

#### Template 4: Custom Notification (Marketing)
```
Hi {{name}}!

{{custom_message}}

Reply to this message for more details.

Reply STOP to unsubscribe.
- Build2Learn
```

**Variables:** `name`, `custom_message`

---

### Phase 3: Backend Implementation

#### File: `backend/app/services/whatsapp_template_service.py` (NEW)

```python
"""
WhatsApp Template Management Service
Handles template creation, submission, and approval status tracking
"""

from typing import List, Dict, Optional
import json
from twilio.rest import Client
from app.core.database import db
import uuid

class WhatsAppTemplateService:
    """Manage WhatsApp message templates"""

    def __init__(self):
        self.twilio_client = Client()  # Uses env vars

    async def create_template(
        self,
        template_name: str,
        category: str,
        content: str,
        variables: List[str]
    ) -> Dict:
        """Create a new template in database"""

        template_id = str(uuid.uuid4())

        await db.execute(
            """
            INSERT INTO whatsapp_approved_templates
            (id, template_name, category, content, variables, approval_status)
            VALUES (?, ?, ?, ?, ?, 'pending')
            """,
            [template_id, template_name, category, content, json.dumps(variables)]
        )

        return {
            "id": template_id,
            "template_name": template_name,
            "status": "pending"
        }

    async def submit_to_twilio(self, template_id: str) -> Dict:
        """Submit template to Twilio/Meta for approval"""

        template = await db.fetch_one(
            "SELECT * FROM whatsapp_approved_templates WHERE id = ?",
            [template_id]
        )

        if not template:
            raise ValueError("Template not found")

        # Create Content Template via Twilio API
        content = self.twilio_client.content.contents.create(
            friendly_name=template['template_name'],
            language='en',
            variables={var: f"{{{{1}}}}" for var in json.loads(template['variables'])},
            types={
                'twilio/text': {
                    'body': template['content']
                }
            }
        )

        # Update template with Twilio SID
        await db.execute(
            """
            UPDATE whatsapp_approved_templates
            SET template_sid = ?, approval_status = 'pending'
            WHERE id = ?
            """,
            [content.sid, template_id]
        )

        return {
            "template_id": template_id,
            "twilio_sid": content.sid,
            "status": "submitted"
        }

    async def check_approval_status(self, template_id: str) -> Dict:
        """Check template approval status from Twilio"""

        template = await db.fetch_one(
            "SELECT template_sid FROM whatsapp_approved_templates WHERE id = ?",
            [template_id]
        )

        if not template or not template['template_sid']:
            raise ValueError("Template not submitted yet")

        # Fetch from Twilio
        content = self.twilio_client.content.contents(template['template_sid']).fetch()

        status = "approved" if content.approval_requests else "pending"

        # Update in database
        if status == "approved":
            await db.execute(
                """
                UPDATE whatsapp_approved_templates
                SET approval_status = 'approved', approved_at = CURRENT_TIMESTAMP
                WHERE id = ?
                """,
                [template_id]
            )

        return {
            "template_id": template_id,
            "status": status
        }

    async def get_approved_templates(self) -> List[Dict]:
        """Get all approved templates"""

        templates = await db.fetch_all(
            """
            SELECT id, template_name, category, content, variables
            FROM whatsapp_approved_templates
            WHERE approval_status = 'approved'
            ORDER BY created_at DESC
            """
        )

        return [
            {
                "id": t['id'],
                "template_name": t['template_name'],
                "category": t['category'],
                "content": t['content'],
                "variables": json.loads(t['variables'])
            }
            for t in templates
        ]

    async def delete_template(self, template_id: str) -> bool:
        """Delete template from database"""

        await db.execute(
            "DELETE FROM whatsapp_approved_templates WHERE id = ?",
            [template_id]
        )

        return True

# Singleton instance
whatsapp_template_service = WhatsAppTemplateService()
```

---

#### File: `backend/app/services/whatsapp_service.py` (ENHANCED)

Add these methods to existing `WhatsAppService` class:

```python
async def send_template_message(
    self,
    phone: str,
    template_sid: str,
    variables: Dict[str, str],
    registration_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Send a WhatsApp template message

    Args:
        phone: Recipient phone number
        template_sid: Twilio Content SID of approved template
        variables: Dict of variable names and values
        registration_id: Optional registration ID for logging

    Returns:
        Dict with status and message SID
    """
    try:
        formatted_number = self.format_phone_number(phone)

        # Send template via Twilio
        twilio_message = self.client.messages.create(
            from_=self.whatsapp_number,
            to=formatted_number,
            content_sid=template_sid,
            content_variables=json.dumps(variables)
        )

        # Log message
        await self._log_message(
            registration_id=registration_id,
            phone=phone,
            message_type='template',
            template_sid=template_sid,
            twilio_sid=twilio_message.sid,
            delivery_status='sent'
        )

        return {
            "success": True,
            "message_sid": twilio_message.sid,
            "status": twilio_message.status,
            "to": formatted_number
        }

    except TwilioRestException as e:
        await self._log_message(
            registration_id=registration_id,
            phone=phone,
            message_type='template',
            delivery_status='failed',
            error_message=str(e)
        )

        return {
            "success": False,
            "error": str(e)
        }

async def send_bulk_template_messages(
    self,
    event_id: str,
    template_sid: str,
    global_variables: Dict[str, str],
    filter_field: Optional[str] = None,
    filter_value: Optional[str] = None
) -> Dict[str, Any]:
    """
    Send template messages to all opted-in registrants

    Args:
        event_id: Event ID
        template_sid: Twilio Content SID
        global_variables: Variables common to all messages
        filter_field: Optional field to filter by
        filter_value: Optional value to match

    Returns:
        Summary of sent messages
    """
    # Get opted-in registrations
    query = """
        SELECT id, email, phone, form_data
        FROM registrations
        WHERE event_id = ? AND whatsapp_opt_in = 1
    """
    params = [event_id]

    if filter_field and filter_value:
        query += " AND json_extract(form_data, ?) = ?"
        params.extend([f'$.{filter_field}', filter_value])

    registrations = await db.fetch_all(query, params)

    results = []
    sent_count = 0
    failed_count = 0

    for reg in registrations:
        form_data = json.loads(reg['form_data'])

        # Merge global variables with form data
        variables = {**global_variables, **form_data}

        # Send template message
        result = await self.send_template_message(
            phone=reg['phone'],
            template_sid=template_sid,
            variables=variables,
            registration_id=reg['id']
        )

        if result['success']:
            sent_count += 1
        else:
            failed_count += 1

        results.append({
            "registration_id": reg['id'],
            "email": reg['email'],
            "phone": reg['phone'],
            "status": "sent" if result['success'] else "failed",
            "error": result.get('error')
        })

    return {
        "success": True,
        "total": len(registrations),
        "sent": sent_count,
        "failed": failed_count,
        "results": results
    }

async def _log_message(
    self,
    phone: str,
    message_type: str,
    delivery_status: str,
    registration_id: Optional[str] = None,
    template_sid: Optional[str] = None,
    twilio_sid: Optional[str] = None,
    message_content: Optional[str] = None,
    error_message: Optional[str] = None
):
    """Log WhatsApp message to database"""

    log_id = str(uuid.uuid4())

    await db.execute(
        """
        INSERT INTO whatsapp_message_logs
        (id, registration_id, template_id, message_type, message_content,
         phone, delivery_status, twilio_sid, error_message)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        [
            log_id, registration_id, template_sid, message_type,
            message_content, phone, delivery_status, twilio_sid, error_message
        ]
    )
```

---

### Phase 4: API Endpoints

#### File: `backend/app/api/whatsapp_templates.py` (NEW)

```python
"""
WhatsApp Template Management API
"""

from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from pydantic import BaseModel
from app.services.whatsapp_template_service import whatsapp_template_service
from app.core.auth import clerk_auth, AuthenticatedUser

router = APIRouter(prefix="/whatsapp/templates", tags=["whatsapp-templates"])


class TemplateCreateRequest(BaseModel):
    template_name: str
    category: str  # 'utility', 'marketing', 'authentication'
    content: str
    variables: List[str]


@router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_template(
    request: TemplateCreateRequest,
    auth: AuthenticatedUser = Depends(clerk_auth)
):
    """Create a new message template"""

    try:
        result = await whatsapp_template_service.create_template(
            template_name=request.template_name,
            category=request.category,
            content=request.content,
            variables=request.variables
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/submit/{template_id}", status_code=status.HTTP_200_OK)
async def submit_template(
    template_id: str,
    auth: AuthenticatedUser = Depends(clerk_auth)
):
    """Submit template to Twilio/Meta for approval"""

    try:
        result = await whatsapp_template_service.submit_to_twilio(template_id)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/status/{template_id}", status_code=status.HTTP_200_OK)
async def check_template_status(
    template_id: str,
    auth: AuthenticatedUser = Depends(clerk_auth)
):
    """Check template approval status"""

    try:
        result = await whatsapp_template_service.check_approval_status(template_id)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/approved", status_code=status.HTTP_200_OK)
async def get_approved_templates(
    auth: AuthenticatedUser = Depends(clerk_auth)
):
    """Get all approved templates"""

    try:
        templates = await whatsapp_template_service.get_approved_templates()
        return {"templates": templates}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_template(
    template_id: str,
    auth: AuthenticatedUser = Depends(clerk_auth)
):
    """Delete a template"""

    try:
        await whatsapp_template_service.delete_template(template_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
```

---

#### File: `backend/app/api/whatsapp.py` (ENHANCED)

Add new endpoint for template-based bulk sending:

```python
@router.post("/send-template-bulk/", status_code=status.HTTP_200_OK)
async def send_bulk_template_messages(
    event_id: str,
    template_sid: str,
    global_variables: Dict[str, str],
    filter_field: Optional[str] = None,
    filter_value: Optional[str] = None,
    auth: AuthenticatedUser = Depends(clerk_auth)
):
    """
    Send template messages to opted-in registrants

    - **event_id**: Event ID
    - **template_sid**: Twilio Content SID of approved template
    - **global_variables**: Variables common to all messages
    - **filter_field**: Optional field to filter by
    - **filter_value**: Optional value to match
    """

    try:
        whatsapp_service = WhatsAppService()

        result = await whatsapp_service.send_bulk_template_messages(
            event_id=event_id,
            template_sid=template_sid,
            global_variables=global_variables,
            filter_field=filter_field,
            filter_value=filter_value
        )

        return result

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send template messages: {str(e)}"
        )


@router.get("/opt-in-stats/{event_id}", status_code=status.HTTP_200_OK)
async def get_opt_in_statistics(event_id: str):
    """Get WhatsApp opt-in statistics for an event"""

    try:
        # Total registrations
        total = await db.fetch_one(
            "SELECT COUNT(*) as count FROM registrations WHERE event_id = ?",
            [event_id]
        )

        # Opted-in registrations
        opted_in = await db.fetch_one(
            """
            SELECT COUNT(*) as count FROM registrations
            WHERE event_id = ? AND whatsapp_opt_in = 1
            """,
            [event_id]
        )

        return {
            "event_id": event_id,
            "total_registrations": total['count'],
            "opted_in": opted_in['count'],
            "opted_out": total['count'] - opted_in['count'],
            "opt_in_rate": round((opted_in['count'] / total['count'] * 100), 2) if total['count'] > 0 else 0
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
```

---

### Phase 5: Frontend Implementation

#### File: `frontend/src/components/WhatsAppTemplateManager.jsx` (NEW)

React component for managing templates in the dashboard.

**Features:**
- Create new templates
- View all templates with approval status
- Submit templates to Meta
- Check approval status
- Delete templates
- Template library with preview

---

#### File: `frontend/src/components/WhatsAppModal.jsx` (ENHANCED)

Update existing modal to support template selection:

**Changes:**
1. Add "Message Type" toggle: Template / Free-Form
2. Template selection dropdown (approved templates only)
3. Variable input fields (dynamic based on selected template)
4. Show opt-in statistics
5. Preview message with substituted variables
6. Show which users will receive message

---

#### File: `frontend/src/components/EventForm.jsx` (ENHANCED)

Add WhatsApp opt-in checkbox to registration form:

```jsx
<div className="flex items-center space-x-2">
  <input
    type="checkbox"
    id="whatsapp_opt_in"
    {...register('whatsapp_opt_in')}
    className="h-4 w-4 text-blue-600 rounded"
  />
  <label htmlFor="whatsapp_opt_in" className="text-sm text-gray-700">
    📱 I agree to receive WhatsApp updates about this event from Build2Learn
  </label>
</div>
```

---

### Phase 6: Workflow Updates

#### New Workflow: Template-Based Messaging

**Step 1: Admin Creates Templates**
1. Go to Dashboard → WhatsApp Templates tab
2. Create 4 default templates (see template examples above)
3. Click "Submit to Meta" for each template
4. Wait for approval (usually instant)
5. Templates marked as "Approved" ✅

**Step 2: User Registration (with Opt-In)**
1. User fills out registration form
2. Checks "Receive WhatsApp updates" checkbox
3. Submits form
4. Backend stores `whatsapp_opt_in = true` with timestamp
5. *(Optional)* Auto-send confirmation template

**Step 3: Send Bulk Messages**
1. Admin clicks "Send WhatsApp" in registrations list
2. Modal shows two options:
   - **Use Template** (recommended) ✅
   - Send Free-Form (only for users within 24h window)
3. Admin selects approved template
4. Fills in global variables (e.g., `event_date`, `custom_message`)
5. System shows preview with sample data
6. Admin clicks "Send"
7. System sends template to all opted-in users immediately
8. No 24-hour limitation! 🎉

---

### Phase 7: Configuration Updates

#### File: `backend/.env`

```bash
# WhatsApp Template Settings (add these)
WHATSAPP_TEMPLATE_ENABLED=true
WHATSAPP_AUTO_CONFIRM=false  # Auto-send confirmation on registration

# Twilio Content API
TWILIO_CONTENT_SID=HX...  # Confirmation template SID (after approval)
```

---

## Files to Create/Modify Summary

### Backend (6 new, 4 modified)
- ✨ `backend/app/services/whatsapp_template_service.py`
- ✨ `backend/app/api/whatsapp_templates.py`
- ✨ `backend/app/models/whatsapp_template.py`
- ✨ `backend/tests/test_whatsapp_templates.py`
- 📝 `backend/app/core/schema_manager.py` (add 3 tables)
- 📝 `backend/app/services/whatsapp_service.py` (add template methods)
- 📝 `backend/app/api/whatsapp.py` (add template endpoints)
- 📝 `backend/app/api/registrations.py` (handle opt-in field)
- 📝 `backend/app/main.py` (register template router)
- 📝 `backend/.env.example` (add template config)

### Frontend (3 new, 3 modified)
- ✨ `frontend/src/components/WhatsAppTemplateManager.jsx`
- ✨ `frontend/src/components/TemplateVariableForm.jsx`
- ✨ `frontend/src/pages/WhatsAppTemplatesTab.jsx`
- 📝 `frontend/src/components/WhatsAppModal.jsx` (add template mode)
- 📝 `frontend/src/components/EventForm.jsx` (add opt-in checkbox)
- 📝 `frontend/src/services/api.js` (add template API calls)

### Documentation (2 modified)
- 📝 `docs/WHATSAPP_SETUP.md` (add template setup section)
- 📝 `CHANGELOG.md` (document all changes)

---

## Testing Strategy

1. **Unit Tests**
   - Template creation and validation
   - Template submission to Twilio
   - Approval status checking
   - Message sending with templates
   - Opt-in handling

2. **Integration Tests**
   - End-to-end template submission
   - Bulk template sending
   - Variable substitution
   - Opt-in flow

3. **Manual Testing**
   - Create template in UI
   - Submit to Meta (sandbox)
   - Wait for approval
   - Send test template message
   - Verify delivery

---

## Migration Steps

1. Run database migrations (add 3 new tables, 2 columns)
2. Create 4 default templates in database
3. Admin submits templates via UI
4. Wait for Meta approval (test in sandbox)
5. Update registration form with opt-in checkbox
6. Update WhatsApp modal with template selection
7. Test with real registrations
8. Deploy to production

---

## Advantages of This Approach

✅ **No 24-hour limitation** - Send anytime using templates
✅ **WhatsApp compliant** - Follows all business API policies
✅ **Personalization** - Variables for custom data
✅ **Professional** - Pre-approved, consistent messaging
✅ **Scalable** - Works for 10 or 10,000 users
✅ **Audit trail** - Log all messages sent
✅ **Opt-in management** - GDPR compliant
✅ **Cost effective** - ~₹0.75 per message
✅ **Production ready** - Used by all major platforms

---

## Cost Breakdown

**Sandbox (Testing):**
- FREE trial credit: $15-20
- 50 messages/day limit
- Perfect for development

**Production:**
- Per template message: ~₹0.75
- No monthly fees
- Pay-as-you-go

**Example Costs:**
- 100 messages/month: ₹75
- 500 messages/month: ₹375
- 1000 messages/month: ₹750

---

## Next Steps After This Plan

1. Review and approve this plan
2. Create implementation tasks
3. Set up development environment
4. Implement Phase 1 (Database)
5. Implement Phase 2 (Backend Services)
6. Implement Phase 3 (API Endpoints)
7. Implement Phase 4 (Frontend Components)
8. Test in Twilio sandbox
9. Submit templates for approval
10. Deploy to production

---

## References

- [Twilio WhatsApp Templates Documentation](https://www.twilio.com/docs/whatsapp/tutorial/send-whatsapp-notification-messages-templates)
- [WhatsApp Business Platform Policies](https://www.whatsapp.com/legal/business-policy)
- [Meta Template Approval Process](https://developers.facebook.com/docs/whatsapp/message-templates)
- [Twilio Content API](https://www.twilio.com/docs/content)

---

**Document Version:** 1.0
**Last Updated:** 2025-10-16
**Author:** Claude Code Assistant
