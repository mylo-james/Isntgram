"""
Test suite for like schemas
Tests Pydantic validation rules and edge cases
"""
import pytest
from datetime import datetime
from pydantic import ValidationError
from app.schemas.like_schemas import (
    LikeCreateSchema,
    LikeResponseSchema,
    LikeWithUserSchema,
    LikeStatsSchema,
    LikeableType
)
from app.schemas.user_schemas import UserPublicSchema


class TestLikeCreateSchema:
    """Test LikeCreateSchema validation."""

    def test_valid_like_create_data(self):
        """Test valid like create data passes validation."""
        data = {
            "likeable_id": 1,
            "likeable_type": "Post"
        }
        schema = LikeCreateSchema(**data)
        assert schema.likeable_id == 1
        assert schema.likeable_type == "Post"

    def test_like_create_with_comment(self):
        """Test like create data for comment."""
        data = {
            "likeable_id": 5,
            "likeable_type": "Comment"
        }
        schema = LikeCreateSchema(**data)
        assert schema.likeable_id == 5
        assert schema.likeable_type == "Comment"

    def test_likeable_id_validation(self):
        """Test likeable_id validation."""
        # Test valid IDs
        valid_ids = [1, 100, 999999]
        for likeable_id in valid_ids:
            data = {
                "likeable_id": likeable_id,
                "likeable_type": "Post"
            }
            schema = LikeCreateSchema(**data)
            assert schema.likeable_id == likeable_id

        # Test missing likeable_id
        data = {
            "likeable_type": "Post"
        }
        with pytest.raises(ValidationError) as exc_info:
            LikeCreateSchema(**data)
        assert "likeable_id" in str(exc_info.value)

    def test_likeable_type_validation(self):
        """Test likeable_type validation."""
        # Test valid types
        valid_types = ["Post", "Comment"]
        for likeable_type in valid_types:
            data = {
                "likeable_id": 1,
                "likeable_type": likeable_type
            }
            schema = LikeCreateSchema(**data)
            assert schema.likeable_type == likeable_type

        # Test invalid type
        data = {
            "likeable_id": 1,
            "likeable_type": "Invalid"
        }
        with pytest.raises(ValidationError) as exc_info:
            LikeCreateSchema(**data)
        assert "likeable_type" in str(exc_info.value)

        # Test missing likeable_type
        data = {
            "likeable_id": 1
        }
        with pytest.raises(ValidationError) as exc_info:
            LikeCreateSchema(**data)
        assert "likeable_type" in str(exc_info.value)


class TestLikeResponseSchema:
    """Test LikeResponseSchema validation."""

    def test_valid_like_response_data(self):
        """Test valid like response data passes validation."""
        now = datetime.now()
        data = {
            "id": 1,
            "user_id": 2,
            "likeable_id": 3,
            "likeable_type": "Post",
            "created_at": now
        }
        schema = LikeResponseSchema(**data)
        assert schema.id == 1
        assert schema.user_id == 2
        assert schema.likeable_id == 3
        assert schema.likeable_type == "Post"
        assert schema.created_at == now

    def test_like_response_with_comment(self):
        """Test like response data for comment."""
        now = datetime.now()
        data = {
            "id": 1,
            "user_id": 2,
            "likeable_id": 5,
            "likeable_type": "Comment",
            "created_at": now
        }
        schema = LikeResponseSchema(**data)
        assert schema.likeable_type == "Comment"

    def test_missing_required_fields(self):
        """Test missing required fields raises validation error."""
        with pytest.raises(ValidationError) as exc_info:
            LikeResponseSchema(likeable_id=1, likeable_type="Post")
        assert "id" in str(exc_info.value)

        with pytest.raises(ValidationError) as exc_info:
            LikeResponseSchema(id=1, likeable_id=1, likeable_type="Post")
        assert "user_id" in str(exc_info.value)

        with pytest.raises(ValidationError) as exc_info:
            LikeResponseSchema(id=1, user_id=2, likeable_type="Post")
        assert "likeable_id" in str(exc_info.value)

        with pytest.raises(ValidationError) as exc_info:
            LikeResponseSchema(id=1, user_id=2, likeable_id=1)
        assert "likeable_type" in str(exc_info.value)

        with pytest.raises(ValidationError) as exc_info:
            LikeResponseSchema(id=1, user_id=2, likeable_id=1, likeable_type="Post")
        assert "created_at" in str(exc_info.value)


class TestLikeStatsSchema:
    """Test LikeStatsSchema validation."""

    def test_valid_like_stats_data(self):
        """Test valid like stats data passes validation."""
        data = {
            "total_likes": 10,
            "user_liked": True
        }
        schema = LikeStatsSchema(**data)
        assert schema.total_likes == 10
        assert schema.user_liked is True

    def test_like_stats_with_defaults(self):
        """Test like stats with default values."""
        schema = LikeStatsSchema()
        assert schema.total_likes == 0
        assert schema.user_liked is False

    def test_like_stats_partial_data(self):
        """Test like stats with partial data."""
        data = {"total_likes": 5}
        schema = LikeStatsSchema(**data)
        assert schema.total_likes == 5
        assert schema.user_liked is False

        data = {"user_liked": True}
        schema = LikeStatsSchema(**data)
        assert schema.total_likes == 0
        assert schema.user_liked is True


class TestLikeWithUserSchema:
    """Test LikeWithUserSchema validation."""

    def test_valid_like_with_user_data(self):
        """Test valid like with user data passes validation."""
        now = datetime.now()
        user_data = {
            "id": 2,
            "username": "testuser",
            "full_name": "Test User",
            "profile_image_url": "https://example.com/profile.jpg"
        }
        data = {
            "id": 1,
            "user_id": 2,
            "likeable_id": 3,
            "likeable_type": "Post",
            "created_at": now,
            "user": user_data
        }
        schema = LikeWithUserSchema(**data)
        assert schema.id == 1
        assert schema.user_id == 2
        assert schema.likeable_id == 3
        assert schema.likeable_type == "Post"
        assert schema.user.id == 2
        assert schema.user.username == "testuser"
        assert schema.user.full_name == "Test User"
        assert schema.user.profile_image_url == "https://example.com/profile.jpg"

    def test_like_with_user_without_profile_image(self):
        """Test like with user without profile image."""
        now = datetime.now()
        user_data = {
            "id": 2,
            "username": "testuser",
            "full_name": "Test User"
        }
        data = {
            "id": 1,
            "user_id": 2,
            "likeable_id": 3,
            "likeable_type": "Post",
            "created_at": now,
            "user": user_data
        }
        schema = LikeWithUserSchema(**data)
        assert schema.user.profile_image_url is None

    def test_like_with_user_for_comment(self):
        """Test like with user data for comment."""
        now = datetime.now()
        user_data = {
            "id": 2,
            "username": "testuser",
            "full_name": "Test User"
        }
        data = {
            "id": 1,
            "user_id": 2,
            "likeable_id": 5,
            "likeable_type": "Comment",
            "created_at": now,
            "user": user_data
        }
        schema = LikeWithUserSchema(**data)
        assert schema.likeable_type == "Comment"

    def test_missing_user_data(self):
        """Test missing user data raises validation error."""
        now = datetime.now()
        data = {
            "id": 1,
            "user_id": 2,
            "likeable_id": 3,
            "likeable_type": "Post",
            "created_at": now
        }
        with pytest.raises(ValidationError) as exc_info:
            LikeWithUserSchema(**data)
        assert "user" in str(exc_info.value)


class TestLikeableType:
    """Test LikeableType validation."""

    def test_valid_likeable_types(self):
        """Test that valid likeable types are accepted."""
        valid_types = ["Post", "Comment"]
        
        for likeable_type in valid_types:
            # Test with LikeCreateSchema
            data = {
                "likeable_id": 1,
                "likeable_type": likeable_type
            }
            schema = LikeCreateSchema(**data)
            assert schema.likeable_type == likeable_type

            # Test with LikeResponseSchema
            now = datetime.now()
            data = {
                "id": 1,
                "user_id": 2,
                "likeable_id": 1,
                "likeable_type": likeable_type,
                "created_at": now
            }
            schema = LikeResponseSchema(**data)
            assert schema.likeable_type == likeable_type

    def test_invalid_likeable_types(self):
        """Test that invalid likeable types are rejected."""
        invalid_types = ["post", "comment", "User", "Invalid", ""]
        
        for likeable_type in invalid_types:
            # Test with LikeCreateSchema
            data = {
                "likeable_id": 1,
                "likeable_type": likeable_type
            }
            with pytest.raises(ValidationError) as exc_info:
                LikeCreateSchema(**data)
            assert "likeable_type" in str(exc_info.value)

            # Test with LikeResponseSchema
            now = datetime.now()
            data = {
                "id": 1,
                "user_id": 2,
                "likeable_id": 1,
                "likeable_type": likeable_type,
                "created_at": now
            }
            with pytest.raises(ValidationError) as exc_info:
                LikeResponseSchema(**data)
            assert "likeable_type" in str(exc_info.value) 