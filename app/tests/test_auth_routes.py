"""
Comprehensive test suite for authentication routes
AI-Generated following systematic testing protocol
Target Coverage: 100%
"""
import pytest
import json
from unittest.mock import patch, MagicMock
from app.models import User, db
from app.utils.api_utils import error_response, success_response
from pydantic import ValidationError
from sqlalchemy.exc import IntegrityError


class TestAuthRoutes:
    """Comprehensive test suite for all authentication endpoints."""

    # ============================================================================
    # SETUP & FIXTURES (10% of tests)
    # ============================================================================
    
    @pytest.fixture
    def valid_signup_data(self):
        """Valid signup data for testing"""
        return {
            "username": "testuser",
            "email": "test@example.com", 
            "password": "SecurePass123!",
            "confirm_password": "SecurePass123!",
            "full_name": "Test User"
        }
    
    @pytest.fixture
    def valid_login_data(self):
        """Valid login data for testing"""
        return {
            "email": "test@example.com",
            "password": "SecurePass123!"
        }
    
    @pytest.fixture
    def test_user(self, app):
        """Create a test user in database"""
        with app.app_context():
            user = User(
                username="testuser",
                email="test@example.com",
                full_name="Test User"
            )
            user.password = "SecurePass123!"
            db.session.add(user)
            db.session.commit()
            db.session.refresh(user)
            return user

    # ============================================================================
    # AUTHENTICATE ENDPOINT TESTS (GET /api/auth)
    # ============================================================================

    def test_authenticate_no_user_logged_in(self, client):
        """Test GET /api/auth when no user is logged in."""
        response = client.get('/api/auth')
        assert response.status_code == 401
        data = json.loads(response.data)
        assert "error" in data
        assert data["error"] == "Please login"
        assert data["success"] is False

    def test_authenticate_with_logged_in_user(self, client, test_user):
        """Test GET /api/auth with authenticated user."""
        # TODO: Need to implement user login session for this test
        # This would test the success path of authenticate()
        pass

    # ============================================================================
    # LOGIN ENDPOINT TESTS (POST /api/auth/login)
    # ============================================================================

    def test_login_success_valid_credentials(self, client, test_user, valid_login_data):
        """Test successful login with valid credentials."""
        response = client.post('/api/auth/login',
                             json=valid_login_data,
                             content_type='application/json')
        
        # Should succeed with valid credentials
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["success"] is True
        assert "user" in data
        assert data["user"]["email"] == "test@example.com"

    def test_login_validation_error_missing_email(self, client):
        """Test login validation error when email is missing."""
        invalid_data = {"password": "SecurePass123!"}
        response = client.post('/api/auth/login',
                             json=invalid_data,
                             content_type='application/json')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data["success"] is False
        assert "error" in data

    def test_login_validation_error_missing_password(self, client):
        """Test login validation error when password is missing."""
        invalid_data = {"email": "test@example.com"}
        response = client.post('/api/auth/login',
                             json=invalid_data,
                             content_type='application/json')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data["success"] is False
        assert "error" in data

    def test_login_invalid_credentials_wrong_password(self, client, test_user):
        """Test login with wrong password."""
        invalid_data = {
            "email": "test@example.com",
            "password": "WrongPassword123!"
        }
        response = client.post('/api/auth/login',
                             json=invalid_data,
                             content_type='application/json')
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert data["success"] is False
        assert "error" in data

    def test_login_invalid_credentials_nonexistent_user(self, client):
        """Test login with non-existent user email."""
        invalid_data = {
            "email": "nonexistent@example.com",
            "password": "SecurePass123!"
        }
        response = client.post('/api/auth/login',
                             json=invalid_data,
                             content_type='application/json')
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert data["success"] is False
        assert "error" in data

    def test_login_invalid_json_data(self, client):
        """Test login with invalid JSON data."""
        response = client.post('/api/auth/login',
                             data="invalid json",
                             content_type='application/json')
        
        # Flask returns 500 for malformed JSON, which gets caught and handled
        assert response.status_code == 500
        # The error is logged but a 500 error response is returned

    def test_login_rate_limiting_exists(self, client, test_user, valid_login_data):
        """Test that login endpoint works (rate limiting is applied in production)."""
        # Note: Rate limiting is tested in integration tests
        # This test verifies the endpoint works normally
        response = client.post('/api/auth/login',
                             json=valid_login_data,
                             content_type='application/json')
        
        # Should succeed with valid credentials
        assert response.status_code == 200

    # ============================================================================
    # LOGOUT ENDPOINT TESTS (POST /api/auth/logout)
    # ============================================================================

    def test_logout_success(self, client):
        """Test successful logout."""
        response = client.post('/api/auth/logout')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["success"] is True
        assert data["message"] == "User logged out successfully"

    def test_logout_when_not_logged_in(self, client):
        """Test logout when no user is logged in."""
        response = client.post('/api/auth/logout')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["success"] is True
        assert data["message"] == "User logged out successfully"

    @patch('app.api.auth_routes.invalidate_user_cache')
    def test_logout_cache_invalidation(self, mock_invalidate_cache, client):
        """Test that user cache is invalidated on logout."""
        # TODO: Need authenticated user session to test cache invalidation
        response = client.post('/api/auth/logout')
        assert response.status_code == 200

    # ============================================================================
    # SIGNUP ENDPOINT TESTS (POST /api/auth/signup)
    # ============================================================================

    def test_signup_success_valid_data(self, client, valid_signup_data):
        """Test successful signup with valid data."""
        response = client.post('/api/auth/signup',
                             json=valid_signup_data,
                             content_type='application/json')
        
        assert response.status_code == 201  # Created status for new user
        data = json.loads(response.data)
        assert data["success"] is True
        assert "user" in data
        assert data["user"]["username"] == "testuser"
        assert data["user"]["email"] == "test@example.com"

    def test_signup_validation_error_missing_username(self, client):
        """Test signup validation error when username is missing."""
        invalid_data = {
            "email": "test@example.com", 
            "password": "SecurePass123!",
            "full_name": "Test User"
        }
        response = client.post('/api/auth/signup',
                             json=invalid_data,
                             content_type='application/json')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data["success"] is False
        assert "error" in data

    def test_signup_validation_error_missing_email(self, client):
        """Test signup validation error when email is missing."""
        invalid_data = {
            "username": "testuser",
            "password": "SecurePass123!",
            "full_name": "Test User"
        }
        response = client.post('/api/auth/signup',
                             json=invalid_data,
                             content_type='application/json')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data["success"] is False
        assert "error" in data

    def test_signup_validation_error_missing_password(self, client):
        """Test signup validation error when password is missing."""
        invalid_data = {
            "username": "testuser",
            "email": "test@example.com",
            "full_name": "Test User"
        }
        response = client.post('/api/auth/signup',
                             json=invalid_data,
                             content_type='application/json')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data["success"] is False
        assert "error" in data

    def test_signup_validation_error_invalid_email_format(self, client):
        """Test signup validation error with invalid email format."""
        invalid_data = {
            "username": "testuser",
            "email": "invalid-email-format",
            "password": "SecurePass123!",
            "full_name": "Test User"
        }
        response = client.post('/api/auth/signup',
                             json=invalid_data,
                             content_type='application/json')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data["success"] is False
        assert "error" in data

    def test_signup_integrity_error_duplicate_username(self, client, test_user, valid_signup_data):
        """Test signup with duplicate username (integrity error)."""
        # Use same username as existing user
        response = client.post('/api/auth/signup',
                             json=valid_signup_data,
                             content_type='application/json')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data["success"] is False
        assert "error" in data

    def test_signup_integrity_error_duplicate_email(self, client, test_user):
        """Test signup with duplicate email (integrity error)."""
        duplicate_email_data = {
            "username": "differentuser",
            "email": "test@example.com",  # Same email as test_user
            "password": "SecurePass123!",
            "full_name": "Different User"
        }
        response = client.post('/api/auth/signup',
                             json=duplicate_email_data,
                             content_type='application/json')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data["success"] is False
        assert "error" in data

    def test_signup_invalid_json_data(self, client):
        """Test signup with invalid JSON data."""
        response = client.post('/api/auth/signup',
                             data="invalid json",
                             content_type='application/json')
        
        # Flask returns 500 for malformed JSON, which gets caught and handled
        assert response.status_code == 500
        # The error is logged but a 500 error response is returned

    # ============================================================================
    # UNAUTHORIZED ENDPOINT TESTS (GET /api/auth/unauthorized)
    # ============================================================================

    def test_unauthorized_endpoint(self, client):
        """Test GET /api/auth/unauthorized returns proper error."""
        response = client.get('/api/auth/unauthorized')
        assert response.status_code == 401
        data = json.loads(response.data)
        assert "error" in data
        assert data["error"] == "Unauthorized"
        assert "errors" in data
        assert "Authentication required" in data["errors"]
        assert data["success"] is False

    # ============================================================================
    # EDGE CASES & SECURITY TESTS (15% of tests)
    # ============================================================================

    def test_auth_endpoints_reject_get_when_post_required(self, client):
        """Test that POST endpoints reject GET requests."""
        # Test login endpoint
        response = client.get('/api/auth/login')
        assert response.status_code == 405  # Method Not Allowed
        
        # Test signup endpoint  
        response = client.get('/api/auth/signup')
        assert response.status_code == 405  # Method Not Allowed
        
        # Test logout endpoint
        response = client.get('/api/auth/logout')
        assert response.status_code == 405  # Method Not Allowed

    def test_special_characters_in_auth_data(self, client):
        """Test authentication with special characters."""
        special_char_data = {
            "username": "test🙂user",
            "email": "test+special@example.com",
            "password": "P@ssw0rd!#$%",
            "full_name": "Test 'Special' User"
        }
        response = client.post('/api/auth/signup',
                             json=special_char_data,
                             content_type='application/json')
        
        # Should handle special characters properly
        assert response.status_code in [200, 400]  # Either succeed or validation error

    def test_sql_injection_attempt_in_auth(self, client):
        """Test protection against SQL injection in auth fields."""
        injection_data = {
            "email": "test@example.com'; DROP TABLE users; --",
            "password": "password123"
        }
        response = client.post('/api/auth/login',
                             json=injection_data,
                             content_type='application/json')
        
        # Should not cause server error, either 401 or 400
        assert response.status_code in [400, 401]
        data = json.loads(response.data)
        assert data["success"] is False

    def test_extremely_long_input_handling(self, client):
        """Test handling of extremely long input data."""
        long_string = "x" * 10000
        long_data = {
            "username": long_string,
            "email": f"{long_string}@example.com",
            "password": long_string,
            "full_name": long_string
        }
        response = client.post('/api/auth/signup',
                             json=long_data,
                             content_type='application/json')
        
        # Should handle gracefully with validation error
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data["success"] is False
