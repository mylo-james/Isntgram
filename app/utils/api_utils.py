"""
Modern error handling utilities for API routes.
Provides consistent error responses and validation handling.
"""

from typing import Any, Dict, List, Union
from flask import jsonify
from pydantic import ValidationError
from sqlalchemy.exc import IntegrityError
import logging

logger = logging.getLogger(__name__)


class APIError(Exception):
    """Base API error class."""
    def __init__(self, message: str, status_code: int = 400, errors: List[str] = None):
        self.message = message
        self.status_code = status_code
        self.errors = errors or []
        super().__init__(self.message)


class ValidationAPIError(APIError):
    """Validation error class."""
    def __init__(self, message: str = "Validation failed", errors: List[str] = None):
        super().__init__(message, 400, errors)


class NotFoundAPIError(APIError):
    """Not found error class."""
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, 404)


class UnauthorizedAPIError(APIError):
    """Unauthorized error class."""
    def __init__(self, message: str = "Unauthorized"):
        super().__init__(message, 401)


class ForbiddenAPIError(APIError):
    """Forbidden error class."""
    def __init__(self, message: str = "Forbidden"):
        super().__init__(message, 403)


def handle_validation_error(e: ValidationError) -> tuple[dict, int]:
    """Convert Pydantic validation errors to API response format."""
    error_messages = []
    for error in e.errors():
        field = ".".join(str(loc) for loc in error['loc'])
        message = error['msg']
        error_messages.append(f"{field}: {message}")
    
    return {
        "error": "Validation failed",
        "errors": error_messages,
        "success": False
    }, 400


def handle_integrity_error(e: IntegrityError) -> tuple[dict, int]:
    """Handle database integrity errors (unique constraints, etc.)."""
    error_message = str(e.orig)
    
    # Parse common constraint violations
    if "UNIQUE constraint failed: users.email" in error_message:
        return {
            "error": "Email already exists",
            "errors": ["An account with this email already exists"],
            "success": False
        }, 400
    elif "UNIQUE constraint failed: users.username" in error_message:
        return {
            "error": "Username already exists", 
            "errors": ["This username is already taken"],
            "success": False
        }, 400
    else:
        logger.error(f"Database integrity error: {error_message}")
        return {
            "error": "Database constraint violation",
            "errors": ["A database constraint was violated"],
            "success": False
        }, 400


def handle_api_error(e: APIError) -> tuple[dict, int]:
    """Handle custom API errors."""
    return {
        "error": e.message,
        "errors": e.errors,
        "success": False
    }, e.status_code


def success_response(data: Any = None, message: str = "Success") -> dict:
    """Create a successful API response."""
    response = {
        "success": True,
        "message": message
    }
    
    if data is not None:
        if isinstance(data, dict):
            response.update(data)
        else:
            response["data"] = data
    
    return response


def error_response(message: str, errors: List[str] = None, status_code: int = 400) -> tuple[dict, int]:
    """Create an error API response."""
    return {
        "error": message,
        "errors": errors or [],
        "success": False
    }, status_code
