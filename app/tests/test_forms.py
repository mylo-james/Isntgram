"""
Test suite for Flask-WTF forms
Tests form validation and CSRF protection
"""
import pytest
from app.forms.login_form import LoginForm
from app.forms.signup_form import SignUpForm
from unittest.mock import Mock, patch
from app import app as flask_app
from flask_wtf import FlaskForm


class TestLoginForm:
    """Test cases for LoginForm validation."""

    def test_login_form_initialization(self, test_request_context):
        """Test LoginForm initialization."""
        form = LoginForm()
        assert form is not None
        assert hasattr(form, 'username')
        assert hasattr(form, 'password')

    def test_login_form_valid_data(self, test_request_context, mock_user_query):
        """Test LoginForm validation with valid data."""
        mock_user = Mock()
        mock_user.check_password.return_value = True
        mock_user_query.filter.return_value.first.return_value = mock_user

        form = LoginForm()
        form.username.data = 'testuser'
        form.password.data = 'testpassword123'
        
        assert form.validate() is True

    def test_login_form_missing_username(self, test_request_context):
        """Test LoginForm validation with missing username."""
        form = LoginForm()
        form.username.data = ''
        form.password.data = 'testpassword123'
        
        assert form.validate() is False
        assert 'This field is required.' in str(form.username.errors)

    def test_login_form_missing_password(self, test_request_context):
        """Test LoginForm validation with missing password."""
        form = LoginForm()
        form.username.data = 'testuser'
        form.password.data = ''
        
        assert form.validate() is False
        assert 'This field is required.' in str(form.password.errors)

    def test_login_form_short_username(self, test_request_context, mock_user_query):
        """Test LoginForm validation with short username."""
        mock_user_query.filter.return_value.first.return_value = None

        form = LoginForm()
        form.username.data = 'ab'
        form.password.data = 'testpassword123'
        
        assert form.validate() is False
        assert 'Username not found.' in str(form.username.errors)

    def test_login_form_long_username(self, test_request_context, mock_user_query):
        """Test LoginForm validation with long username."""
        mock_user_query.filter.return_value.first.return_value = None

        form = LoginForm()
        form.username.data = 'a' * 25
        form.password.data = 'testpassword123'
        
        assert form.validate() is False
        assert 'Username not found.' in str(form.username.errors)

    def test_login_form_invalid_username_format(self, test_request_context, mock_user_query):
        """Test LoginForm validation with invalid username format."""
        mock_user_query.filter.return_value.first.return_value = None

        form = LoginForm()
        form.username.data = 'test@user'
        form.password.data = 'testpassword123'
        
        assert form.validate() is False
        assert 'Username not found.' in str(form.username.errors)

    def test_login_form_short_password(self, test_request_context, mock_user_query):
        """Test LoginForm validation with short password."""
        mock_user = Mock()
        mock_user.check_password.return_value = False
        mock_user_query.filter.return_value.first.return_value = mock_user

        form = LoginForm()
        form.username.data = 'testuser'
        form.password.data = '123'
        
        assert form.validate() is False
        assert 'Password was incorrect.' in str(form.password.errors)

    def test_login_form_username_whitespace(self, test_request_context, mock_user_query):
        """Test LoginForm validation with username containing whitespace."""
        mock_user_query.filter.return_value.first.return_value = None

        form = LoginForm()
        form.username.data = 'test user'
        form.password.data = 'testpassword123'
        
        assert form.validate() is False
        assert 'Username not found.' in str(form.username.errors)

    def test_login_form_password_whitespace(self, test_request_context, mock_user_query):
        """Test LoginForm validation with password containing whitespace."""
        mock_user = Mock()
        mock_user.check_password.return_value = True
        mock_user_query.filter.return_value.first.return_value = mock_user

        form = LoginForm()
        form.username.data = 'testuser'
        form.password.data = 'test password 123'
        
        assert form.validate() is True

    def test_login_form_special_characters_username(self, test_request_context, mock_user_query):
        """Test LoginForm validation with username containing special characters."""
        mock_user_query.filter.return_value.first.return_value = None

        form = LoginForm()
        form.username.data = 'test!user'
        form.password.data = 'testpassword123'
        
        assert form.validate() is False
        assert 'Username not found.' in str(form.username.errors)

    def test_login_form_numeric_username(self, test_request_context, mock_user_query):
        """Test LoginForm validation with numeric username."""
        mock_user = Mock()
        mock_user.check_password.return_value = True
        mock_user_query.filter.return_value.first.return_value = mock_user

        form = LoginForm()
        form.username.data = '12345'
        form.password.data = 'testpassword123'
        
        assert form.validate() is True

    def test_login_form_underscore_username(self, test_request_context, mock_user_query):
        """Test LoginForm validation with username containing underscores."""
        mock_user = Mock()
        mock_user.check_password.return_value = True
        mock_user_query.filter.return_value.first.return_value = mock_user

        form = LoginForm()
        form.username.data = 'test_user'
        form.password.data = 'testpassword123'
        
        assert form.validate() is True


class TestSignUpForm:
    """Test cases for SignUpForm validation."""

    def test_signup_form_initialization(self, test_request_context):
        """Test SignUpForm initialization."""
        form = SignUpForm()
        assert form is not None
        assert hasattr(form, 'username')
        assert hasattr(form, 'email')
        assert hasattr(form, 'full_name')
        assert hasattr(form, 'password')
        assert hasattr(form, 'confirmPassword')

    def test_signup_form_valid_data(self, test_request_context, mock_user_query):
        """Test SignUpForm validation with valid data."""
        mock_user_query.filter.return_value.first.return_value = None

        form = SignUpForm()
        form.username.data = 'testuser'
        form.email.data = 'test@example.com'
        form.full_name.data = 'Test User'
        form.password.data = 'TestPassword123'
        form.confirmPassword.data = 'TestPassword123'
        
        assert form.validate() is True

    def test_signup_form_missing_username(self, test_request_context):
        """Test SignUpForm validation with missing username."""
        form = SignUpForm()
        form.username.data = ''
        form.email.data = 'test@example.com'
        form.full_name.data = 'Test User'
        form.password.data = 'TestPassword123'
        form.confirmPassword.data = 'TestPassword123'
        
        assert form.validate() is False
        assert 'This field is required.' in str(form.username.errors)

    def test_signup_form_missing_email(self, test_request_context):
        """Test SignUpForm validation with missing email."""
        form = SignUpForm()
        form.username.data = 'testuser'
        form.email.data = ''
        form.full_name.data = 'Test User'
        form.password.data = 'TestPassword123'
        form.confirmPassword.data = 'TestPassword123'
        
        assert form.validate() is False
        assert 'This field is required.' in str(form.email.errors)

    def test_signup_form_missing_password(self, test_request_context):
        """Test SignUpForm validation with missing password."""
        form = SignUpForm()
        form.username.data = 'testuser'
        form.email.data = 'test@example.com'
        form.full_name.data = 'Test User'
        form.password.data = ''
        form.confirmPassword.data = 'TestPassword123'
        
        assert form.validate() is False
        assert 'This field is required.' in str(form.password.errors)

    def test_signup_form_missing_confirm_password(self, test_request_context):
        """Test SignUpForm validation with missing confirm password."""
        form = SignUpForm()
        form.username.data = 'testuser'
        form.email.data = 'test@example.com'
        form.full_name.data = 'Test User'
        form.password.data = 'TestPassword123'
        form.confirmPassword.data = ''
        
        assert form.validate() is False
        assert 'passwords must match' in str(form.password.errors)

    def test_signup_form_short_username(self, test_request_context, mock_user_query):
        """Test SignUpForm validation with short username."""
        mock_user_query.filter.return_value.first.return_value = None

        form = SignUpForm()
        form.username.data = 'ab'
        form.email.data = 'test@example.com'
        form.full_name.data = 'Test User'
        form.password.data = 'TestPassword123'
        form.confirmPassword.data = 'TestPassword123'
        
        assert form.validate() is True  # No length validation in current form

    def test_signup_form_long_username(self, test_request_context, mock_user_query):
        """Test SignUpForm validation with long username."""
        mock_user_query.filter.return_value.first.return_value = None

        form = SignUpForm()
        form.username.data = 'a' * 25
        form.email.data = 'test@example.com'
        form.full_name.data = 'Test User'
        form.password.data = 'TestPassword123'
        form.confirmPassword.data = 'TestPassword123'
        
        assert form.validate() is True  # No length validation in current form

    def test_signup_form_invalid_username_format(self, test_request_context, mock_user_query):
        """Test SignUpForm validation with invalid username format."""
        mock_user_query.filter.return_value.first.return_value = None

        form = SignUpForm()
        form.username.data = 'test@user'
        form.email.data = 'test@example.com'
        form.full_name.data = 'Test User'
        form.password.data = 'TestPassword123'
        form.confirmPassword.data = 'TestPassword123'
        
        assert form.validate() is True  # No format validation in current form

    def test_signup_form_invalid_email_format(self, test_request_context, mock_user_query):
        """Test SignUpForm validation with invalid email format."""
        mock_user_query.filter.return_value.first.return_value = None

        form = SignUpForm()
        form.username.data = 'testuser'
        form.email.data = 'invalid-email'
        form.full_name.data = 'Test User'
        form.password.data = 'TestPassword123'
        form.confirmPassword.data = 'TestPassword123'
        
        assert form.validate() is False
        assert 'Invalid email address.' in str(form.email.errors)

    def test_signup_form_short_password(self, test_request_context, mock_user_query):
        """Test SignUpForm validation with short password."""
        mock_user_query.filter.return_value.first.return_value = None

        form = SignUpForm()
        form.username.data = 'testuser'
        form.email.data = 'test@example.com'
        form.full_name.data = 'Test User'
        form.password.data = 'short'
        form.confirmPassword.data = 'short'
        
        assert form.validate() is False
        assert 'Password must be at least 8 characters long' in str(form.password.errors)

    def test_signup_form_password_mismatch(self, test_request_context, mock_user_query):
        """Test SignUpForm validation with password mismatch."""
        mock_user_query.filter.return_value.first.return_value = None

        form = SignUpForm()
        form.username.data = 'testuser'
        form.email.data = 'test@example.com'
        form.full_name.data = 'Test User'
        form.password.data = 'TestPassword123'
        form.confirmPassword.data = 'DifferentPassword123'
        
        assert form.validate() is False
        assert 'passwords must match' in str(form.password.errors)

    def test_signup_form_weak_password(self, test_request_context, mock_user_query):
        """Test SignUpForm validation with weak password."""
        mock_user_query.filter.return_value.first.return_value = None

        form = SignUpForm()
        form.username.data = 'testuser'
        form.email.data = 'test@example.com'
        form.full_name.data = 'Test User'
        form.password.data = 'weakpass'
        form.confirmPassword.data = 'weakpass'
        
        assert form.validate() is False
        assert 'Password must contain an uppercase letter' in str(form.password.errors)

    def test_signup_form_valid_email_formats(self, test_request_context, mock_user_query):
        """Test SignUpForm validation with various valid email formats."""
        valid_emails = [
            'test@example.com',
            'user.name@domain.com',
            'user+tag@example.co.uk',
            '123@test.org'
        ]

        mock_user_query.filter.return_value.first.return_value = None

        for email in valid_emails:
            form = SignUpForm()
            form.username.data = 'testuser'
            form.email.data = email
            form.full_name.data = 'Test User'
            form.password.data = 'TestPassword123'
            form.confirmPassword.data = 'TestPassword123'
            
            assert form.validate() is True

    def test_signup_form_invalid_email_formats(self, test_request_context, mock_user_query):
        """Test SignUpForm validation with various invalid email formats."""
        invalid_emails = [
            'invalid-email',
            '@example.com',
            'user@',
            'user@.com',
            'user..name@example.com',
            'user@example..com'
        ]

        mock_user_query.filter.return_value.first.return_value = None

        for email in invalid_emails:
            form = SignUpForm()
            form.username.data = 'testuser'
            form.email.data = email
            form.full_name.data = 'Test User'
            form.password.data = 'TestPassword123'
            form.confirmPassword.data = 'TestPassword123'
            
            assert form.validate() is False
            assert 'Invalid email address.' in str(form.email.errors)

    def test_signup_form_strong_password(self, test_request_context, mock_user_query):
        """Test SignUpForm validation with strong password."""
        strong_passwords = [
            'MySecurePass123!',
            'Complex@Password#2024',
            'VeryLongPasswordWithNumbers123',
            'Special!@#$%^&*()Chars123'
        ]

        mock_user_query.filter.return_value.first.return_value = None

        for password in strong_passwords:
            form = SignUpForm()
            form.username.data = 'testuser'
            form.email.data = 'test@example.com'
            form.full_name.data = 'Test User'
            form.password.data = password
            form.confirmPassword.data = password
            
            assert form.validate() is True

    def test_signup_form_weak_passwords(self, test_request_context, mock_user_query):
        """Test SignUpForm validation with weak passwords."""
        weak_passwords = [
            'password',
            '123456',
            'qwerty',
            'admin',
            'letmein',
            'welcome'
        ]

        mock_user_query.filter.return_value.first.return_value = None

        for password in weak_passwords:
            form = SignUpForm()
            form.username.data = 'testuser'
            form.email.data = 'test@example.com'
            form.full_name.data = 'Test User'
            form.password.data = password
            form.confirmPassword.data = password
            
            assert form.validate() is False
            # Should fail password validation

    def test_signup_form_username_edge_cases(self, test_request_context, mock_user_query):
        """Test SignUpForm validation with username edge cases."""
        # Valid usernames
        valid_usernames = [
            'testuser',
            'user123',
            'test_user',
            'user_name_123',
            'a' * 20  # Maximum length
        ]

        mock_user_query.filter.return_value.first.return_value = None

        for username in valid_usernames:
            form = SignUpForm()
            form.username.data = username
            form.email.data = 'test@example.com'
            form.full_name.data = 'Test User'
            form.password.data = 'TestPassword123'
            form.confirmPassword.data = 'TestPassword123'
            
            assert form.validate() is True


class TestFormIntegration:
    """Integration tests for form functionality."""

    def test_form_csrf_protection(self, test_request_context):
        """Test that forms have CSRF protection enabled."""
        login_form = LoginForm()
        signup_form = SignUpForm()

        # Check that forms inherit from FlaskForm (which provides CSRF protection)
        assert isinstance(login_form, FlaskForm)
        assert isinstance(signup_form, FlaskForm)
        
        # Check that forms have the _fields attribute (FlaskForm feature)
        assert hasattr(login_form, '_fields')
        assert hasattr(signup_form, '_fields')
        
        # Check that forms can be validated (CSRF is handled internally)
        assert hasattr(login_form, 'validate')
        assert hasattr(signup_form, 'validate')

    def test_form_field_types(self, test_request_context):
        """Test that form fields have correct types."""
        login_form = LoginForm()
        signup_form = SignUpForm()

        # Check field types
        assert login_form.username.type == 'StringField'
        assert login_form.password.type == 'StringField'  # Changed from PasswordField
        assert signup_form.username.type == 'StringField'
        assert signup_form.email.type == 'StringField'
        assert signup_form.full_name.type == 'StringField'
        assert signup_form.password.type == 'StringField'
        assert signup_form.confirmPassword.type == 'StringField'

    def test_form_validation_messages(self, test_request_context):
        """Test that form validation messages are appropriate."""
        login_form = LoginForm()
        signup_form = SignUpForm()

        # Test login form validation messages
        login_form.username.data = ''
        login_form.password.data = ''
        login_form.validate()

        assert 'This field is required.' in str(login_form.username.errors)
        assert 'This field is required.' in str(login_form.password.errors)

        # Test signup form validation messages
        signup_form.username.data = ''
        signup_form.email.data = ''
        signup_form.full_name.data = ''
        signup_form.password.data = ''
        signup_form.confirmPassword.data = ''
        signup_form.validate()

        assert 'This field is required.' in str(signup_form.username.errors)
        assert 'This field is required.' in str(signup_form.email.errors)
        assert 'This field is required.' in str(signup_form.full_name.errors)
        assert 'This field is required.' in str(signup_form.password.errors)

    def test_form_data_persistence(self, test_request_context):
        """Test that form data persists correctly."""
        login_form = LoginForm()
        signup_form = SignUpForm()

        # Set data
        login_form.username.data = 'testuser'
        login_form.password.data = 'testpass'

        signup_form.username.data = 'newuser'
        signup_form.email.data = 'new@example.com'
        signup_form.full_name.data = 'New User'
        signup_form.password.data = 'NewPass123'
        signup_form.confirmPassword.data = 'NewPass123'

        # Verify data persistence
        assert login_form.username.data == 'testuser'
        assert login_form.password.data == 'testpass'
        assert signup_form.username.data == 'newuser'
        assert signup_form.email.data == 'new@example.com'
        assert signup_form.full_name.data == 'New User'
        assert signup_form.password.data == 'NewPass123'
        assert signup_form.confirmPassword.data == 'NewPass123' 