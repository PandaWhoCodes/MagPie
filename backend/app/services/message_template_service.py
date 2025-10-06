import uuid
import re
from typing import List, Optional
from app.core.database import db
from app.models.message_template import MessageTemplate, MessageTemplateCreate, MessageTemplateUpdate


class MessageTemplateService:
    """Service for managing WhatsApp message templates"""

    @staticmethod
    def extract_variables(template_text: str) -> List[str]:
        """Extract {{variables}} from template text"""
        pattern = r'\{\{([^}]+)\}\}'
        matches = re.findall(pattern, template_text)
        return list(set(matches))  # Remove duplicates

    @staticmethod
    def substitute_variables(template_text: str, variables: dict) -> str:
        """Replace {{variables}} with actual values"""
        result = template_text
        for var_name, var_value in variables.items():
            result = result.replace(f"{{{{{var_name}}}}}", str(var_value))
        return result

    async def create_template(self, template_data: MessageTemplateCreate) -> MessageTemplate:
        """Create a new message template"""
        template_id = str(uuid.uuid4())

        query = """
            INSERT INTO message_templates (id, template_name, template_text)
            VALUES (?, ?, ?)
        """

        await db.execute(query, [
            template_id,
            template_data.template_name,
            template_data.template_text
        ])

        return await self.get_template(template_id)

    async def get_all_templates(self) -> List[MessageTemplate]:
        """Get all message templates"""
        query = """
            SELECT id, template_name, template_text, created_at, updated_at
            FROM message_templates
            ORDER BY template_name ASC
        """

        rows = await db.fetch_all(query)

        templates = []
        for row in rows:
            variables = self.extract_variables(row['template_text'])
            templates.append(MessageTemplate(
                id=row['id'],
                template_name=row['template_name'],
                template_text=row['template_text'],
                created_at=row['created_at'],
                updated_at=row['updated_at'],
                variables=variables
            ))

        return templates

    async def get_template(self, template_id: str) -> Optional[MessageTemplate]:
        """Get a specific message template"""
        query = """
            SELECT id, template_name, template_text, created_at, updated_at
            FROM message_templates
            WHERE id = ?
        """

        row = await db.fetch_one(query, [template_id])

        if not row:
            return None

        variables = self.extract_variables(row['template_text'])
        return MessageTemplate(
            id=row['id'],
            template_name=row['template_name'],
            template_text=row['template_text'],
            created_at=row['created_at'],
            updated_at=row['updated_at'],
            variables=variables
        )

    async def update_template(self, template_id: str, template_data: MessageTemplateUpdate) -> Optional[MessageTemplate]:
        """Update a message template"""
        # Build update query dynamically based on provided fields
        update_fields = []
        params = []

        if template_data.template_name is not None:
            update_fields.append("template_name = ?")
            params.append(template_data.template_name)

        if template_data.template_text is not None:
            update_fields.append("template_text = ?")
            params.append(template_data.template_text)

        if not update_fields:
            return await self.get_template(template_id)

        update_fields.append("updated_at = CURRENT_TIMESTAMP")
        params.append(template_id)

        query = f"""
            UPDATE message_templates
            SET {', '.join(update_fields)}
            WHERE id = ?
        """

        await db.execute(query, params)
        return await self.get_template(template_id)

    async def delete_template(self, template_id: str) -> bool:
        """Delete a message template"""
        query = "DELETE FROM message_templates WHERE id = ?"
        await db.execute(query, [template_id])
        return True


# Global instance
message_template_service = MessageTemplateService()
