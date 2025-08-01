"""
Test suite for comment routes
Tests comment functionality
"""
import pytest
import json
from app.models import Comment, db


class TestCommentRoutes:
    """Test comment endpoints for functionality."""

    def test_post_comment(self, authenticated_client, sample_user, sample_post):
        """Test POST /api/comment accepts input."""
        comment_data = {
            "user_id": sample_user.id,
            "post_id": sample_post.id,
            "content": "This is a test comment"
        }
        
        response = authenticated_client.post('/api/comment',
                                           data=json.dumps(comment_data),
                                           content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        
        # Check response format
        assert "comment" in data
        
        # Check comment object format
        comment = data["comment"]
        assert "id" in comment
        assert "user_id" in comment
        assert "post_id" in comment
        assert "content" in comment
        assert "created_at" in comment
        
        # Verify values
        assert comment["user_id"] == sample_user.id
        assert comment["post_id"] == sample_post.id
        assert comment["content"] == "This is a test comment"

    def test_post_comment_creates_database_record(self, authenticated_client, sample_user, sample_post):
        """Test that posting a comment actually creates a database record."""
        comment_data = {
            "user_id": sample_user.id,
            "post_id": sample_post.id,
            "content": "Database test comment"
        }
        
        # Count comments before
        initial_count = Comment.query.count()
        
        response = authenticated_client.post('/api/comment',
                                           data=json.dumps(comment_data),
                                           content_type='application/json')
        
        assert response.status_code == 200
        
        # Verify database record was created
        final_count = Comment.query.count()
        assert final_count == initial_count + 1
        
        # Verify the comment exists in database
        comment = Comment.query.filter_by(
            user_id=sample_user.id,
            post_id=sample_post.id,
            content="Database test comment"
        ).first()
        
        assert comment is not None
        assert comment.user_id == sample_user.id
        assert comment.post_id == sample_post.id

    def test_post_comment_missing_fields(self, authenticated_client, sample_user, sample_post):
        """Test POST /api/comment with missing required fields."""
        # Missing user_id
        comment_data = {
            "post_id": sample_post.id,
            "content": "Missing user_id"
        }
        
        response = authenticated_client.post('/api/comment',
                                           data=json.dumps(comment_data),
                                           content_type='application/json')
        
        # Should fail (exact status code depends on your error handling)
        assert response.status_code != 200
        
        # Missing post_id
        comment_data = {
            "user_id": sample_user.id,
            "content": "Missing post_id"
        }
        
        response = authenticated_client.post('/api/comment',
                                           data=json.dumps(comment_data),
                                           content_type='application/json')
        
        assert response.status_code != 200
        
        # Missing content
        comment_data = {
            "user_id": sample_user.id,
            "post_id": sample_post.id
        }
        
        response = authenticated_client.post('/api/comment',
                                           data=json.dumps(comment_data),
                                           content_type='application/json')
        
        assert response.status_code != 200

    def test_post_comment_invalid_user_id(self, authenticated_client, sample_post):
        """Test POST /api/comment with invalid user_id."""
        comment_data = {
            "user_id": 99999,  # Non-existent user
            "post_id": sample_post.id,
            "content": "Invalid user test"
        }
        
        response = authenticated_client.post('/api/comment',
                                           data=json.dumps(comment_data),
                                           content_type='application/json')
        
        # Should fail due to foreign key constraint
        assert response.status_code != 200

    def test_post_comment_invalid_post_id(self, authenticated_client, sample_user):
        """Test POST /api/comment with invalid post_id."""
        comment_data = {
            "user_id": sample_user.id,
            "post_id": 99999,  # Non-existent post
            "content": "Invalid post test"
        }
        
        response = authenticated_client.post('/api/comment',
                                           data=json.dumps(comment_data),
                                           content_type='application/json')
        
        # Should fail due to foreign key constraint
        assert response.status_code != 200
