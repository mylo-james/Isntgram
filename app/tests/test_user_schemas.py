"""
Test suite for user schemas
Tests Pydantic validation rules and edge cases
"""
import pytest
from datetime import datetime
from pydantic import ValidationError
from app.schemas.user_schemas import (
    UserBaseSchema,
    UserCreateSchema,
    UserUpdateSchema,
    UserResponseSchema,
    UserPublicSchema,
    UserStatsSchema
)


class TestUserBaseSchema:
    """Test UserBaseSchema validation."""

    def test_valid_user_base_data(self):
        """Test valid user base data passes validation."""
        data = {
            "email": "test@example.com",
            "full_name": "Test User",
            "username": "testuser",
            "bio": "Test bio"
        }
        schema = UserBaseSchema(**data)
        assert schema.email == "test@example.com"
        assert schema.full_name == "Test User"
        assert schema.username == "testuser"
        assert schema.bio == "Test bio"

    def test_user_base_without_bio(self):
        """Test user base data without bio."""
        data = {
            "email": "test@example.com",
            "full_name": "Test User",
            "username": "testuser"
        }
        schema = UserBaseSchema(**data)
        assert schema.bio is None

    def test_email_validation(self):
        """Test email validation."""
        # Test valid emails
        valid_emails = ["test@example.com", "user.name@domain.co.uk", "test+tag@example.org"]
        for email in valid_emails:
            data = {
                "email": email,
                "full_name": "Test User",
                "username": "testuser"
            }
            schema = UserBaseSchema(**data)
            assert schema.email == email

        # Test invalid emails
        invalid_emails = ["invalid-email", "@example.com", "test@", "test.example.com"]
        for email in invalid_emails:
            data = {
                "email": email,
                "full_name": "Test User",
                "username": "testuser"
            }
            with pytest.raises(ValidationError) as exc_info:
                UserBaseSchema(**data)
            assert "email" in str(exc_info.value)

    def test_username_validation(self):
        """Test username validation rules."""
        # Test valid usernames
        valid_usernames = ["user123", "test_user", "User123"]
        for username in valid_usernames:
            data = {
                "email": "test@example.com",
                "full_name": "Test User",
                "username": username
            }
            schema = UserBaseSchema(**data)
            assert schema.username == username

        # Test invalid usernames
        invalid_usernames = ["ab", "user@123", "user-123", "user 123", "a" * 31]
        for username in invalid_usernames:
            data = {
                "email": "test@example.com",
                "full_name": "Test User",
                "username": username
            }
            with pytest.raises(ValidationError) as exc_info:
                UserBaseSchema(**data)
            assert "username" in str(exc_info.value)

    def test_full_name_validation(self):
        """Test full name validation."""
        # Test valid names
        valid_names = ["John Doe", "A", "A" * 255]
        for name in valid_names:
            data = {
                "email": "test@example.com",
                "full_name": name,
                "username": "testuser"
            }
            schema = UserBaseSchema(**data)
            assert schema.full_name == name

        # Test invalid names
        invalid_names = ["", "A" * 256]
        for name in invalid_names:
            data = {
                "email": "test@example.com",
                "full_name": name,
                "username": "testuser"
            }
            with pytest.raises(ValidationError) as exc_info:
                UserBaseSchema(**data)
            assert "full_name" in str(exc_info.value)

    def test_bio_validation(self):
        """Test bio validation."""
        # Test valid bios
        valid_bios = [None, "", "Short bio", "A" * 2000]
        for bio in valid_bios:
            data = {
                "email": "test@example.com",
                "full_name": "Test User",
                "username": "testuser",
                "bio": bio
            }
            schema = UserBaseSchema(**data)
            assert schema.bio == bio

        # Test invalid bio
        data = {
            "email": "test@example.com",
            "full_name": "Test User",
            "username": "testuser",
            "bio": "A" * 2001
        }
        with pytest.raises(ValidationError) as exc_info:
            UserBaseSchema(**data)
        assert "bio" in str(exc_info.value)

    def test_whitespace_stripping(self):
        """Test that whitespace is stripped from fields."""
        data = {
            "email": "  test@example.com  ",
            "full_name": "  Test User  ",
            "username": "  testuser  ",
            "bio": "  Test bio  "
        }
        schema = UserBaseSchema(**data)
        assert schema.email == "test@example.com"
        assert schema.full_name == "Test User"
        assert schema.username == "testuser"
        assert schema.bio == "Test bio"


class TestUserCreateSchema:
    """Test UserCreateSchema validation."""

    def test_valid_user_create_data(self):
        """Test valid user create data passes validation."""
        data = {
            "email": "test@example.com",
            "full_name": "Test User",
            "username": "testuser",
            "password": "Password123",
            "profile_image_url": "https://example.com/image.jpg"
        }
        schema = UserCreateSchema(**data)
        assert schema.email == "test@example.com"
        assert schema.full_name == "Test User"
        assert schema.username == "testuser"
        assert schema.password == "Password123"
        assert schema.profile_image_url == "https://example.com/image.jpg"

    def test_password_validation(self):
        """Test password validation."""
        # Test valid passwords
        valid_passwords = ["password123", "MyPassword", "A" * 128]
        for password in valid_passwords:
            data = {
                "email": "test@example.com",
                "full_name": "Test User",
                "username": "testuser",
                "password": password
            }
            schema = UserCreateSchema(**data)
            assert schema.password == password

        # Test invalid passwords
        invalid_passwords = ["short", "A" * 129]
        for password in invalid_passwords:
            data = {
                "email": "test@example.com",
                "full_name": "Test User",
                "username": "testuser",
                "password": password
            }
            with pytest.raises(ValidationError) as exc_info:
                UserCreateSchema(**data)
            assert "password" in str(exc_info.value)

    def test_profile_image_url_validation(self):
        """Test profile image URL validation."""
        # Test valid URLs
        valid_urls = [None, "", "https://example.com/image.jpg", "A" * 255]
        for url in valid_urls:
            data = {
                "email": "test@example.com",
                "full_name": "Test User",
                "username": "testuser",
                "password": "password123",
                "profile_image_url": url
            }
            schema = UserCreateSchema(**data)
            assert schema.profile_image_url == url

        # Test invalid URL
        data = {
            "email": "test@example.com",
            "full_name": "Test User",
            "username": "testuser",
            "password": "password123",
            "profile_image_url": "A" * 256
        }
        with pytest.raises(ValidationError) as exc_info:
            UserCreateSchema(**data)
        assert "profile_image_url" in str(exc_info.value)


class TestUserUpdateSchema:
    """Test UserUpdateSchema validation."""

    def test_valid_user_update_data(self):
        """Test valid user update data passes validation."""
        data = {
            "email": "new@example.com",
            "full_name": "New Name",
            "username": "newuser",
            "bio": "New bio",
            "profile_image_url": "https://example.com/new.jpg"
        }
        schema = UserUpdateSchema(**data)
        assert schema.email == "new@example.com"
        assert schema.full_name == "New Name"
        assert schema.username == "newuser"
        assert schema.bio == "New bio"
        assert schema.profile_image_url == "https://example.com/new.jpg"

    def test_partial_user_update(self):
        """Test partial user update with only some fields."""
        data = {
            "email": "new@example.com",
            "full_name": "New Name"
        }
        schema = UserUpdateSchema(**data)
        assert schema.email == "new@example.com"
        assert schema.full_name == "New Name"
        assert schema.username is None
        assert schema.bio is None
        assert schema.profile_image_url is None

    def test_empty_user_update(self):
        """Test empty user update."""
        schema = UserUpdateSchema()
        assert schema.email is None
        assert schema.full_name is None
        assert schema.username is None
        assert schema.bio is None
        assert schema.profile_image_url is None

    def test_invalid_email_in_update(self):
        """Test invalid email in update raises validation error."""
        data = {
            "email": "invalid-email",
            "full_name": "Test User"
        }
        with pytest.raises(ValidationError) as exc_info:
            UserUpdateSchema(**data)
        assert "email" in str(exc_info.value)

    def test_invalid_username_in_update(self):
        """Test invalid username in update raises validation error."""
        data = {
            "username": "ab",  # Too short
            "full_name": "Test User"
        }
        with pytest.raises(ValidationError) as exc_info:
            UserUpdateSchema(**data)
        assert "username" in str(exc_info.value)


class TestUserResponseSchema:
    """Test UserResponseSchema validation."""

    def test_valid_user_response_data(self):
        """Test valid user response data passes validation."""
        now = datetime.now()
        data = {
            "id": 1,
            "email": "test@example.com",
            "full_name": "Test User",
            "username": "testuser",
            "bio": "Test bio",
            "profile_image_url": "https://example.com/image.jpg",
            "created_at": now,
            "updated_at": now
        }
        schema = UserResponseSchema(**data)
        assert schema.id == 1
        assert schema.email == "test@example.com"
        assert schema.full_name == "Test User"
        assert schema.username == "testuser"
        assert schema.bio == "Test bio"
        assert schema.profile_image_url == "https://example.com/image.jpg"
        assert schema.created_at == now
        assert schema.updated_at == now

    def test_user_response_without_optional_fields(self):
        """Test user response without optional fields."""
        now = datetime.now()
        data = {
            "id": 1,
            "email": "test@example.com",
            "full_name": "Test User",
            "username": "testuser",
            "created_at": now,
            "updated_at": now
        }
        schema = UserResponseSchema(**data)
        assert schema.bio is None
        assert schema.profile_image_url is None


class TestUserPublicSchema:
    """Test UserPublicSchema validation."""

    def test_valid_user_public_data(self):
        """Test valid user public data passes validation."""
        data = {
            "id": 1,
            "username": "testuser",
            "full_name": "Test User",
            "profile_image_url": "https://example.com/image.jpg"
        }
        schema = UserPublicSchema(**data)
        assert schema.id == 1
        assert schema.username == "testuser"
        assert schema.full_name == "Test User"
        assert schema.profile_image_url == "https://example.com/image.jpg"

    def test_user_public_without_profile_image(self):
        """Test user public data without profile image."""
        data = {
            "id": 1,
            "username": "testuser",
            "full_name": "Test User"
        }
        schema = UserPublicSchema(**data)
        assert schema.profile_image_url is None

    def test_missing_required_fields(self):
        """Test missing required fields raises validation error."""
        with pytest.raises(ValidationError) as exc_info:
            UserPublicSchema(username="testuser", full_name="Test User")
        assert "id" in str(exc_info.value)

        with pytest.raises(ValidationError) as exc_info:
            UserPublicSchema(id=1, full_name="Test User")
        assert "username" in str(exc_info.value)

        with pytest.raises(ValidationError) as exc_info:
            UserPublicSchema(id=1, username="testuser")
        assert "full_name" in str(exc_info.value)


class TestUserStatsSchema:
    """Test UserStatsSchema validation."""

    def test_valid_user_stats_data(self):
        """Test valid user stats data passes validation."""
        data = {
            "posts_count": 10,
            "followers_count": 25,
            "following_count": 15
        }
        schema = UserStatsSchema(**data)
        assert schema.posts_count == 10
        assert schema.followers_count == 25
        assert schema.following_count == 15

    def test_user_stats_with_defaults(self):
        """Test user stats with default values."""
        schema = UserStatsSchema()
        assert schema.posts_count == 0
        assert schema.followers_count == 0
        assert schema.following_count == 0

    def test_user_stats_partial_data(self):
        """Test user stats with partial data."""
        data = {
            "posts_count": 5
        }
        schema = UserStatsSchema(**data)
        assert schema.posts_count == 5
        assert schema.followers_count == 0
        assert schema.following_count == 0 