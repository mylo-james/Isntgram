"""
Test suite for authentication schemas
Tests Pydantic validation rules and edge cases
"""
import pytest
from pydantic import ValidationError
from app.schemas.auth_schemas import (
    LoginSchema, 
    SignUpSchema, 
    PasswordResetRequestSchema,
    PasswordResetSchema,
    AuthResponseSchema
)


class TestLoginSchema:
    """Test LoginSchema validation."""

    def test_valid_login_data(self):
        """Test valid login data passes validation."""
        data = {
            "email": "test@example.com",
            "password": "password123"
        }
        schema = LoginSchema(**data)
        assert schema.email == "test@example.com"
        assert schema.password == "password123"

    def test_invalid_email_format(self):
        """Test invalid email format raises validation error."""
        data = {
            "email": "invalid-email",
            "password": "password123"
        }
        with pytest.raises(ValidationError) as exc_info:
            LoginSchema(**data)
        assert "email" in str(exc_info.value)

    def test_empty_password(self):
        """Test empty password raises validation error."""
        data = {
            "email": "test@example.com",
            "password": ""
        }
        with pytest.raises(ValidationError) as exc_info:
            LoginSchema(**data)
        assert "password" in str(exc_info.value)

    def test_missing_fields(self):
        """Test missing required fields raises validation error."""
        with pytest.raises(ValidationError) as exc_info:
            LoginSchema(email="test@example.com")
        assert "password" in str(exc_info.value)

    def test_whitespace_stripping(self):
        """Test that whitespace is stripped from fields."""
        data = {
            "email": "  test@example.com  ",
            "password": "  password123  "
        }
        schema = LoginSchema(**data)
        assert schema.email == "test@example.com"
        assert schema.password == "password123"


class TestSignUpSchema:
    """Test SignUpSchema validation."""

    def test_valid_signup_data(self):
        """Test valid signup data passes validation."""
        data = {
            "username": "testuser",
            "email": "test@example.com",
            "full_name": "Test User",
            "password": "Password123",
            "confirm_password": "Password123",
            "bio": "Test bio"
        }
        schema = SignUpSchema(**data)
        assert schema.username == "testuser"
        assert schema.email == "test@example.com"
        assert schema.full_name == "Test User"
        assert schema.password == "Password123"
        assert schema.bio == "Test bio"

    def test_username_validation(self):
        """Test username validation rules."""
        # Test valid usernames
        valid_usernames = ["user123", "test_user", "User123"]
        for username in valid_usernames:
            data = {
                "username": username,
                "email": "test@example.com",
                "full_name": "Test User",
                "password": "Password123",
                "confirm_password": "Password123"
            }
            schema = SignUpSchema(**data)
            assert schema.username == username

        # Test invalid usernames
        invalid_usernames = ["ab", "user@123", "user-123", "user 123", "a" * 31]
        for username in invalid_usernames:
            data = {
                "username": username,
                "email": "test@example.com",
                "full_name": "Test User",
                "password": "Password123",
                "confirm_password": "Password123"
            }
            with pytest.raises(ValidationError) as exc_info:
                SignUpSchema(**data)
            assert "username" in str(exc_info.value)

    def test_password_strength_validation(self):
        """Test password strength validation."""
        # Test valid passwords
        valid_passwords = ["Password123", "MyPass123", "Secure123"]
        for password in valid_passwords:
            data = {
                "username": "testuser",
                "email": "test@example.com",
                "full_name": "Test User",
                "password": password,
                "confirm_password": password
            }
            schema = SignUpSchema(**data)
            assert schema.password == password

        # Test invalid passwords - Pydantic validates length first, then our custom validator
        invalid_passwords = [
            ("nouppercase123", "Password must contain an uppercase letter"),
            ("NOLOWERCASE123", "Password must contain a lowercase letter"),
            ("NoNumbers", "Password must contain a number")
        ]
        
        for password, expected_error in invalid_passwords:
            data = {
                "username": "testuser",
                "email": "test@example.com",
                "full_name": "Test User",
                "password": password,
                "confirm_password": password
            }
            with pytest.raises(ValidationError) as exc_info:
                SignUpSchema(**data)
            assert expected_error in str(exc_info.value)

        # Test short password (Pydantic validation)
        data = {
            "username": "testuser",
            "email": "test@example.com",
            "full_name": "Test User",
            "password": "short",
            "confirm_password": "short"
        }
        with pytest.raises(ValidationError) as exc_info:
            SignUpSchema(**data)
        # Pydantic validates length first, so we get the built-in error
        assert "String should have at least 8 characters" in str(exc_info.value)

    def test_password_confirmation_validation(self):
        """Test password confirmation validation."""
        data = {
            "username": "testuser",
            "email": "test@example.com",
            "full_name": "Test User",
            "password": "Password123",
            "confirm_password": "DifferentPassword123"
        }
        with pytest.raises(ValidationError) as exc_info:
            SignUpSchema(**data)
        assert "Passwords must match" in str(exc_info.value)

    def test_email_validation(self):
        """Test email validation."""
        # Test valid emails
        valid_emails = ["test@example.com", "user.name@domain.co.uk", "test+tag@example.org"]
        for email in valid_emails:
            data = {
                "username": "testuser",
                "email": email,
                "full_name": "Test User",
                "password": "Password123",
                "confirm_password": "Password123"
            }
            schema = SignUpSchema(**data)
            assert schema.email == email

        # Test invalid emails
        invalid_emails = ["invalid-email", "@example.com", "test@", "test.example.com"]
        for email in invalid_emails:
            data = {
                "username": "testuser",
                "email": email,
                "full_name": "Test User",
                "password": "Password123",
                "confirm_password": "Password123"
            }
            with pytest.raises(ValidationError) as exc_info:
                SignUpSchema(**data)
            assert "email" in str(exc_info.value)

    def test_full_name_validation(self):
        """Test full name validation."""
        # Test valid names
        valid_names = ["John Doe", "A", "A" * 255]
        for name in valid_names:
            data = {
                "username": "testuser",
                "email": "test@example.com",
                "full_name": name,
                "password": "Password123",
                "confirm_password": "Password123"
            }
            schema = SignUpSchema(**data)
            assert schema.full_name == name

        # Test invalid names
        invalid_names = ["", "A" * 256]
        for name in invalid_names:
            data = {
                "username": "testuser",
                "email": "test@example.com",
                "full_name": name,
                "password": "Password123",
                "confirm_password": "Password123"
            }
            with pytest.raises(ValidationError) as exc_info:
                SignUpSchema(**data)
            assert "full_name" in str(exc_info.value)

    def test_bio_validation(self):
        """Test bio validation."""
        # Test valid bios
        valid_bios = [None, "", "Short bio", "A" * 2000]
        for bio in valid_bios:
            data = {
                "username": "testuser",
                "email": "test@example.com",
                "full_name": "Test User",
                "password": "Password123",
                "confirm_password": "Password123",
                "bio": bio
            }
            schema = SignUpSchema(**data)
            assert schema.bio == bio

        # Test invalid bio
        data = {
            "username": "testuser",
            "email": "test@example.com",
            "full_name": "Test User",
            "password": "Password123",
            "confirm_password": "Password123",
            "bio": "A" * 2001
        }
        with pytest.raises(ValidationError) as exc_info:
            SignUpSchema(**data)
        assert "bio" in str(exc_info.value)


class TestPasswordResetRequestSchema:
    """Test PasswordResetRequestSchema validation."""

    def test_valid_reset_request(self):
        """Test valid password reset request."""
        data = {"email": "test@example.com"}
        schema = PasswordResetRequestSchema(**data)
        assert schema.email == "test@example.com"

    def test_invalid_email(self):
        """Test invalid email in reset request."""
        data = {"email": "invalid-email"}
        with pytest.raises(ValidationError) as exc_info:
            PasswordResetRequestSchema(**data)
        assert "email" in str(exc_info.value)


class TestPasswordResetSchema:
    """Test PasswordResetSchema validation."""

    def test_valid_password_reset(self):
        """Test valid password reset."""
        data = {
            "token": "reset-token-123",
            "password": "NewPassword123",
            "confirm_password": "NewPassword123"
        }
        schema = PasswordResetSchema(**data)
        assert schema.token == "reset-token-123"
        assert schema.password == "NewPassword123"

    def test_password_strength_validation(self):
        """Test password strength validation in reset."""
        # Test invalid password - Pydantic validates length first
        data = {
            "token": "reset-token-123",
            "password": "weak",
            "confirm_password": "weak"
        }
        with pytest.raises(ValidationError) as exc_info:
            PasswordResetSchema(**data)
        # Pydantic validates length first, so we get the built-in error
        assert "String should have at least 8 characters" in str(exc_info.value)

    def test_password_confirmation_validation(self):
        """Test password confirmation validation in reset."""
        data = {
            "token": "reset-token-123",
            "password": "NewPassword123",
            "confirm_password": "DifferentPassword123"
        }
        with pytest.raises(ValidationError) as exc_info:
            PasswordResetSchema(**data)
        assert "Passwords must match" in str(exc_info.value)

    def test_missing_token(self):
        """Test missing token raises validation error."""
        data = {
            "password": "NewPassword123",
            "confirm_password": "NewPassword123"
        }
        with pytest.raises(ValidationError) as exc_info:
            PasswordResetSchema(**data)
        assert "token" in str(exc_info.value)


class TestAuthResponseSchema:
    """Test AuthResponseSchema validation."""

    def test_valid_auth_response(self):
        """Test valid auth response."""
        data = {
            "user": {"id": 1, "username": "testuser"},
            "message": "Login successful",
            "success": True
        }
        schema = AuthResponseSchema(**data)
        assert schema.user == {"id": 1, "username": "testuser"}
        assert schema.message == "Login successful"
        assert schema.success is True

    def test_auth_response_with_default_success(self):
        """Test auth response with default success value."""
        data = {
            "user": {"id": 1, "username": "testuser"},
            "message": "Login successful"
        }
        schema = AuthResponseSchema(**data)
        assert schema.success is True

    def test_auth_response_with_false_success(self):
        """Test auth response with false success value."""
        data = {
            "user": {"id": 1, "username": "testuser"},
            "message": "Login failed",
            "success": False
        }
        schema = AuthResponseSchema(**data)
        assert schema.success is False

    def test_missing_required_fields(self):
        """Test missing required fields raises validation error."""
        with pytest.raises(ValidationError) as exc_info:
            AuthResponseSchema(message="Test")
        assert "user" in str(exc_info.value)

        with pytest.raises(ValidationError) as exc_info:
            AuthResponseSchema(user={"id": 1})
        assert "message" in str(exc_info.value) 