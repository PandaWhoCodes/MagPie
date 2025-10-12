"""Tests for database functionality including local SQLite"""
import os
import pytest
import libsql
from app.core.schema_manager import SchemaManager


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