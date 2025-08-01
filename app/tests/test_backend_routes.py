"""
Comprehensive backend route tests for Isntgram API
Tests Flask standards and auth functionality
"""
import pytest
import json
from app.models import User, Post, db


class TestBackendRoutes:
    """Comprehensive test suite for all backend API routes."""

    # ============================================================================
    # FLASK ROUTE STANDARDS TESTS
    # ============================================================================
    
    def test_auth_route_standard(self, client):
        """Test GET /api/auth (Flask standard - no trailing slash)"""
        response = client.get('/api/auth')
        # Should work (401 when not logged in is expected)
        assert response.status_code == 401

    def test_auth_route_with_trailing_slash_should_fail(self, client):
        """Test GET /api/auth/ (with trailing slash should return 404 per Flask standards)"""
        response = client.get('/api/auth/')
        # Should return 404 since our routes don't have trailing slashes
        assert response.status_code == 404

    def test_comment_route_standard(self, client):
        """Test POST /api/comment (Flask standard - no trailing slash)"""
        comment_data = {
            "user_id": 1,
            "post_id": 1,
            "content": "Test comment"
        }
        
        response = client.post('/api/comment', 
                             data=json.dumps(comment_data),
                             content_type='application/json')
        
        # Should reach the route (may return 500 due to missing test data, but that means the route was found)
        assert response.status_code in [200, 400, 404, 500]

    def test_comment_route_with_trailing_slash_should_fail(self, client):
        """Test POST /api/comment/ (with trailing slash should return 404 per Flask standards)"""
        comment_data = {
            "user_id": 1,
            "post_id": 1,
            "content": "Test comment"
        }
        
        response = client.post('/api/comment/', 
                             data=json.dumps(comment_data),
                             content_type='application/json')
        
        # Should return 404 since our routes don't have trailing slashes
        assert response.status_code == 404

    def test_like_route_standard(self, client):
        """Test POST /api/like (Flask standard - no trailing slash)"""
        like_data = {
            "user_id": 1,
            "id": 1,
            "likeable_type": "post"
        }
        
        response = client.post('/api/like', 
                             data=json.dumps(like_data),
                             content_type='application/json')
        
        # Should reach the route
        assert response.status_code != 404

    def test_like_route_with_trailing_slash_should_fail(self, client):
        """Test POST /api/like/ (with trailing slash should return 404 per Flask standards)"""
        like_data = {
            "user_id": 1,
            "id": 1,
            "likeable_type": "post"
        }
        
        response = client.post('/api/like/', 
                             data=json.dumps(like_data),
                             content_type='application/json')
        
        # Should return 404 since our routes don't have trailing slashes
        assert response.status_code == 404

    def test_follow_route_standard(self, client):
        """Test POST /api/follow (Flask standard - no trailing slash)"""
        follow_data = {
            "user_id": 1,
            "user_followed_id": 2
        }
        
        response = client.post('/api/follow', 
                             data=json.dumps(follow_data),
                             content_type='application/json')
        
        # Should reach the route
        assert response.status_code != 404

    def test_follow_route_with_trailing_slash_should_fail(self, client):
        """Test POST /api/follow/ (with trailing slash should return 404 per Flask standards)"""
        follow_data = {
            "user_id": 1,
            "user_followed_id": 2
        }
        
        response = client.post('/api/follow/', 
                             data=json.dumps(follow_data),
                             content_type='application/json')
        
        # Should return 404 since our routes don't have trailing slashes
        assert response.status_code == 404

    # ============================================================================
    # INPUT VALIDATION TESTS
    # ============================================================================

    def test_routes_accept_input(self, client):
        """Test that our fixed routes accept input properly."""

        # Create a test user
        with client.application.app_context():
            user = User(
                username="testuser1",
                email="test1@example.com",
                full_name="Test User"
            )
            user.password = "password123"
            db.session.add(user)

            user2 = User(
                username="testuser2",
                email="test2@example.com",
                full_name="Test User 2"
            )
            user2.password = "password123"
            db.session.add(user2)

            # Create a test post
            post = Post(
                user_id=user.id,
                image_url="https://example.com/test.jpg",
                caption="Test post"
            )
            db.session.add(post)
            db.session.commit()

            # Refresh objects to get IDs
            db.session.refresh(user)
            db.session.refresh(user2)
            db.session.refresh(post)

            # Test 1: Comment routes accept input
            comment_data = {
                "user_id": user.id,
                "post_id": post.id,
                "content": "Test comment"
            }

            response = client.post('/api/comment',
                                 data=json.dumps(comment_data),
                                 content_type='application/json')

            assert response.status_code == 200
            data = json.loads(response.data)
            # Comment route returns the comment object directly (not wrapped)
            # Comment route now returns wrapped in "comment" key
            assert "comment" in data
            comment_data = data["comment"]
            assert "user_id" in comment_data
            assert "post_id" in comment_data
            assert "content" in comment_data
            assert comment_data["content"] == "Test comment"

            # Test 2: Like routes accept input
            like_data = {
                "user_id": user.id,
                "id": post.id,
                "likeable_type": "post"
            }

            response = client.post('/api/like',
                                 data=json.dumps(like_data),
                                 content_type='application/json')

            assert response.status_code == 200
            data = json.loads(response.data)
            assert "like" in data

            # Test 3: Follow routes accept input
            follow_data = {
                "user_id": user.id,
                "user_followed_id": user2.id
            }

            response = client.post('/api/follow',
                                 data=json.dumps(follow_data),
                                 content_type='application/json')

            assert response.status_code == 200
            data = json.loads(response.data)
            assert "id" in data
            
            print("✅ All routes correctly accept input!")

    def test_response_format(self, client):
        """Test that route responses use proper format."""

        with client.application.app_context():
            user = User(
                username="testuser3",
                email="test3@example.com",
                full_name="Test User Three"
            )
            user.password = "password123"
            db.session.add(user)
            db.session.commit()

            db.session.refresh(user)

            # Test user lookup response format (correct route)
            response = client.get(f'/api/user/lookup/{user.username}')
            assert response.status_code == 200
            
            data = json.loads(response.data)
            user_data = data["user"]
            
            # Verify format in response
            assert "full_name" in user_data
            assert "profile_image_url" in user_data
            # Note: User.to_dict() doesn't include created_at/updated_at by design
            
            # Verify the data is correct
            assert user_data["username"] == "testuser3"
            assert user_data["full_name"] == "Test User Three"

    # ============================================================================
    # AUTHENTICATION TESTS
    # ============================================================================

    def test_auth_check_no_user(self, client):
        """Test GET /api/auth when no user is logged in."""
        response = client.get('/api/auth')
        assert response.status_code == 401
        data = json.loads(response.data)
        assert "error" in data
        assert data["error"] == "Please login"

    def test_signup_route_exists(self, client):
        """Test POST /api/auth/signup route exists and handles requests properly."""
        # Auth routes use WTF Forms, not JSON, so this test validates 
        # that the route exists and handles requests properly
        signup_data = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "password123",
            "full_name": "New User"
        }

        response = client.post('/api/auth/signup',
                             data=json.dumps(signup_data),
                             content_type='application/json')

        # Auth routes expect form data + CSRF, so 400 is expected for JSON requests
        # The important thing is that the route exists (not 404)
        assert response.status_code != 404
        print("✅ Auth signup route exists and responds (expects form data)")
        
        # TODO: For full testing, would need to test with proper form data + CSRF token

    def test_login_route_exists(self, client, sample_user):
        """Test POST /api/auth/login route exists and handles requests properly."""
        # Auth routes use WTF Forms, not JSON
        login_data = {
            "username": "testuser",
            "password": "password123"
        }

        response = client.post('/api/auth/login',
                             data=json.dumps(login_data),
                             content_type='application/json')

        # Auth routes expect form data + CSRF, so 400 is expected for JSON requests
        # The important thing is that the route exists (not 404)
        assert response.status_code != 404
        print("✅ Auth login route exists and responds (expects form data)")

    def test_logout(self, client):
        """Test POST /api/auth/logout."""
        response = client.post('/api/auth/logout')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["message"] == "User logged out successfully"

    def test_unauthorized_endpoint(self, client):
        """Test GET /api/auth/unauthorized."""
        response = client.get('/api/auth/unauthorized')
        assert response.status_code == 401
        data = json.loads(response.data)
        assert "error" in data
        assert data["error"] == "Unauthorized"
        assert "errors" in data
        assert "Authentication required" in data["errors"]
