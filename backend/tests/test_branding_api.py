"""Tests for branding API endpoints"""
import pytest
from fastapi import status


class TestBrandingAPI:
    """Test branding API endpoints"""

    def test_get_branding_settings_returns_data(self, client, sample_branding_data):
        """Test getting branding settings after creation"""
        # Create settings first
        client.put("/api/branding/", json=sample_branding_data)

        # Get settings
        response = client.get("/api/branding/")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "site_title" in data
        assert "theme" in data

    def test_create_branding_settings(self, client, sample_branding_data):
        """Test creating branding settings"""
        response = client.put("/api/branding/", json=sample_branding_data)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["site_title"] == sample_branding_data["site_title"]
        assert data["logo_url"] == sample_branding_data["logo_url"]
        assert data["text_style"] == sample_branding_data["text_style"]
        assert data["site_headline"] == sample_branding_data["site_headline"]
        assert data["theme"] == sample_branding_data["theme"]

    def test_update_branding_settings(self, client, sample_branding_data):
        """Test updating branding settings"""
        # Create initial settings
        client.put("/api/branding/", json=sample_branding_data)

        # Update settings
        updated_data = sample_branding_data.copy()
        updated_data["site_title"] = "Updated Site Name"
        updated_data["theme"] = "midnight-black"
        response = client.put("/api/branding/", json=updated_data)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["site_title"] == "Updated Site Name"
        assert data["theme"] == "midnight-black"

    def test_get_branding_after_create(self, client, sample_branding_data):
        """Test getting branding settings after creating them"""
        # Create settings
        client.put("/api/branding/", json=sample_branding_data)

        # Get settings
        response = client.get("/api/branding/")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["site_title"] == sample_branding_data["site_title"]

    def test_branding_theme_options(self, client, sample_branding_data):
        """Test different theme options"""
        themes = ["default", "midnight-black"]

        for theme in themes:
            branding_data = sample_branding_data.copy()
            branding_data["theme"] = theme
            response = client.put("/api/branding/", json=branding_data)
            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            assert data["theme"] == theme

    def test_branding_with_optional_fields(self, client):
        """Test branding with only required fields"""
        response = client.put("/api/branding/", json={
            "site_title": "Minimal Site",
            "theme": "default"
        })
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["site_title"] == "Minimal Site"
        assert data["theme"] == "default"

    def test_branding_color_validation(self, client, sample_branding_data):
        """Test branding with different color formats"""
        # Test with hex colors
        branding_data = sample_branding_data.copy()
        branding_data["text_style"] = "#FF5733"
        branding_data["site_headline"] = "#33FF57"
        response = client.put("/api/branding/", json=branding_data)
        assert response.status_code == status.HTTP_200_OK

    def test_branding_persistence(self, client, sample_branding_data):
        """Test that branding settings persist correctly"""
        # Create settings
        client.put("/api/branding/", json=sample_branding_data)

        # Get settings multiple times
        for _ in range(3):
            response = client.get("/api/branding/")
            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            assert data["site_title"] == sample_branding_data["site_title"]

    def test_branding_update_partial_fields(self, client, sample_branding_data):
        """Test updating only some branding fields"""
        # Create initial settings
        client.put("/api/branding/", json=sample_branding_data)

        # Update only site name and keep other fields
        updated_data = {
            "site_title": "New Name Only",
            "logo_url": sample_branding_data["logo_url"],
            "text_style": sample_branding_data["text_style"],
            "site_headline": sample_branding_data["site_headline"],
            "theme": sample_branding_data["theme"]
        }
        response = client.put("/api/branding/", json=updated_data)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["site_title"] == "New Name Only"
        assert data["logo_url"] == sample_branding_data["logo_url"]
