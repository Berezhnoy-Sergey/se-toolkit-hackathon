"""Simple API key verification for TaskFlow."""

from fastapi import Header, HTTPException, status


def verify_api_key(x_api_key: str = Header(None)):
    """Verify the API key from the X-API-Key header."""
    from lms_backend.settings import settings
    
    if x_api_key != settings.api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key",
        )
    return x_api_key
