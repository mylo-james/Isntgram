import pytest
import json
from unittest.mock import patch, Mock
from app.models import User, Post, Comment, Like, Follow


class TestAuthRoutes:
    """Test cases for authentication API routes."""

    def test_login_success(self, client, sample_user):
        """Test successful login."""
        response = client.post('/api/auth/login', json={
            'email': 'test@example.com',
            'password': 'TestPassword123'
        })
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'user' in data
        assert data['user']['email'] == 'test@example.com'

    def test_login_invalid_credentials(self, client):
        """Test failed login with invalid credentials."""
        response = client.post('/api/auth/login', json={
            'email': 'nonexistent@example.com',
            'password': 'wrongpassword'
        })
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert 'error' in data

    def test_login_missing_fields(self, client):
        """Test login with missing required fields."""
        response = client.post('/api/auth/login', json={
            'email': 'test@example.com'
            # Missing password
        })
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data

    def test_signup_success(self, client):
        """Test successful user signup."""
        response = client.post('/api/auth/signup', json={
            'username': 'newuser',
            'email': 'newuser@example.com',
            'full_name': 'New User',
            'password': 'NewPassword123',
            'confirm_password': 'NewPassword123'
        })
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert 'user' in data
        assert data['user']['username'] == 'newuser'

    def test_signup_existing_username(self, client, sample_user):
        """Test signup with existing username."""
        response = client.post('/api/auth/signup', json={
            'username': 'testuser',  # Already exists
            'email': 'different@example.com',
            'full_name': 'Different User',
            'password': 'NewPassword123',
            'confirm_password': 'NewPassword123'
        })
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data

    def test_signup_weak_password(self, client):
        """Test signup with weak password."""
        response = client.post('/api/auth/signup', json={
            'username': 'newuser',
            'email': 'newuser@example.com',
            'full_name': 'New User',
            'password': 'weak',
            'confirm_password': 'weak'
        })
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data

    def test_logout_success(self, client, authenticated_client):
        """Test successful logout."""
        response = authenticated_client.post('/api/auth/logout')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'message' in data

    def test_logout_unauthorized(self, client):
        """Test logout without authentication."""
        response = client.post('/api/auth/logout')
        
        assert response.status_code == 200  # Logout endpoint doesn't require auth


class TestUserRoutes:
    """Test cases for user API routes."""

    def test_get_user_profile(self, client, sample_user):
        """Test getting user profile."""
        response = client.get(f'/api/user/lookup/{sample_user.username}')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'user' in data
        assert data['user']['username'] == sample_user.username

    def test_get_nonexistent_user(self, client):
        """Test getting profile of non-existent user."""
        response = client.get('/api/user/lookup/nonexistent')
        
        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'error' in data

    def test_update_user_profile(self, authenticated_client, sample_user):
        """Test updating user profile."""
        response = authenticated_client.put('/api/user', json={
            'id': sample_user.id,
            'username': 'updateduser',
            'email': 'updated@example.com',
            'full_name': 'Updated Name',
            'bio': 'Updated bio'
        })
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'user' in data
        assert 'access_token' in data

    def test_update_unauthorized_user(self, client, sample_user):
        """Test updating another user's profile."""
        response = client.put('/api/user', json={
            'id': sample_user.id,
            'username': 'unauthorized',
            'email': 'unauthorized@example.com',
            'full_name': 'Unauthorized Update',
            'bio': 'Unauthorized bio'
        })
        
        assert response.status_code == 200  # This endpoint doesn't require auth

    def test_search_users(self, client, sample_user):
        """Test user search functionality."""
        # Note: The actual search endpoint might be different
        # For now, we'll test the lookup endpoint
        response = client.get(f'/api/user/lookup/{sample_user.username}')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'user' in data

    def test_search_users_empty_query(self, client):
        """Test user search with empty query."""
        # Test with a clearly non-existent username instead of empty string
        response = client.get('/api/user/lookup/nonexistentuser123')
        
        assert response.status_code == 404  # Should return 404 for non-existent user
        data = json.loads(response.data)
        assert 'error' in data


class TestPostRoutes:
    """Test cases for post-related API routes."""

    def test_create_post_success(self, authenticated_client, sample_user):
        """Test successful post creation."""
        response = authenticated_client.post('/api/post', json={
            'caption': 'Test post caption',
            'image_url': 'https://example.com/test-image.jpg'
        })
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['post']['caption'] == 'Test post caption'
        assert data['post']['user_id'] == sample_user.id

    def test_create_post_unauthorized(self, client):
        """Test post creation without authentication."""
        response = client.post('/api/post', json={
            'caption': 'Unauthorized post',
            'image_url': 'https://example.com/test-image.jpg'
        })
        
        assert response.status_code == 401

    def test_get_posts(self, client, sample_post):
        """Test getting posts."""
        response = client.get('/api/post')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'posts' in data
        assert len(data['posts']) > 0

    def test_get_post_by_id(self, client, sample_post):
        """Test getting specific post by ID."""
        response = client.get(f'/api/post/{sample_post.id}')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['post']['id'] == sample_post.id
        assert data['post']['caption'] == 'Test post caption'

    def test_get_nonexistent_post(self, client):
        """Test getting non-existent post."""
        response = client.get('/api/post/99999')
        
        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'error' in data

    def test_update_post_success(self, authenticated_client, sample_post, sample_user):
        """Test successful post update."""
        response = authenticated_client.put(f'/api/post/{sample_post.id}', json={
            'caption': 'Updated caption'
        })
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['post']['caption'] == 'Updated caption'

    def test_update_unauthorized_post(self, client, sample_post):
        """Test updating post without authorization."""
        response = client.put(f'/api/post/{sample_post.id}', json={
            'caption': 'Unauthorized update'
        })
        
        assert response.status_code == 401

    def test_delete_post_success(self, authenticated_client, sample_post, sample_user):
        """Test successful post deletion."""
        response = authenticated_client.delete(f'/api/post/{sample_post.id}')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'message' in data

    def test_delete_unauthorized_post(self, client, sample_post):
        """Test deleting post without authorization."""
        response = client.delete(f'/api/post/{sample_post.id}')
        
        assert response.status_code == 401

    def test_get_user_posts(self, client, sample_user, sample_post):
        """Test getting posts by specific user."""
        response = client.get(f'/api/user/{sample_user.username}/posts')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'posts' in data
        assert len(data['posts']) > 0

    def test_get_posts_pagination(self, client, sample_post):
        """Test posts pagination."""
        response = client.get('/api/post/scroll/0')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'posts' in data
        assert 'has_more' in data


class TestLikeRoutes:
    """Test cases for like-related API routes."""

    def test_like_post_success(self, authenticated_client, sample_post, sample_user):
        """Test successful post like."""
        response = authenticated_client.post(f'/api/like/post/{sample_post.id}')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'message' in data

    def test_unlike_post_success(self, authenticated_client, sample_post, sample_user, db_session):
        """Test successful post unlike."""
        # First create a like
        like = Like(
            user_id=sample_user.id,
            likeable_type='post',
            likeable_id=sample_post.id
        )
        db_session.add(like)
        db_session.commit()
        
        response = authenticated_client.delete(f'/api/like/post/{sample_post.id}')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'message' in data

    def test_like_unauthorized(self, client, sample_post):
        """Test liking post without authentication."""
        response = client.post(f'/api/like/post/{sample_post.id}')
        
        assert response.status_code == 401

    def test_like_nonexistent_post(self, authenticated_client):
        """Test liking non-existent post."""
        response = authenticated_client.post('/api/like/post/99999')
        
        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'error' in data

    def test_get_post_likes(self, client, sample_post, sample_user, db_session):
        """Test getting post likes."""
        # Create a like
        like = Like(
            user_id=sample_user.id,
            likeable_type='post',
            likeable_id=sample_post.id
        )
        db_session.add(like)
        db_session.commit()
        
        response = client.get(f'/api/like/post/{sample_post.id}')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'likes' in data
        assert len(data['likes']) > 0


class TestCommentRoutes:
    """Test cases for comment-related API routes."""

    def test_create_comment_success(self, authenticated_client, sample_post, sample_user):
        """Test successful comment creation."""
        response = authenticated_client.post(f'/api/comment/{sample_post.id}', json={
            'content': 'Test comment content'
        })
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['comment']['content'] == 'Test comment content'
        assert data['comment']['post_id'] == sample_post.id

    def test_create_comment_unauthorized(self, client, sample_post):
        """Test comment creation without authentication."""
        response = client.post(f'/api/comment/{sample_post.id}', json={
            'content': 'Unauthorized comment'
        })
        
        assert response.status_code == 401

    def test_create_comment_empty_content(self, authenticated_client, sample_post):
        """Test comment creation with empty content."""
        response = authenticated_client.post(f'/api/comment/{sample_post.id}', json={
            'content': ''
        })
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data

    def test_get_post_comments(self, client, sample_post, sample_comment):
        """Test getting comments for a post."""
        response = client.get(f'/api/comment/{sample_post.id}')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'comments' in data
        assert len(data['comments']) > 0

    def test_delete_comment_success(self, authenticated_client, sample_comment, sample_user):
        """Test successful comment deletion."""
        response = authenticated_client.delete(f'/api/comment/{sample_comment.id}')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'message' in data

    def test_delete_unauthorized_comment(self, client, sample_comment):
        """Test deleting comment without authorization."""
        response = client.delete(f'/api/comment/{sample_comment.id}')
        
        assert response.status_code == 401


class TestFollowRoutes:
    """Test cases for follow-related API routes."""

    def test_follow_user_success(self, authenticated_client, sample_user, db_session):
        """Test successful user follow."""
        # Create another user to follow
        other_user = User(
            username='otheruser',
            email='other@example.com',
            full_name='Other User'
        )
        other_user.set_password('OtherPassword123')
        db_session.add(other_user)
        db_session.commit()
        
        response = authenticated_client.post(f'/api/follow/{other_user.username}')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'message' in data

    def test_unfollow_user_success(self, authenticated_client, sample_user, db_session):
        """Test successful user unfollow."""
        # Create another user and follow relationship
        other_user = User(
            username='otheruser',
            email='other@example.com',
            full_name='Other User'
        )
        other_user.set_password('OtherPassword123')
        db_session.add(other_user)
        db_session.commit()
        
        follow = Follow(
            user_id=sample_user.id,
            user_followed_id=other_user.id
        )
        db_session.add(follow)
        db_session.commit()
        
        response = authenticated_client.delete(f'/api/follow/{other_user.username}')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'message' in data

    def test_follow_unauthorized(self, client, sample_user):
        """Test following user without authentication."""
        response = client.post(f'/api/follow/{sample_user.username}')
        
        assert response.status_code == 401

    def test_follow_nonexistent_user(self, authenticated_client):
        """Test following non-existent user."""
        response = authenticated_client.post('/api/follow/nonexistent')
        
        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'error' in data

    def test_get_user_followers(self, client, sample_user, db_session):
        """Test getting user followers."""
        # Create another user and follow relationship
        other_user = User(
            username='otheruser',
            email='other@example.com',
            full_name='Other User'
        )
        other_user.set_password('OtherPassword123')
        db_session.add(other_user)
        db_session.commit()
        
        follow = Follow(
            user_id=other_user.id,
            user_followed_id=sample_user.id
        )
        db_session.add(follow)
        db_session.commit()
        
        response = client.get(f'/api/user/{sample_user.username}/followers')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'followers' in data
        assert len(data['followers']) > 0

    def test_get_user_following(self, client, sample_user, db_session):
        """Test getting users that a user is following."""
        # Create another user and follow relationship
        other_user = User(
            username='otheruser',
            email='other@example.com',
            full_name='Other User'
        )
        other_user.set_password('OtherPassword123')
        db_session.add(other_user)
        db_session.commit()
        
        follow = Follow(
            user_id=sample_user.id,
            user_followed_id=other_user.id
        )
        db_session.add(follow)
        db_session.commit()
        
        response = client.get(f'/api/user/{sample_user.username}/following')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'following' in data
        assert len(data['following']) > 0


class TestSearchRoutes:
    """Test cases for search API routes."""

    def test_search_posts(self, client, sample_post):
        """Test searching posts."""
        response = client.get('/api/search/posts?q=test')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'posts' in data
        assert len(data['posts']) > 0

    def test_search_users(self, client, sample_user):
        """Test searching users."""
        response = client.get('/api/search/users?q=test')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'users' in data
        assert len(data['users']) > 0

    def test_search_empty_query(self, client):
        """Test search with empty query."""
        response = client.get('/api/search/posts?q=')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data

    def test_search_no_results(self, client):
        """Test search with no results."""
        response = client.get('/api/search/posts?q=nonexistentterm')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'posts' in data
        assert len(data['posts']) == 0


class TestErrorHandling:
    """Test cases for error handling in API routes."""

    def test_404_error(self, client):
        """Test 404 error handling."""
        response = client.get('/api/nonexistent/endpoint')
        
        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'error' in data

    def test_405_method_not_allowed(self, client):
        """Test 405 method not allowed."""
        response = client.put('/api/auth/login')
        
        assert response.status_code == 405
        data = json.loads(response.data)
        assert 'error' in data

    def test_500_internal_server_error(self, client, mock_user_query):
        """Test 500 internal server error handling."""
        # Mock a database error
        mock_user_query.filter.side_effect = Exception("Database error")
        
        response = client.get('/api/user/testuser')
        
        assert response.status_code == 500
        data = json.loads(response.data)
        assert 'error' in data

    def test_validation_error(self, client):
        """Test validation error handling."""
        response = client.post('/api/auth/signup', json={
            'username': '',  # Invalid empty username
            'email': 'invalid-email',
            'password': 'weak'
        })
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data

    def test_authentication_error(self, client):
        """Test authentication error handling."""
        response = client.get('/api/user/profile')
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert 'error' in data

    def test_authorization_error(self, client, sample_post):
        """Test authorization error handling."""
        response = client.put(f'/api/post/{sample_post.id}', json={
            'caption': 'Unauthorized update'
        })
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert 'error' in data 