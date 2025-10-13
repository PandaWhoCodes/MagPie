"""Tests for database functionality including local SQLite"""
import os
import pytest
import libsql
from app.core.schema_manager import SchemaManager
from app.core.config import Settings


class TestDatabase:
    """Test database functionality including local SQLite setup"""

    @pytest.fixture
    def local_db_path(self):
        """Path for local test database"""
        return "../local-dev/test_local.db"

    def test_local_sqlite_connection_and_schema(self, local_db_path):
        """Test that local SQLite connection works and schema is created"""
        # Clean up any existing test database
        if os.path.exists(local_db_path):
            os.remove(local_db_path)

        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(local_db_path), exist_ok=True)

        # Create connection
        conn = libsql.connect(local_db_path)

        # Initialize schema
        schema_manager = SchemaManager(conn)
        schema_manager.sync_schema()

        # Test connection exists
        assert conn is not None

        # Test that tables were created
        result = conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
        )
        tables = [row[0] for row in result.fetchall()]

        # Check for key tables
        assert 'events' in tables
        assert 'registrations' in tables
        assert 'branding_settings' in tables

      
        # Cleanup
        conn.close()
        if os.path.exists(local_db_path):
            os.remove(local_db_path)

    def test_is_local_setting_from_env(self, monkeypatch):
        """Test that IS_LOCAL setting is read correctly from environment"""
        # Test with IS_LOCAL=true
        monkeypatch.setenv("IS_LOCAL", "true")
        settings = Settings()
        assert settings.IS_LOCAL is True

        # Test with IS_LOCAL=false
        monkeypatch.setenv("IS_LOCAL", "false")
        settings = Settings()
        assert settings.IS_LOCAL is False

        # Test default value (should be False) - need to clear all env vars and .env file
        monkeypatch.delenv("IS_LOCAL", raising=False)
        # Clear all environment variables to simulate no .env file
        monkeypatch.setenv("TURSO_DATABASE_URL", "")
        monkeypatch.setenv("TURSO_AUTH_TOKEN", "")
        monkeypatch.setenv("CLERK_SECRET_KEY", "")
        monkeypatch.setenv("FRONTEND_URL", "")
        monkeypatch.setenv("TWILIO_ACCOUNT_SID", "")
        monkeypatch.setenv("TWILIO_AUTH_TOKEN", "")
        monkeypatch.setenv("TWILIO_WHATSAPP_NUMBER", "")
        # Force reload settings without .env file
        settings = Settings(_env_file=None)
        assert settings.IS_LOCAL is False