"""
Test suite for comment schemas
Tests Pydantic validation rules and edge cases
"""
import pytest
from datetime import datetime
from pydantic import ValidationError
from app.schemas.comment_schemas import (
    CommentBaseSchema,
    CommentCreateSchema,
    CommentUpdateSchema,
    CommentResponseSchema,
    CommentWithUserSchema,
    CommentStatsSchema,
    CommentDetailSchema
)
from app.schemas.user_schemas import UserPublicSchema


class TestCommentBaseSchema:
    """Test CommentBaseSchema validation."""

    def test_valid_comment_base_data(self):
        """Test valid comment base data passes validation."""
        data = {
            "content": "This is a test comment"
        }
        schema = CommentBaseSchema(**data)
        assert schema.content == "This is a test comment"

    def test_content_validation(self):
        """Test content validation rules."""
        # Test valid content
        valid_contents = [
            "Short comment",
            "A" * 2000,  # Max length
            "Comment with special chars: !@#$%^&*()",
            "Comment with numbers: 12345",
            "Comment with emojis: 😀👍🎉"
        ]
        for content in valid_contents:
            data = {"content": content}
            schema = CommentBaseSchema(**data)
            assert schema.content == content

        # Test invalid content
        invalid_contents = [
            "",  # Empty string
            "A" * 2001,  # Too long
        ]
        for content in invalid_contents:
            data = {"content": content}
            with pytest.raises(ValidationError) as exc_info:
                CommentBaseSchema(**data)
            assert "content" in str(exc_info.value)

    def test_whitespace_stripping(self):
        """Test that whitespace is stripped from fields."""
        data = {
            "content": "  Test comment  "
        }
        schema = CommentBaseSchema(**data)
        assert schema.content == "Test comment"


class TestCommentCreateSchema:
    """Test CommentCreateSchema validation."""

    def test_valid_comment_create_data(self):
        """Test valid comment create data passes validation."""
        data = {
            "content": "This is a test comment",
            "post_id": 1
        }
        schema = CommentCreateSchema(**data)
        assert schema.content == "This is a test comment"
        assert schema.post_id == 1

    def test_comment_create_inherits_base_validation(self):
        """Test that CommentCreateSchema inherits base validation rules."""
        # Test invalid content
        data = {
            "content": "",  # Empty content
            "post_id": 1
        }
        with pytest.raises(ValidationError) as exc_info:
            CommentCreateSchema(**data)
        assert "content" in str(exc_info.value)

        # Test content too long
        data = {
            "content": "A" * 2001,
            "post_id": 1
        }
        with pytest.raises(ValidationError) as exc_info:
            CommentCreateSchema(**data)
        assert "content" in str(exc_info.value)

    def test_post_id_validation(self):
        """Test post_id validation."""
        # Test valid post_id
        valid_post_ids = [1, 100, 999999]
        for post_id in valid_post_ids:
            data = {
                "content": "Test comment",
                "post_id": post_id
            }
            schema = CommentCreateSchema(**data)
            assert schema.post_id == post_id

        # Test missing post_id
        data = {
            "content": "Test comment"
        }
        with pytest.raises(ValidationError) as exc_info:
            CommentCreateSchema(**data)
        assert "post_id" in str(exc_info.value)


class TestCommentUpdateSchema:
    """Test CommentUpdateSchema validation."""

    def test_valid_comment_update_data(self):
        """Test valid comment update data passes validation."""
        data = {
            "content": "Updated comment content"
        }
        schema = CommentUpdateSchema(**data)
        assert schema.content == "Updated comment content"

    def test_content_validation_in_update(self):
        """Test content validation in update."""
        # Test valid content
        valid_contents = [
            "Short comment",
            "A" * 2000,  # Max length
            "Comment with special chars: !@#$%^&*()"
        ]
        for content in valid_contents:
            data = {"content": content}
            schema = CommentUpdateSchema(**data)
            assert schema.content == content

        # Test invalid content
        invalid_contents = [
            "",  # Empty string
            "A" * 2001,  # Too long
        ]
        for content in invalid_contents:
            data = {"content": content}
            with pytest.raises(ValidationError) as exc_info:
                CommentUpdateSchema(**data)
            assert "content" in str(exc_info.value)

    def test_whitespace_stripping_in_update(self):
        """Test that whitespace is stripped in update."""
        data = {"content": "  Updated comment  "}
        schema = CommentUpdateSchema(**data)
        assert schema.content == "Updated comment"


class TestCommentResponseSchema:
    """Test CommentResponseSchema validation."""

    def test_valid_comment_response_data(self):
        """Test valid comment response data passes validation."""
        now = datetime.now()
        data = {
            "id": 1,
            "user_id": 2,
            "post_id": 3,
            "content": "Test comment",
            "created_at": now,
            "updated_at": now
        }
        schema = CommentResponseSchema(**data)
        assert schema.id == 1
        assert schema.user_id == 2
        assert schema.post_id == 3
        assert schema.content == "Test comment"
        assert schema.created_at == now
        assert schema.updated_at == now

    def test_missing_required_fields(self):
        """Test missing required fields raises validation error."""
        with pytest.raises(ValidationError) as exc_info:
            CommentResponseSchema(content="Test comment")
        assert "id" in str(exc_info.value)

        with pytest.raises(ValidationError) as exc_info:
            CommentResponseSchema(id=1, content="Test comment")
        assert "user_id" in str(exc_info.value)

        with pytest.raises(ValidationError) as exc_info:
            CommentResponseSchema(id=1, user_id=2, content="Test comment")
        assert "post_id" in str(exc_info.value)


class TestCommentStatsSchema:
    """Test CommentStatsSchema validation."""

    def test_valid_comment_stats_data(self):
        """Test valid comment stats data passes validation."""
        data = {
            "likes_count": 10
        }
        schema = CommentStatsSchema(**data)
        assert schema.likes_count == 10

    def test_comment_stats_with_defaults(self):
        """Test comment stats with default values."""
        schema = CommentStatsSchema()
        assert schema.likes_count == 0

    def test_comment_stats_partial_data(self):
        """Test comment stats with partial data."""
        data = {"likes_count": 5}
        schema = CommentStatsSchema(**data)
        assert schema.likes_count == 5


class TestCommentWithUserSchema:
    """Test CommentWithUserSchema validation."""

    def test_valid_comment_with_user_data(self):
        """Test valid comment with user data passes validation."""
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
            "post_id": 3,
            "content": "Test comment",
            "created_at": now,
            "updated_at": now,
            "user": user_data
        }
        schema = CommentWithUserSchema(**data)
        assert schema.id == 1
        assert schema.user_id == 2
        assert schema.post_id == 3
        assert schema.content == "Test comment"
        assert schema.user.id == 2
        assert schema.user.username == "testuser"
        assert schema.user.full_name == "Test User"
        assert schema.user.profile_image_url == "https://example.com/profile.jpg"

    def test_comment_with_user_without_profile_image(self):
        """Test comment with user without profile image."""
        now = datetime.now()
        user_data = {
            "id": 2,
            "username": "testuser",
            "full_name": "Test User"
        }
        data = {
            "id": 1,
            "user_id": 2,
            "post_id": 3,
            "content": "Test comment",
            "created_at": now,
            "updated_at": now,
            "user": user_data
        }
        schema = CommentWithUserSchema(**data)
        assert schema.user.profile_image_url is None

    def test_missing_user_data(self):
        """Test missing user data raises validation error."""
        now = datetime.now()
        data = {
            "id": 1,
            "user_id": 2,
            "post_id": 3,
            "content": "Test comment",
            "created_at": now,
            "updated_at": now
        }
        with pytest.raises(ValidationError) as exc_info:
            CommentWithUserSchema(**data)
        assert "user" in str(exc_info.value)


class TestCommentDetailSchema:
    """Test CommentDetailSchema validation."""

    def test_valid_comment_detail_data(self):
        """Test valid comment detail data passes validation."""
        now = datetime.now()
        user_data = {
            "id": 2,
            "username": "testuser",
            "full_name": "Test User"
        }
        stats_data = {
            "likes_count": 5
        }
        data = {
            "id": 1,
            "user_id": 2,
            "post_id": 3,
            "content": "Test comment",
            "created_at": now,
            "updated_at": now,
            "user": user_data,
            "stats": stats_data
        }
        schema = CommentDetailSchema(**data)
        assert schema.id == 1
        assert schema.user_id == 2
        assert schema.post_id == 3
        assert schema.content == "Test comment"
        assert schema.user.id == 2
        assert schema.user.username == "testuser"
        assert schema.stats.likes_count == 5

    def test_comment_detail_with_default_stats(self):
        """Test comment detail with default stats."""
        now = datetime.now()
        user_data = {
            "id": 2,
            "username": "testuser",
            "full_name": "Test User"
        }
        stats_data = {
            "likes_count": 0
        }
        data = {
            "id": 1,
            "user_id": 2,
            "post_id": 3,
            "content": "Test comment",
            "created_at": now,
            "updated_at": now,
            "user": user_data,
            "stats": stats_data
        }
        schema = CommentDetailSchema(**data)
        assert schema.stats.likes_count == 0

    def test_missing_stats_data(self):
        """Test missing stats data raises validation error."""
        now = datetime.now()
        user_data = {
            "id": 2,
            "username": "testuser",
            "full_name": "Test User"
        }
        data = {
            "id": 1,
            "user_id": 2,
            "post_id": 3,
            "content": "Test comment",
            "created_at": now,
            "updated_at": now,
            "user": user_data
        }
        # CommentDetailSchema requires stats field
        with pytest.raises(ValidationError) as exc_info:
            CommentDetailSchema(**data)
        assert "stats" in str(exc_info.value) 