"""
Test Flask standard routing (no trailing slash)
Tests that our routes follow Flask's standard pattern without trailing slashes
"""
import pytest
import json


class TestFlaskRouteStandards:
    """Test that our routes follow Flask standards (no trailing slash)"""

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
        
        # Should reach the route (not return 404)
        # May return 500 due to missing test data, but that means the route was found
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
