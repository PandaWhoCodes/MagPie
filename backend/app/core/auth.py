
"""
Authentication utilities using Clerk
"""
import os
import requests
import time
import logging
from jwt import PyJWKClient
from fastapi import Security, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt


# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Get Clerk secret key
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")
if not CLERK_SECRET_KEY:
    raise ValueError("CLERK_SECRET_KEY environment variable is required")
logger.info(f"✅ CLERK_SECRET_KEY loaded: {CLERK_SECRET_KEY[:20]}...")




# JWKS URL for Clerk using Backend API (requires secret key)
JWKS_URL = "https://api.clerk.com/v1/jwks"
logger.info(f"🔑 Using Clerk Backend JWKS URL: {JWKS_URL}")
custom_headers = {"Authorization": f"Bearer {CLERK_SECRET_KEY}", 'User-Agent': 'python-urllib/3.11'}
import ssl
import certifi
jwks_client = PyJWKClient(
    JWKS_URL,
    timeout=30,
    ssl_context=ssl.create_default_context(cafile=certifi.where()),  # Use certifi for SSL
    headers=custom_headers
)

# HTTP Bearer security scheme
security = HTTPBearer()

class AuthenticatedUser:
    """Container for authenticated user information"""
    def __init__(self, credentials: HTTPAuthorizationCredentials, decoded: dict):
        self.credentials = credentials.credentials
        self.scheme = credentials.scheme
        self.decoded = decoded
        self.user_id = decoded.get('sub')
        self.session_id = decoded.get('sid')

async def clerk_auth(credentials: HTTPAuthorizationCredentials = Security(security)) -> AuthenticatedUser:
    """
    Validate Clerk JWT token
    """
    token = credentials.credentials

    logger.debug(f"🔍 Received token: {token[:50]}...")

    try:
        # Get the signing key from JWKS using PyJWKClient with headers
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        logger.info(f"🔍 signing_key: {signing_key.key}...")
        logger.debug("✅ Got signing key")

        # Decode and verify the token
        decoded_token = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            options={"verify_exp": True, "verify_aud": False}  # Clerk doesn't use aud
        )

        logger.info(f"✅ Token validated successfully for user: {decoded_token.get('sub', 'unknown')}")
        logger.debug(f"📋 Token claims: {decoded_token}")

        # Return authenticated user with decoded token
        return AuthenticatedUser(credentials, decoded_token)

    except jwt.ExpiredSignatureError:
        logger.error("❌ Token expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError as e:
        logger.error(f"❌ Invalid token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )
    except Exception as e:
        logger.error(f"❌ Token validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}"
        )

logger.info("✅ Clerk authentication configured successfully")


def get_user_id(credentials) -> str:
    """
    Extract user ID from Clerk credentials

    Args:
        credentials: HTTPAuthorizationCredentials from clerk_auth dependency

    Returns:
        str: The user ID from the token
    """
    if credentials and hasattr(credentials, 'decoded'):
        return credentials.decoded.get('sub', '')
    return ''


def get_user_email(credentials) -> str:
    """
    Extract user email from Clerk credentials

    Args:
        credentials: HTTPAuthorizationCredentials from clerk_auth dependency

    Returns:
        str: The user email from the token
    """
    if credentials and hasattr(credentials, 'decoded'):
        return credentials.decoded.get('email', '')
    return ''
