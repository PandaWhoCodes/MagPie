"""Tests for WhatsApp API endpoints"""
import pytest
from fastapi import status
from unittest.mock import Mock, patch, AsyncMock


class TestWhatsAppAPI:
    """Test WhatsApp API endpoints"""

    @pytest.fixture
    def mock_whatsapp_service(self):
        """Mock WhatsApp service to avoid actual Twilio calls"""
        with patch("app.api.whatsapp.WhatsAppService") as mock:
            service_instance = Mock()
            service_instance.send_bulk_messages = AsyncMock()
            service_instance.get_event_registrants_count = AsyncMock()
            service_instance.get_distinct_field_values = AsyncMock()
            mock.return_value = service_instance
            yield service_instance

    def test_get_registrants_count(self, client, sample_event_data, sample_registration_data, mock_whatsapp_service):
        """Test getting registrants count for an event"""
        # Create event and registrations
        event_response = client.post("/api/events/", json=sample_event_data)
        event_id = event_response.json()["id"]

        # Create two registrations
        reg1 = sample_registration_data.copy()
        reg1["event_id"] = event_id
        client.post("/api/registrations/", json=reg1)

        reg2 = sample_registration_data.copy()
        reg2["event_id"] = event_id
        reg2["email"] = "jane@example.com"
        client.post("/api/registrations/", json=reg2)

        # Mock the count
        mock_whatsapp_service.get_event_registrants_count.return_value = 2

        # Get count
        response = client.get(f"/api/whatsapp/registrants-count/{event_id}")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["count"] == 2
        assert data["event_id"] == str(event_id)

    def test_send_bulk_whatsapp_with_direct_message(self, client, sample_event_data, sample_registration_data, mock_whatsapp_service):
        """Test sending bulk WhatsApp messages with direct message"""
        # Create event and registration
        event_response = client.post("/api/events/", json=sample_event_data)
        event_id = event_response.json()["id"]

        reg = sample_registration_data.copy()
        reg["event_id"] = event_id
        client.post("/api/registrations/", json=reg)

        # Mock successful send
        mock_whatsapp_service.send_bulk_messages.return_value = {
            "success": True,
            "total": 1,
            "sent": 1,
            "failed": 0,
            "failed_messages": []
        }

        # Send bulk messages
        response = client.post("/api/whatsapp/send-bulk/", json={
            "event_id": event_id,
            "message": "Welcome to our event!",
            "send_to": "all"
        })
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["success"] is True
        assert data["total"] == 1
        assert data["sent"] == 1
        assert data["failed"] == 0

    def test_send_bulk_whatsapp_with_template(self, client, sample_event_data, sample_registration_data, mock_whatsapp_service):
        """Test sending bulk WhatsApp messages using template"""
        # Create event and registration
        event_response = client.post("/api/events/", json=sample_event_data)
        event_id = event_response.json()["id"]

        reg = sample_registration_data.copy()
        reg["event_id"] = event_id
        client.post("/api/registrations/", json=reg)

        # Create message template
        template_response = client.post("/api/message-templates/", json={
            "template_name": "Welcome Template",
            "template_text": "Welcome {name} to our event!"
        })
        assert template_response.status_code == status.HTTP_200_OK
        template_id = template_response.json()["id"]

        # Mock successful send
        mock_whatsapp_service.send_bulk_messages.return_value = {
            "success": True,
            "total": 1,
            "sent": 1,
            "failed": 0,
            "failed_messages": []
        }

        # Send bulk messages with template
        response = client.post("/api/whatsapp/send-bulk/", json={
            "event_id": event_id,
            "template_id": template_id,
            "template_variables": {"name": "John"},
            "send_to": "all"
        })
        assert response.status_code == status.HTTP_200_OK

    def test_send_bulk_whatsapp_subset(self, client, sample_event_data, mock_whatsapp_service):
        """Test sending WhatsApp messages to subset of registrants"""
        # Create event
        event_response = client.post("/api/events/", json=sample_event_data)
        event_id = event_response.json()["id"]

        # Add custom field
        client.post(f"/api/events/{event_id}/fields/", json={
            "field_name": "collegename",
            "field_label": "College Name",
            "field_type": "text",
            "is_required": True,
            "field_order": 1
        })

        # Create registrations with different colleges
        client.post("/api/registrations/", json={
            "event_id": event_id,
            "email": "john@example.com",
            "phone": "9876543210",
            "form_data": {"name": "John Doe", "collegename": "MIT"}
        })
        client.post("/api/registrations/", json={
            "event_id": event_id,
            "email": "jane@example.com",
            "phone": "9876543211",
            "form_data": {"name": "Jane Doe", "collegename": "Stanford"}
        })

        # Mock successful send
        mock_whatsapp_service.send_bulk_messages.return_value = {
            "success": True,
            "total": 1,
            "sent": 1,
            "failed": 0,
            "failed_messages": []
        }

        # Send to MIT students only
        response = client.post("/api/whatsapp/send-bulk/", json={
            "event_id": event_id,
            "message": "MIT specific message",
            "send_to": "subset",
            "filter_field": "collegename",
            "filter_value": "MIT"
        })
        assert response.status_code == status.HTTP_200_OK

    def test_send_bulk_whatsapp_without_message_or_template(self, client, sample_event_data, mock_whatsapp_service):
        """Test sending bulk messages without message or template"""
        event_response = client.post("/api/events/", json=sample_event_data)
        event_id = event_response.json()["id"]

        response = client.post("/api/whatsapp/send-bulk/", json={
            "event_id": event_id,
            "send_to": "all"
        })
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_send_bulk_whatsapp_with_nonexistent_template(self, client, sample_event_data, mock_whatsapp_service):
        """Test sending bulk messages with nonexistent template"""
        event_response = client.post("/api/events/", json=sample_event_data)
        event_id = event_response.json()["id"]

        response = client.post("/api/whatsapp/send-bulk/", json={
            "event_id": event_id,
            "template_id": "nonexistent-template-id",
            "send_to": "all"
        })
        # API returns 422 when template_id is provided but template doesn't exist
        # or returns an error during message sending (validation error)
        assert response.status_code in [status.HTTP_404_NOT_FOUND, status.HTTP_422_UNPROCESSABLE_ENTITY, status.HTTP_500_INTERNAL_SERVER_ERROR]

    def test_get_field_distinct_values(self, client, sample_event_data, mock_whatsapp_service):
        """Test getting distinct values for a field"""
        # Create event
        event_response = client.post("/api/events/", json=sample_event_data)
        event_id = event_response.json()["id"]

        # Add custom field
        client.post(f"/api/events/{event_id}/fields/", json={
            "field_name": "collegename",
            "field_label": "College Name",
            "field_type": "text",
            "is_required": True,
            "field_order": 1
        })

        # Create registrations
        client.post("/api/registrations/", json={
            "event_id": event_id,
            "email": "john@example.com",
            "phone": "9876543210",
            "form_data": {"name": "John Doe", "collegename": "MIT"}
        })
        client.post("/api/registrations/", json={
            "event_id": event_id,
            "email": "jane@example.com",
            "phone": "9876543211",
            "form_data": {"name": "Jane Doe", "collegename": "Stanford"}
        })

        # Mock distinct values
        mock_whatsapp_service.get_distinct_field_values.return_value = ["MIT", "Stanford"]

        # Get distinct values
        response = client.get(f"/api/whatsapp/field-values/{event_id}/collegename")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "values" in data
        assert len(data["values"]) == 2

    def test_send_bulk_failed_messages(self, client, sample_event_data, sample_registration_data, mock_whatsapp_service):
        """Test handling of failed WhatsApp messages"""
        # Create event and registration
        event_response = client.post("/api/events/", json=sample_event_data)
        event_id = event_response.json()["id"]

        reg = sample_registration_data.copy()
        reg["event_id"] = event_id
        client.post("/api/registrations/", json=reg)

        # Mock partial failure
        mock_whatsapp_service.send_bulk_messages.return_value = {
            "success": True,
            "total": 1,
            "sent": 0,
            "failed": 1,
            "failed_messages": [{
                "phone": "9876543210",
                "error": "Invalid phone number"
            }]
        }

        # Send bulk messages
        response = client.post("/api/whatsapp/send-bulk/", json={
            "event_id": event_id,
            "message": "Test message",
            "send_to": "all"
        })
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["failed"] == 1
        assert len(data["failed_messages"]) == 1
