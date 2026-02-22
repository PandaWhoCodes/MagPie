"""Pytest configuration and fixtures"""
import os
import pytest
import libsql
from fastapi.testclient import TestClient
from httpx import AsyncClient
from app.main import app
from app.core.database import db
from app.core.schema_manager import SchemaManager
from app.core.auth import clerk_auth, AuthenticatedUser

# Set test environment
os.environ["TESTING"] = "1"

TEST_DB_PATH = "test.db"


@pytest.fixture(scope="session")
def test_db_connection():
    """Create a test database connection for the entire session"""
    # Remove test database if it exists
    if os.path.exists(TEST_DB_PATH):
        os.remove(TEST_DB_PATH)

    # Create connection to test database (local only, no sync)
    conn = libsql.connect(TEST_DB_PATH)

    # Initialize schema
    schema_manager = SchemaManager(conn)
    schema_manager.sync_schema()

    yield conn

    # Cleanup
    conn.close()
    if os.path.exists(TEST_DB_PATH):
        os.remove(TEST_DB_PATH)


@pytest.fixture
async def test_db(test_db_connection, monkeypatch):
    """Provide test database with clean state for each test"""
    # Clear all tables before each test
    tables = [
        "registrations",
        "event_fields",
        "qr_codes",
        "events",
        "user_profiles",
        "branding_settings",
        "message_templates"
    ]

    for table in tables:
        test_db_connection.execute(f"DELETE FROM {table}")

    test_db_connection.commit()

    # Insert default branding settings (required for branding API tests)
    test_db_connection.execute("""
        INSERT INTO branding_settings (id, site_title, site_headline, logo_url, text_style, theme, updated_at)
        VALUES ('default', 'MagPie Events', 'Register for amazing events', NULL, 'gradient', 'default', datetime('now'))
    """)
    test_db_connection.commit()

    # Override the global db instance
    original_conn = db.conn
    db.conn = test_db_connection

    # Mock execute and fetch methods to avoid sync issues
    async def mock_execute(query, params=None):
        if params:
            result = test_db_connection.execute(query, params)
        else:
            result = test_db_connection.execute(query)
        test_db_connection.commit()
        return result

    async def mock_fetch_all(query, params=None):
        if params:
            cursor = test_db_connection.execute(query, params)
        else:
            cursor = test_db_connection.execute(query)
        columns = [desc[0] for desc in cursor.description] if cursor.description else []
        rows = cursor.fetchall()
        return [dict(zip(columns, row)) for row in rows] if rows else []

    async def mock_fetch_one(query, params=None):
        if params:
            cursor = test_db_connection.execute(query, params)
        else:
            cursor = test_db_connection.execute(query)
        columns = [desc[0] for desc in cursor.description] if cursor.description else []
        row = cursor.fetchone()
        return dict(zip(columns, row)) if row else None

    monkeypatch.setattr(db, "execute", mock_execute)
    monkeypatch.setattr(db, "fetch_all", mock_fetch_all)
    monkeypatch.setattr(db, "fetch_one", mock_fetch_one)

    yield test_db_connection

    # Restore original connection
    db.conn = original_conn


@pytest.fixture
def mock_auth_user():
    """Create a mock authenticated user for testing"""
    class MockCredentials:
        credentials = "mock_token"
        scheme = "Bearer"

    mock_decoded = {
        'sub': 'test_user_12345',
        'sid': 'test_session_67890',
        'email': 'test@example.com',
        'iss': 'https://test-clerk.clerk.accounts.dev',
        'exp': 9999999999  # Far future expiry
    }

    return AuthenticatedUser(MockCredentials(), mock_decoded)


@pytest.fixture
def client(test_db, mock_auth_user):
    """Provide test client with auth bypass"""
    # Override the clerk_auth dependency to return mock user
    app.dependency_overrides[clerk_auth] = lambda: mock_auth_user

    client = TestClient(app)
    yield client

    # Clear overrides after test
    app.dependency_overrides.clear()


@pytest.fixture
async def async_client(test_db, mock_auth_user):
    """Provide async test client with auth bypass"""
    # Override the clerk_auth dependency to return mock user
    app.dependency_overrides[clerk_auth] = lambda: mock_auth_user

    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

    # Clear overrides after test
    app.dependency_overrides.clear()


@pytest.fixture
def sample_event_data():
    """Sample event data for testing"""
    return {
        "name": "Test Event",
        "description": "Test Description",
        "date": "2025-12-31",
        "time": "18:00",
        "venue": "Test Venue",
        "venue_address": "123 Test Street",
        "venue_map_link": "https://maps.google.com/?q=test",
        "is_active": True,
        "registrations_open": True,
        "fields": []
    }


@pytest.fixture
def sample_registration_data():
    """Sample registration data for testing"""
    return {
        "event_id": 1,
        "email": "john@example.com",
        "phone": "9876543210",
        "form_data": {
            "name": "John Doe"
        }
    }


@pytest.fixture
def sample_event_field_data():
    """Sample event field data for testing"""
    return {
        "event_id": 1,
        "field_label": "College Name",
        "field_name": "collegename",
        "field_type": "text",
        "is_required": True,
        "field_options": None,
        "field_order": 1
    }


@pytest.fixture
def sample_qr_code_data():
    """Sample QR code data for testing"""
    return {
        "event_id": 1,
        "qr_type": "text",
        "message": "Test QR Content"
    }


@pytest.fixture
def sample_branding_data():
    """Sample branding data for testing"""
    return {
        "site_title": "Test Event Site",
        "site_headline": "Join us for amazing events",
        "logo_url": "https://example.com/logo.png",
        "text_style": "gradient",
        "theme": "default"
    }

