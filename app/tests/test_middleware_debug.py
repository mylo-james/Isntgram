"""
Debug middleware behavior
"""
import pytest
import json


class TestMiddlewareDebug:
    """Debug our middleware to understand what's happening"""

    def test_debug_middleware_behavior(self, client):
        """Test middleware behavior with debug output"""
        
        # Test without trailing slash (should work)
        print("\n=== Testing /api/like (no trailing slash) ===")
        response1 = client.post('/api/like', 
                               data=json.dumps({"user_id": 1, "id": 1, "likeable_type": "post"}),
                               content_type='application/json')
        print(f"Status: {response1.status_code}")
        print(f"Data: {response1.get_data(as_text=True)}")
        
        # Test with trailing slash (should be processed by middleware)
        print("\n=== Testing /api/like/ (with trailing slash) ===")
        response2 = client.post('/api/like/', 
                               data=json.dumps({"user_id": 1, "id": 1, "likeable_type": "post"}),
                               content_type='application/json')
        print(f"Status: {response2.status_code}")
        print(f"Data: {response2.get_data(as_text=True)}")
        
        # List available routes to understand routing
        print("\n=== Available Routes ===")
        with client.application.app_context():
            for rule in client.application.url_map.iter_rules():
                print(f"{rule.methods} {rule.rule} -> {rule.endpoint}")
        
        # The actual test - at least one should work
        assert response1.status_code != 404 or response2.status_code != 404
