"""Tests for registrations API endpoints"""
import pytest
from fastapi import status


class TestRegistrationsAPI:
    """Test registrations API endpoints"""

    def test_create_registration(self, client, sample_event_data, sample_registration_data):
        """Test creating a registration"""
        # Create event first
        event_response = client.post("/api/events/", json=sample_event_data)
        event_id = event_response.json()["id"]

        # Create registration
        registration_data = sample_registration_data.copy()
        registration_data["event_id"] = event_id
        response = client.post("/api/registrations/", json=registration_data)
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["email"] == registration_data["email"]
        assert data["phone"] == registration_data["phone"]
        assert data["event_id"] == event_id
        assert "form_data" in data
        assert "id" in data

    def test_create_registration_with_dynamic_fields(self, client, sample_event_data):
        """Test creating registration with dynamic fields"""
        # Create event
        event_response = client.post("/api/events/", json=sample_event_data)
        event_id = event_response.json()["id"]

        # Add dynamic field using correct route
        client.post(f"/api/events/{event_id}/fields/", json={
            "field_name": "collegename",
            "field_label": "College Name",
            "field_type": "text",
            "is_required": True,
            "field_order": 1
        })

        # Create registration with dynamic field
        response = client.post("/api/registrations/", json={
            "event_id": event_id,
            "email": "john@example.com",
            "phone": "9876543210",
            "form_data": {
                "name": "John Doe",
                "collegename": "MIT"
            }
        })
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["form_data"]["collegename"] == "MIT"

    def test_create_registration_with_missing_required_fields(self, client, sample_event_data):
        """Test creating registration with missing required fields"""
        # Create event
        event_response = client.post("/api/events/", json=sample_event_data)
        event_id = event_response.json()["id"]

        # Try to create registration without required fields
        response = client.post("/api/registrations/", json={
            "event_id": event_id,
            "email": "john@example.com"
            # Missing phone and form_data
        })
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_get_registration_by_id(self, client, sample_event_data, sample_registration_data):
        """Test getting a registration by ID"""
        # Create event and registration
        event_response = client.post("/api/events/", json=sample_event_data)
        event_id = event_response.json()["id"]

        registration_data = sample_registration_data.copy()
        registration_data["event_id"] = event_id
        create_response = client.post("/api/registrations/", json=registration_data)
        registration_id = create_response.json()["id"]

        # Get registration - should return 200 for GET
        response = client.get(f"/api/registrations/{registration_id}")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == registration_id
        assert data["email"] == registration_data["email"]

    def test_get_nonexistent_registration(self, client):
        """Test getting a registration that doesn't exist"""
        response = client.get("/api/registrations/99999")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_get_registrations_by_event(self, client, sample_event_data, sample_registration_data):
        """Test getting registrations by event ID"""
        # Create two events
        event1_response = client.post("/api/events/", json=sample_event_data)
        event1_id = event1_response.json()["id"]

        event2_data = sample_event_data.copy()
        event2_data["name"] = "Event 2"
        event2_data["is_active"] = False
        event2_response = client.post("/api/events/", json=event2_data)
        event2_id = event2_response.json()["id"]

        # Create registrations for both events
        reg1 = sample_registration_data.copy()
        reg1["event_id"] = event1_id
        client.post("/api/registrations/", json=reg1)

        reg2 = sample_registration_data.copy()
        reg2["event_id"] = event1_id
        reg2["email"] = "jane@example.com"
        client.post("/api/registrations/", json=reg2)

        reg3 = sample_registration_data.copy()
        reg3["event_id"] = event2_id
        reg3["email"] = "bob@example.com"
        client.post("/api/registrations/", json=reg3)

        # Get registrations for event 1 - correct route
        response = client.get(f"/api/events/{event1_id}/registrations")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 2
        # Note: Response doesn't include event_id, just verify we got 2 registrations
        assert all("email" in r for r in data)

    def test_user_profile_autofill_by_email(self, client, sample_event_data, sample_registration_data):
        """Test user profile autofill by email"""
        # Create event and first registration
        event_response = client.post("/api/events/", json=sample_event_data)
        event_id = event_response.json()["id"]

        registration_data = sample_registration_data.copy()
        registration_data["event_id"] = event_id
        client.post("/api/registrations/", json=registration_data)

        # Get autofill data by email - use query parameter
        response = client.get(f"/api/registrations/profile/autofill?email={registration_data['email']}")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["email"] == registration_data["email"]
        assert data["phone"] == registration_data["phone"]
        assert "profile_data" in data

    def test_user_profile_autofill_by_phone(self, client, sample_event_data, sample_registration_data):
        """Test user profile autofill by phone"""
        # Create event and registration
        event_response = client.post("/api/events/", json=sample_event_data)
        event_id = event_response.json()["id"]

        registration_data = sample_registration_data.copy()
        registration_data["event_id"] = event_id
        client.post("/api/registrations/", json=registration_data)

        # Get autofill data by phone - use query parameter
        response = client.get(f"/api/registrations/profile/autofill?phone={registration_data['phone']}")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["phone"] == registration_data["phone"]
        assert data["email"] == registration_data["email"]
        assert "profile_data" in data

    def test_autofill_nonexistent_user(self, client):
        """Test autofill for nonexistent user"""
        response = client.get("/api/registrations/profile/autofill?email=nonexistent@example.com")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_autofill_missing_parameters(self, client):
        """Test autofill without email or phone"""
        response = client.get("/api/registrations/profile/autofill")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_check_in_registration(self, client, sample_event_data, sample_registration_data):
        """Test checking in a registration"""
        # Create event and registration
        event_response = client.post("/api/events/", json=sample_event_data)
        event_id = event_response.json()["id"]

        registration_data = sample_registration_data.copy()
        registration_data["event_id"] = event_id
        create_response = client.post("/api/registrations/", json=registration_data)

        # Check in using correct route with POST body
        response = client.post(f"/api/registrations/check-in/{event_id}", json={
            "email": registration_data["email"]
        })
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["message"] == "Successfully checked in"
        assert data["email"] == registration_data["email"]

    def test_check_in_nonexistent_registration(self, client, sample_event_data):
        """Test checking in a non-existent registration"""
        # Create event
        event_response = client.post("/api/events/", json=sample_event_data)
        event_id = event_response.json()["id"]

        # Try to check in non-existent user
        response = client.post(f"/api/registrations/check-in/{event_id}", json={
            "email": "nonexistent@example.com"
        })
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_duplicate_registration(self, client, sample_event_data, sample_registration_data):
        """Test that duplicate registrations are prevented"""
        # Create event
        event_response = client.post("/api/events/", json=sample_event_data)
        event_id = event_response.json()["id"]

        # Create first registration
        registration_data = sample_registration_data.copy()
        registration_data["event_id"] = event_id
        response1 = client.post("/api/registrations/", json=registration_data)
        assert response1.status_code == status.HTTP_201_CREATED

        # Try to create duplicate registration
        response2 = client.post("/api/registrations/", json=registration_data)
        assert response2.status_code == status.HTTP_400_BAD_REQUEST
        assert "already registered" in response2.json()["detail"].lower()
