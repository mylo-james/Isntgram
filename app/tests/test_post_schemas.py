"""
Test suite for post schemas
Tests Pydantic validation rules and edge cases
"""
import pytest
from datetime import datetime
from pydantic import ValidationError
from app.schemas.post_schemas import (
    PostBaseSchema,
    PostCreateSchema,
    PostUpdateSchema,
    PostResponseSchema,
    PostWithUserSchema,
    PostStatsSchema,
    PostDetailSchema
)
from app.schemas.user_schemas import UserPublicSchema


class TestPostBaseSchema:
    """Test PostBaseSchema validation."""

    def test_valid_post_base_data(self):
        """Test valid post base data passes validation."""
        data = {
            "image_url": "https://example.com/image.jpg",
            "caption": "Test post caption"
        }
        schema = PostBaseSchema(**data)
        assert schema.image_url == "https://example.com/image.jpg"
        assert schema.caption == "Test post caption"

    def test_post_base_without_caption(self):
        """Test post base data without caption."""
        data = {
            "image_url": "https://example.com/image.jpg"
        }
        schema = PostBaseSchema(**data)
        assert schema.caption is None

    def test_image_url_validation(self):
        """Test image URL validation."""
        # Test valid URLs (just string length validation, not URL format)
        valid_urls = [
            "https://example.com/image.jpg",
            "http://example.com/image.png",
            "https://example.com/path/to/image.gif",
            "not-a-url-but-valid-string",  # Just a string, not validated as URL
            "a" * 2000  # Max length
        ]
        for url in valid_urls:
            data = {"image_url": url}
            schema = PostBaseSchema(**data)
            assert schema.image_url == url

        # Test invalid URLs (only length validation)
        invalid_urls = [
            "a" * 2001  # Too long (2001 characters)
        ]
        for url in invalid_urls:
            data = {"image_url": url}
            with pytest.raises(ValidationError) as exc_info:
                PostBaseSchema(**data)
            assert "image_url" in str(exc_info.value)

    def test_caption_validation(self):
        """Test caption validation."""
        # Test valid captions
        valid_captions = [None, "", "Short caption", "A" * 2000]
        for caption in valid_captions:
            data = {
                "image_url": "https://example.com/image.jpg",
                "caption": caption
            }
            schema = PostBaseSchema(**data)
            assert schema.caption == caption

        # Test invalid caption
        data = {
            "image_url": "https://example.com/image.jpg",
            "caption": "A" * 2001
        }
        with pytest.raises(ValidationError) as exc_info:
            PostBaseSchema(**data)
        assert "caption" in str(exc_info.value)

    def test_whitespace_stripping(self):
        """Test that whitespace is stripped from fields."""
        data = {
            "image_url": "  https://example.com/image.jpg  ",
            "caption": "  Test caption  "
        }
        schema = PostBaseSchema(**data)
        assert schema.image_url == "https://example.com/image.jpg"
        assert schema.caption == "Test caption"


class TestPostCreateSchema:
    """Test PostCreateSchema validation."""

    def test_valid_post_create_data(self):
        """Test valid post create data passes validation."""
        data = {
            "image_url": "https://example.com/image.jpg",
            "caption": "Test post caption"
        }
        schema = PostCreateSchema(**data)
        assert schema.image_url == "https://example.com/image.jpg"
        assert schema.caption == "Test post caption"

    def test_post_create_inherits_base_validation(self):
        """Test that PostCreateSchema inherits base validation rules."""
        # Test invalid image URL (length validation)
        data = {
            "image_url": "a" * 2001,  # Too long
            "caption": "Test caption"
        }
        with pytest.raises(ValidationError) as exc_info:
            PostCreateSchema(**data)
        assert "image_url" in str(exc_info.value)

        # Test invalid caption
        data = {
            "image_url": "https://example.com/image.jpg",
            "caption": "A" * 2001
        }
        with pytest.raises(ValidationError) as exc_info:
            PostCreateSchema(**data)
        assert "caption" in str(exc_info.value)


class TestPostUpdateSchema:
    """Test PostUpdateSchema validation."""

    def test_valid_post_update_data(self):
        """Test valid post update data passes validation."""
        data = {
            "caption": "Updated caption"
        }
        schema = PostUpdateSchema(**data)
        assert schema.caption == "Updated caption"

    def test_post_update_without_caption(self):
        """Test post update without caption."""
        schema = PostUpdateSchema()
        assert schema.caption is None

    def test_caption_validation_in_update(self):
        """Test caption validation in update."""
        # Test valid captions
        valid_captions = [None, "", "Short caption", "A" * 2000]
        for caption in valid_captions:
            data = {"caption": caption}
            schema = PostUpdateSchema(**data)
            assert schema.caption == caption

        # Test invalid caption
        data = {"caption": "A" * 2001}
        with pytest.raises(ValidationError) as exc_info:
            PostUpdateSchema(**data)
        assert "caption" in str(exc_info.value)

    def test_whitespace_stripping_in_update(self):
        """Test that whitespace is stripped in update."""
        data = {"caption": "  Updated caption  "}
        schema = PostUpdateSchema(**data)
        assert schema.caption == "Updated caption"


class TestPostResponseSchema:
    """Test PostResponseSchema validation."""

    def test_valid_post_response_data(self):
        """Test valid post response data passes validation."""
        now = datetime.now()
        data = {
            "id": 1,
            "user_id": 2,
            "image_url": "https://example.com/image.jpg",
            "caption": "Test caption",
            "created_at": now,
            "updated_at": now
        }
        schema = PostResponseSchema(**data)
        assert schema.id == 1
        assert schema.user_id == 2
        assert schema.image_url == "https://example.com/image.jpg"
        assert schema.caption == "Test caption"
        assert schema.created_at == now
        assert schema.updated_at == now

    def test_post_response_without_caption(self):
        """Test post response without caption."""
        now = datetime.now()
        data = {
            "id": 1,
            "user_id": 2,
            "image_url": "https://example.com/image.jpg",
            "created_at": now,
            "updated_at": now
        }
        schema = PostResponseSchema(**data)
        assert schema.caption is None

    def test_missing_required_fields(self):
        """Test missing required fields raises validation error."""
        with pytest.raises(ValidationError) as exc_info:
            PostResponseSchema(image_url="https://example.com/image.jpg")
        assert "id" in str(exc_info.value)

        with pytest.raises(ValidationError) as exc_info:
            PostResponseSchema(id=1, image_url="https://example.com/image.jpg")
        assert "user_id" in str(exc_info.value)


class TestPostStatsSchema:
    """Test PostStatsSchema validation."""

    def test_valid_post_stats_data(self):
        """Test valid post stats data passes validation."""
        data = {
            "likes_count": 10,
            "comments_count": 5
        }
        schema = PostStatsSchema(**data)
        assert schema.likes_count == 10
        assert schema.comments_count == 5

    def test_post_stats_with_defaults(self):
        """Test post stats with default values."""
        schema = PostStatsSchema()
        assert schema.likes_count == 0
        assert schema.comments_count == 0

    def test_post_stats_partial_data(self):
        """Test post stats with partial data."""
        data = {"likes_count": 5}
        schema = PostStatsSchema(**data)
        assert schema.likes_count == 5
        assert schema.comments_count == 0


class TestPostWithUserSchema:
    """Test PostWithUserSchema validation."""

    def test_valid_post_with_user_data(self):
        """Test valid post with user data passes validation."""
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
            "image_url": "https://example.com/image.jpg",
            "caption": "Test caption",
            "created_at": now,
            "updated_at": now,
            "user": user_data
        }
        schema = PostWithUserSchema(**data)
        assert schema.id == 1
        assert schema.user_id == 2
        assert schema.image_url == "https://example.com/image.jpg"
        assert schema.caption == "Test caption"
        assert schema.user.id == 2
        assert schema.user.username == "testuser"
        assert schema.user.full_name == "Test User"
        assert schema.user.profile_image_url == "https://example.com/profile.jpg"

    def test_post_with_user_without_profile_image(self):
        """Test post with user without profile image."""
        now = datetime.now()
        user_data = {
            "id": 2,
            "username": "testuser",
            "full_name": "Test User"
        }
        data = {
            "id": 1,
            "user_id": 2,
            "image_url": "https://example.com/image.jpg",
            "created_at": now,
            "updated_at": now,
            "user": user_data
        }
        schema = PostWithUserSchema(**data)
        assert schema.user.profile_image_url is None

    def test_missing_user_data(self):
        """Test missing user data raises validation error."""
        now = datetime.now()
        data = {
            "id": 1,
            "user_id": 2,
            "image_url": "https://example.com/image.jpg",
            "created_at": now,
            "updated_at": now
        }
        with pytest.raises(ValidationError) as exc_info:
            PostWithUserSchema(**data)
        assert "user" in str(exc_info.value)


class TestPostDetailSchema:
    """Test PostDetailSchema validation."""

    def test_valid_post_detail_data(self):
        """Test valid post detail data passes validation."""
        now = datetime.now()
        user_data = {
            "id": 2,
            "username": "testuser",
            "full_name": "Test User"
        }
        stats_data = {
            "likes_count": 10,
            "comments_count": 5
        }
        data = {
            "id": 1,
            "user_id": 2,
            "image_url": "https://example.com/image.jpg",
            "caption": "Test caption",
            "created_at": now,
            "updated_at": now,
            "user": user_data,
            "stats": stats_data
        }
        schema = PostDetailSchema(**data)
        assert schema.id == 1
        assert schema.user_id == 2
        assert schema.image_url == "https://example.com/image.jpg"
        assert schema.caption == "Test caption"
        assert schema.user.id == 2
        assert schema.user.username == "testuser"
        assert schema.stats.likes_count == 10
        assert schema.stats.comments_count == 5

    def test_post_detail_with_default_stats(self):
        """Test post detail with default stats."""
        now = datetime.now()
        user_data = {
            "id": 2,
            "username": "testuser",
            "full_name": "Test User"
        }
        stats_data = {
            "likes_count": 0,
            "comments_count": 0
        }
        data = {
            "id": 1,
            "user_id": 2,
            "image_url": "https://example.com/image.jpg",
            "created_at": now,
            "updated_at": now,
            "user": user_data,
            "stats": stats_data
        }
        schema = PostDetailSchema(**data)
        assert schema.stats.likes_count == 0
        assert schema.stats.comments_count == 0

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
            "image_url": "https://example.com/image.jpg",
            "created_at": now,
            "updated_at": now,
            "user": user_data
        }
        # PostDetailSchema requires stats field
        with pytest.raises(ValidationError) as exc_info:
            PostDetailSchema(**data)
        assert "stats" in str(exc_info.value) 