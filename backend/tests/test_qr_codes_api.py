"""Tests for QR codes API endpoints"""
import pytest
from fastapi import status


class TestQRCodesAPI:
    """Test QR codes API endpoints"""

    def test_create_qr_code_text_type(self, client, sample_event_data):
        """Test creating a QR code with text type"""
        # Create event first
        event_response = client.post("/api/events/", json=sample_event_data)
        event_id = event_response.json()["id"]

        # Create QR code
        response = client.post("/api/qr-codes/", json={
            "event_id": event_id,
            "qr_type": "text",
            "message": "Welcome to our event!"
        })
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["qr_type"] == "text"
        assert data["message"] == "Welcome to our event!"
        assert data["event_id"] == event_id
        assert "id" in data
        assert "qr_image" in data  # Base64 encoded QR image

    def test_create_qr_code_url_type(self, client, sample_event_data):
        """Test creating a QR code with URL type"""
        # Create event
        event_response = client.post("/api/events/", json=sample_event_data)
        event_id = event_response.json()["id"]

        # Create QR code with URL
        response = client.post("/api/qr-codes/", json={
            "event_id": event_id,
            "qr_type": "url",
            "message": "https://example.com"
        })
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["qr_type"] == "url"
        assert data["message"] == "https://example.com"

    def test_create_qr_code_with_missing_fields(self, client, sample_event_data):
        """Test creating QR code with missing required fields"""
        event_response = client.post("/api/events/", json=sample_event_data)
        event_id = event_response.json()["id"]

        response = client.post("/api/qr-codes/", json={
            "event_id": event_id,
            "qr_type": "text"
            # Missing message field
        })
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_get_qr_codes_by_event(self, client, sample_event_data):
        """Test getting all QR codes for an event"""
        # Create event
        event_response = client.post("/api/events/", json=sample_event_data)
        event_id = event_response.json()["id"]

        # Create multiple QR codes
        client.post("/api/qr-codes/", json={
            "event_id": event_id,
            "qr_type": "text",
            "message": "QR Code 1"
        })
        client.post("/api/qr-codes/", json={
            "event_id": event_id,
            "qr_type": "url",
            "message": "https://example.com"
        })

        # Get QR codes (note: no trailing slash)
        response = client.get(f"/api/qr-codes/event/{event_id}")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 2

    def test_get_qr_codes_for_nonexistent_event(self, client):
        """Test getting QR codes for nonexistent event"""
        response = client.get("/api/qr-codes/event/99999")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 0

    def test_get_qr_code_by_id(self, client, sample_event_data):
        """Test getting a QR code by ID"""
        # Create event and QR code
        event_response = client.post("/api/events/", json=sample_event_data)
        event_id = event_response.json()["id"]

        qr_response = client.post("/api/qr-codes/", json={
            "event_id": event_id,
            "qr_type": "text",
            "message": "Test QR"
        })
        qr_id = qr_response.json()["id"]

        # Get QR code (note: no trailing slash)
        response = client.get(f"/api/qr-codes/{qr_id}")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == qr_id
        assert data["message"] == "Test QR"

    def test_get_nonexistent_qr_code(self, client):
        """Test getting a QR code that doesn't exist"""
        response = client.get("/api/qr-codes/99999")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_update_qr_code(self, client, sample_event_data):
        """Test that update is not supported (no PUT endpoint)"""
        # Create event and QR code
        event_response = client.post("/api/events/", json=sample_event_data)
        event_id = event_response.json()["id"]

        qr_response = client.post("/api/qr-codes/", json={
            "event_id": event_id,
            "qr_type": "text",
            "message": "Original Content"
        })
        qr_id = qr_response.json()["id"]

        # Try to update QR code (should fail - no update endpoint)
        response = client.put(f"/api/qr-codes/{qr_id}", json={
            "event_id": event_id,
            "qr_type": "url",
            "message": "https://updated.com"
        })
        # PUT method not allowed
        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED

    def test_update_nonexistent_qr_code(self, client, sample_event_data):
        """Test that update is not supported for nonexistent QR code"""
        event_response = client.post("/api/events/", json=sample_event_data)
        event_id = event_response.json()["id"]

        response = client.put("/api/qr-codes/99999", json={
            "event_id": event_id,
            "qr_type": "text",
            "message": "Test"
        })
        # PUT method not allowed
        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED

    def test_delete_qr_code(self, client, sample_event_data):
        """Test deleting a QR code"""
        # Create event and QR code
        event_response = client.post("/api/events/", json=sample_event_data)
        event_id = event_response.json()["id"]

        qr_response = client.post("/api/qr-codes/", json={
            "event_id": event_id,
            "qr_type": "text",
            "message": "Test QR"
        })
        qr_id = qr_response.json()["id"]

        # Delete QR code (note: no trailing slash)
        response = client.delete(f"/api/qr-codes/{qr_id}")
        assert response.status_code == status.HTTP_204_NO_CONTENT

        # Verify deletion
        get_response = client.get(f"/api/qr-codes/{qr_id}")
        assert get_response.status_code == status.HTTP_404_NOT_FOUND

    def test_delete_nonexistent_qr_code(self, client):
        """Test deleting a nonexistent QR code"""
        # Note: delete doesn't validate if QR exists, just tries to delete
        response = client.delete("/api/qr-codes/99999")
        assert response.status_code == status.HTTP_204_NO_CONTENT

    def test_qr_code_image_generation(self, client, sample_event_data):
        """Test that QR code image is generated correctly"""
        # Create event and QR code
        event_response = client.post("/api/events/", json=sample_event_data)
        event_id = event_response.json()["id"]

        response = client.post("/api/qr-codes/", json={
            "event_id": event_id,
            "qr_type": "url",
            "message": "https://example.com/test"
        })
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()

        # Verify QR code image exists and is base64 encoded
        assert "qr_image" in data
        assert len(data["qr_image"]) > 100  # Should be a substantial base64 string

    def test_multiple_qr_codes_for_same_event(self, client, sample_event_data):
        """Test creating multiple QR codes for the same event"""
        # Create event
        event_response = client.post("/api/events/", json=sample_event_data)
        event_id = event_response.json()["id"]

        # Create multiple QR codes
        qr_codes = []
        for i in range(5):
            response = client.post("/api/qr-codes/", json={
                "event_id": event_id,
                "qr_type": "text",
                "message": f"QR Code {i + 1}"
            })
            assert response.status_code == status.HTTP_201_CREATED
            qr_codes.append(response.json())

        # Verify all QR codes exist
        response = client.get(f"/api/qr-codes/event/{event_id}")
        data = response.json()
        assert len(data) == 5

    def test_qr_code_with_special_characters(self, client, sample_event_data):
        """Test QR code with special characters in content"""
        # Create event
        event_response = client.post("/api/events/", json=sample_event_data)
        event_id = event_response.json()["id"]

        # Create QR code with special characters
        special_message = "Hello! 你好 🎉 @#$%^&*()"
        response = client.post("/api/qr-codes/", json={
            "event_id": event_id,
            "qr_type": "text",
            "message": special_message
        })
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["message"] == special_message
