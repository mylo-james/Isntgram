"""
Test suite for API utilities
Tests error handling and response functions
"""
import pytest
from unittest.mock import Mock
from pydantic import ValidationError
from sqlalchemy.exc import IntegrityError
from app.utils.api_utils import (
    APIError,
    ValidationAPIError,
    NotFoundAPIError,
    UnauthorizedAPIError,
    ForbiddenAPIError,
    handle_validation_error,
    handle_integrity_error,
    handle_api_error,
    success_response,
    error_response
)


class TestAPIError:
    """Test APIError base class."""

    def test_api_error_creation(self):
        """Test APIError creation with default values."""
        error = APIError("Test error")
        assert error.message == "Test error"
        assert error.status_code == 400
        assert error.errors == []

    def test_api_error_with_custom_values(self):
        """Test APIError creation with custom values."""
        errors = ["Error 1", "Error 2"]
        error = APIError("Custom error", 500, errors)
        assert error.message == "Custom error"
        assert error.status_code == 500
        assert error.errors == errors

    def test_api_error_inheritance(self):
        """Test that APIError inherits from Exception."""
        error = APIError("Test error")
        assert isinstance(error, Exception)
        assert str(error) == "Test error"


class TestValidationAPIError:
    """Test ValidationAPIError class."""

    def test_validation_api_error_default(self):
        """Test ValidationAPIError with default values."""
        error = ValidationAPIError()
        assert error.message == "Validation failed"
        assert error.status_code == 400
        assert error.errors == []

    def test_validation_api_error_custom(self):
        """Test ValidationAPIError with custom values."""
        errors = ["Field required", "Invalid format"]
        error = ValidationAPIError("Custom validation error", errors)
        assert error.message == "Custom validation error"
        assert error.status_code == 400
        assert error.errors == errors


class TestNotFoundAPIError:
    """Test NotFoundAPIError class."""

    def test_not_found_api_error_default(self):
        """Test NotFoundAPIError with default values."""
        error = NotFoundAPIError()
        assert error.message == "Resource not found"
        assert error.status_code == 404
        assert error.errors == []

    def test_not_found_api_error_custom(self):
        """Test NotFoundAPIError with custom message."""
        error = NotFoundAPIError("User not found")
        assert error.message == "User not found"
        assert error.status_code == 404


class TestUnauthorizedAPIError:
    """Test UnauthorizedAPIError class."""

    def test_unauthorized_api_error_default(self):
        """Test UnauthorizedAPIError with default values."""
        error = UnauthorizedAPIError()
        assert error.message == "Unauthorized"
        assert error.status_code == 401
        assert error.errors == []

    def test_unauthorized_api_error_custom(self):
        """Test UnauthorizedAPIError with custom message."""
        error = UnauthorizedAPIError("Invalid credentials")
        assert error.message == "Invalid credentials"
        assert error.status_code == 401


class TestForbiddenAPIError:
    """Test ForbiddenAPIError class."""

    def test_forbidden_api_error_default(self):
        """Test ForbiddenAPIError with default values."""
        error = ForbiddenAPIError()
        assert error.message == "Forbidden"
        assert error.status_code == 403
        assert error.errors == []

    def test_forbidden_api_error_custom(self):
        """Test ForbiddenAPIError with custom message."""
        error = ForbiddenAPIError("Access denied")
        assert error.message == "Access denied"
        assert error.status_code == 403


class TestHandleValidationError:
    """Test handle_validation_error function."""

    def test_handle_validation_error_single_field(self):
        """Test handling single field validation error."""
        # Mock ValidationError
        mock_error = Mock()
        mock_error.errors.return_value = [
            {
                'loc': ('email',),
                'msg': 'Invalid email format',
                'type': 'value_error'
            }
        ]
        
        response, status_code = handle_validation_error(mock_error)
        
        assert status_code == 400
        assert response["error"] == "Validation failed"
        assert response["success"] is False
        assert "email: Invalid email format" in response["errors"]

    def test_handle_validation_error_multiple_fields(self):
        """Test handling multiple field validation errors."""
        # Mock ValidationError
        mock_error = Mock()
        mock_error.errors.return_value = [
            {
                'loc': ('email',),
                'msg': 'Invalid email format',
                'type': 'value_error'
            },
            {
                'loc': ('password',),
                'msg': 'Password too short',
                'type': 'value_error'
            }
        ]
        
        response, status_code = handle_validation_error(mock_error)
        
        assert status_code == 400
        assert response["error"] == "Validation failed"
        assert response["success"] is False
        assert len(response["errors"]) == 2
        assert "email: Invalid email format" in response["errors"]
        assert "password: Password too short" in response["errors"]

    def test_handle_validation_error_nested_field(self):
        """Test handling nested field validation error."""
        # Mock ValidationError
        mock_error = Mock()
        mock_error.errors.return_value = [
            {
                'loc': ('user', 'profile', 'bio'),
                'msg': 'Bio too long',
                'type': 'value_error'
            }
        ]
        
        response, status_code = handle_validation_error(mock_error)
        
        assert status_code == 400
        assert "user.profile.bio: Bio too long" in response["errors"]


class TestHandleIntegrityError:
    """Test handle_integrity_error function."""

    def test_handle_integrity_error_email_unique(self):
        """Test handling email unique constraint violation."""
        # Mock IntegrityError
        mock_error = Mock()
        mock_error.orig = Mock()
        mock_error.orig.__str__ = Mock(return_value="UNIQUE constraint failed: users.email")
        
        response, status_code = handle_integrity_error(mock_error)
        
        assert status_code == 400
        assert response["error"] == "Email already exists"
        assert response["success"] is False
        assert "An account with this email already exists" in response["errors"]

    def test_handle_integrity_error_username_unique(self):
        """Test handling username unique constraint violation."""
        # Mock IntegrityError
        mock_error = Mock()
        mock_error.orig = Mock()
        mock_error.orig.__str__ = Mock(return_value="UNIQUE constraint failed: users.username")
        
        response, status_code = handle_integrity_error(mock_error)
        
        assert status_code == 400
        assert response["error"] == "Username already exists"
        assert response["success"] is False
        assert "This username is already taken" in response["errors"]

    def test_handle_integrity_error_unknown_constraint(self):
        """Test handling unknown constraint violation."""
        # Mock IntegrityError
        mock_error = Mock()
        mock_error.orig = Mock()
        mock_error.orig.__str__ = Mock(return_value="UNIQUE constraint failed: unknown_table.unknown_field")
        
        response, status_code = handle_integrity_error(mock_error)
        
        assert status_code == 400
        assert response["error"] == "Database constraint violation"
        assert response["success"] is False
        assert "A database constraint was violated" in response["errors"]


class TestHandleAPIError:
    """Test handle_api_error function."""

    def test_handle_api_error_basic(self):
        """Test handling basic API error."""
        error = APIError("Test error", 400)
        
        response, status_code = handle_api_error(error)
        
        assert status_code == 400
        assert response["error"] == "Test error"
        assert response["success"] is False
        assert response["errors"] == []

    def test_handle_api_error_with_errors(self):
        """Test handling API error with specific errors."""
        errors = ["Error 1", "Error 2"]
        error = APIError("Test error", 400, errors)
        
        response, status_code = handle_api_error(error)
        
        assert status_code == 400
        assert response["error"] == "Test error"
        assert response["success"] is False
        assert response["errors"] == errors

    def test_handle_api_error_custom_status(self):
        """Test handling API error with custom status code."""
        error = APIError("Not found", 404)
        
        response, status_code = handle_api_error(error)
        
        assert status_code == 404
        assert response["error"] == "Not found"
        assert response["success"] is False


class TestSuccessResponse:
    """Test success_response function."""

    def test_success_response_basic(self):
        """Test basic success response."""
        response = success_response()
        
        assert response["success"] is True
        assert response["message"] == "Success"
        assert "data" not in response

    def test_success_response_with_custom_message(self):
        """Test success response with custom message."""
        response = success_response(message="User created successfully")
        
        assert response["success"] is True
        assert response["message"] == "User created successfully"

    def test_success_response_with_dict_data(self):
        """Test success response with dictionary data."""
        data = {"user_id": 1, "username": "testuser"}
        response = success_response(data, "User created")
        
        assert response["success"] is True
        assert response["message"] == "User created"
        assert response["user_id"] == 1
        assert response["username"] == "testuser"

    def test_success_response_with_non_dict_data(self):
        """Test success response with non-dictionary data."""
        data = [1, 2, 3]
        response = success_response(data, "List retrieved")
        
        assert response["success"] is True
        assert response["message"] == "List retrieved"
        assert response["data"] == [1, 2, 3]

    def test_success_response_with_none_data(self):
        """Test success response with None data."""
        response = success_response(None, "Operation completed")
        
        assert response["success"] is True
        assert response["message"] == "Operation completed"
        assert "data" not in response


class TestErrorResponse:
    """Test error_response function."""

    def test_error_response_basic(self):
        """Test basic error response."""
        response, status_code = error_response("Test error")
        
        assert status_code == 400
        assert response["error"] == "Test error"
        assert response["success"] is False
        assert response["errors"] == []

    def test_error_response_with_errors(self):
        """Test error response with specific errors."""
        errors = ["Field required", "Invalid format"]
        response, status_code = error_response("Validation failed", errors)
        
        assert status_code == 400
        assert response["error"] == "Validation failed"
        assert response["success"] is False
        assert response["errors"] == errors

    def test_error_response_with_custom_status(self):
        """Test error response with custom status code."""
        response, status_code = error_response("Not found", status_code=404)
        
        assert status_code == 404
        assert response["error"] == "Not found"
        assert response["success"] is False

    def test_error_response_with_none_errors(self):
        """Test error response with None errors."""
        response, status_code = error_response("Test error", None)
        
        assert status_code == 400
        assert response["error"] == "Test error"
        assert response["success"] is False
        assert response["errors"] == [] 