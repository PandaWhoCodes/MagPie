import uuid
import json
from typing import List, Optional
from app.core.database import db
from app.schemas.event import (
    EventCreate,
    EventUpdate,
    EventResponse,
    EventFieldResponse,
)


class EventService:
    """Service for event management"""

    @staticmethod
    async def create_event(event_data: EventCreate) -> EventResponse:
        """Create a new event"""
        event_id = str(uuid.uuid4())

        # Insert event
        await db.execute(
            """
            INSERT INTO events (id, name, description, date, time, venue,
                              venue_address, venue_map_link, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
            [
                event_id,
                event_data.name,
                event_data.description,
                event_data.date,
                event_data.time,
                event_data.venue,
                event_data.venue_address,
                event_data.venue_map_link,
                1 if event_data.is_active else 0,
            ],
        )

        # Insert event fields
        for field in event_data.fields:
            field_id = str(uuid.uuid4())
            await db.execute(
                """
                INSERT INTO event_fields (id, event_id, field_name, field_type,
                                        field_label, is_required, field_options, field_order)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
                [
                    field_id,
                    event_id,
                    field.field_name,
                    field.field_type,
                    field.field_label,
                    1 if field.is_required else 0,
                    field.field_options,
                    field.field_order,
                ],
            )

        return await EventService.get_event(event_id)

    @staticmethod
    async def get_event(event_id: str) -> Optional[EventResponse]:
        """Get event by ID"""
        event = await db.fetch_one("SELECT * FROM events WHERE id = ?", [event_id])
        if not event:
            return None

        # Get event fields
        fields_rows = await db.fetch_all(
            "SELECT * FROM event_fields WHERE event_id = ? ORDER BY field_order",
            [event_id],
        )

        fields = [
            EventFieldResponse(
                id=row["id"],
                event_id=row["event_id"],
                field_name=row["field_name"],
                field_type=row["field_type"],
                field_label=row["field_label"],
                is_required=bool(row["is_required"]),
                field_options=row["field_options"],
                field_order=row["field_order"],
            )
            for row in fields_rows
        ]

        return EventResponse(
            id=event["id"],
            name=event["name"],
            description=event["description"],
            date=event["date"],
            time=event["time"],
            venue=event["venue"],
            venue_address=event["venue_address"],
            venue_map_link=event["venue_map_link"],
            is_active=bool(event["is_active"]),
            created_at=event["created_at"],
            updated_at=event["updated_at"],
            fields=fields,
        )

    @staticmethod
    async def get_all_events() -> List[EventResponse]:
        """Get all events"""
        events = await db.fetch_all("SELECT * FROM events ORDER BY created_at DESC")
        result = []
        for event in events:
            event_response = await EventService.get_event(event["id"])
            if event_response:
                result.append(event_response)
        return result

    @staticmethod
    async def get_active_event() -> Optional[EventResponse]:
        """Get currently active event"""
        event = await db.fetch_one(
            "SELECT * FROM events WHERE is_active = 1 ORDER BY created_at DESC LIMIT 1"
        )
        if not event:
            return None
        return await EventService.get_event(event["id"])

    @staticmethod
    async def update_event(event_id: str, event_data: EventUpdate) -> Optional[EventResponse]:
        """Update event"""
        # Build update query dynamically
        update_fields = []
        params = []

        if event_data.name is not None:
            update_fields.append("name = ?")
            params.append(event_data.name)
        if event_data.description is not None:
            update_fields.append("description = ?")
            params.append(event_data.description)
        if event_data.date is not None:
            update_fields.append("date = ?")
            params.append(event_data.date)
        if event_data.time is not None:
            update_fields.append("time = ?")
            params.append(event_data.time)
        if event_data.venue is not None:
            update_fields.append("venue = ?")
            params.append(event_data.venue)
        if event_data.venue_address is not None:
            update_fields.append("venue_address = ?")
            params.append(event_data.venue_address)
        if event_data.venue_map_link is not None:
            update_fields.append("venue_map_link = ?")
            params.append(event_data.venue_map_link)
        if event_data.is_active is not None:
            update_fields.append("is_active = ?")
            params.append(1 if event_data.is_active else 0)

        if update_fields:
            update_fields.append("updated_at = CURRENT_TIMESTAMP")
            params.append(event_id)
            query = f"UPDATE events SET {', '.join(update_fields)} WHERE id = ?"
            await db.execute(query, params)

        return await EventService.get_event(event_id)

    @staticmethod
    async def toggle_event_status(event_id: str) -> Optional[EventResponse]:
        """Toggle event active status"""

        await db.execute("UPDATE events SET is_active = 1 WHERE id = ?", [event_id])

        return await EventService.get_event(event_id)

    @staticmethod
    async def delete_event(event_id: str) -> bool:
        """Delete event"""
        await db.execute("DELETE FROM events WHERE id = ?", [event_id])
        return True

    @staticmethod
    async def clone_event(event_id: str, new_name: str) -> Optional[EventResponse]:
        """Clone an existing event"""
        source_event = await EventService.get_event(event_id)
        if not source_event:
            return None

        # Create new event with same fields
        new_event_data = EventCreate(
            name=new_name,
            description=source_event.description,
            date=source_event.date,
            time=source_event.time,
            venue=source_event.venue,
            venue_address=source_event.venue_address,
            venue_map_link=source_event.venue_map_link,
            is_active=False,
            fields=[
                {
                    "field_name": field.field_name,
                    "field_type": field.field_type,
                    "field_label": field.field_label,
                    "is_required": field.is_required,
                    "field_options": field.field_options,
                    "field_order": field.field_order,
                }
                for field in source_event.fields
            ],
        )

        return await EventService.create_event(new_event_data)

    @staticmethod
    async def get_event_registrations(event_id: str) -> List[dict]:
        """Get all registrations for an event"""
        registrations = await db.fetch_all(
            "SELECT * FROM registrations WHERE event_id = ? ORDER BY created_at DESC",
            [event_id],
        )

        return [
            {
                "id": reg["id"],
                "email": reg["email"],
                "phone": reg["phone"],
                "form_data": json.loads(reg["form_data"]),
                "is_checked_in": bool(reg["is_checked_in"]),
                "checked_in_at": reg["checked_in_at"],
                "created_at": reg["created_at"],
            }
            for reg in registrations
        ]

    @staticmethod
    async def update_event_fields(event_id: str, fields: List) -> Optional[List[EventFieldResponse]]:
        """Replace all fields for an event"""
        event = await db.fetch_one("SELECT id FROM events WHERE id = ?", [event_id])
        if not event:
            return None

        # Delete existing fields
        await db.execute("DELETE FROM event_fields WHERE event_id = ?", [event_id])

        # Insert new fields
        for field in fields:
            field_id = str(uuid.uuid4())
            await db.execute(
                """
                INSERT INTO event_fields (id, event_id, field_name, field_type,
                                        field_label, is_required, field_options, field_order)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
                [
                    field_id,
                    event_id,
                    field.field_name,
                    field.field_type,
                    field.field_label,
                    1 if field.is_required else 0,
                    field.field_options,
                    field.field_order,
                ],
            )

        # Return updated fields
        event = await EventService.get_event(event_id)
        return event.fields if event else []

    @staticmethod
    async def add_event_field(event_id: str, field) -> Optional[EventFieldResponse]:
        """Add a single field to an event"""
        event = await db.fetch_one("SELECT id FROM events WHERE id = ?", [event_id])
        if not event:
            return None

        field_id = str(uuid.uuid4())

        # Get max field_order
        max_order = await db.fetch_one(
            "SELECT MAX(field_order) as max_order FROM event_fields WHERE event_id = ?",
            [event_id]
        )
        next_order = (max_order["max_order"] or 0) + 1 if max_order else 0

        await db.execute(
            """
            INSERT INTO event_fields (id, event_id, field_name, field_type,
                                    field_label, is_required, field_options, field_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
            [
                field_id,
                event_id,
                field.field_name,
                field.field_type,
                field.field_label,
                1 if field.is_required else 0,
                field.field_options,
                next_order,
            ],
        )

        return EventFieldResponse(
            id=field_id,
            event_id=event_id,
            field_name=field.field_name,
            field_type=field.field_type,
            field_label=field.field_label,
            is_required=field.is_required,
            field_options=field.field_options,
            field_order=next_order,
        )

    @staticmethod
    async def delete_event_field(event_id: str, field_id: str) -> bool:
        """Delete a field from an event"""
        result = await db.execute(
            "DELETE FROM event_fields WHERE id = ? AND event_id = ?",
            [field_id, event_id]
        )
        return True
