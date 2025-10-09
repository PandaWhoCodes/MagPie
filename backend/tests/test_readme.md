# Backend Testing Suite

## Overview
Comprehensive test suite for the MagPie Event Registration Platform backend API.

## Test Structure
- `test_events_api.py` - Tests for events endpoints
- `test_registrations_api.py` - Tests for registrations endpoints
- `test_event_fields_api.py` - Tests for event fields endpoints
- `test_qr_codes_api.py` - Tests for QR codes endpoints
- `test_branding_api.py` - Tests for branding endpoints
- `test_whatsapp_api.py` - Tests for WhatsApp endpoints (mocked)

## Running Tests

### Run all tests
```bash
pytest
```

### Run specific test file
```bash
pytest tests/test_events_api.py
```

### Run with coverage
```bash
pytest --cov=app --cov-report=html
```

### Run verbose
```bash
pytest -v
```

## Test Database
Tests use a local SQLite database (`test.db`) that is:
- Created fresh for each test session
- Cleaned between each test
- Automatically deleted after tests complete

## Coverage
Coverage reports are generated in `htmlcov/` directory.

## Notes
- WhatsApp tests use mocks to avoid actual Twilio API calls
- All tests are independent and can run in any order
- Database syncing with Turso is disabled during tests
