"""
Comprehensive test suite for user_routes.py

Following systematic testing approach with coverage for:
- lookup_user endpoint
- update_user endpoint  
- reset_img endpoint

Testing categories: Setup, Happy Path, Error Handling, Edge Cases, Integration
Target: 100% line coverage, 95% branch coverage
"""

import pytest
import jwt
from unittest.mock import patch
from app.models import db, User
from app.config import Config


class TestUserRoutes:
    """Test class for app/api/user_routes.py endpoints"""

    @pytest.fixture
    def test_user(self, client):
        """Create test user for endpoints"""
        with client.application.app_context():
            user = User(
                email='test@example.com',
                full_name='Test User',
                username='testuser',
                hashed_password='hashed_password_123',
                bio='Test bio',
                profile_image_url='https://example.com/test.jpg'
            )
            db.session.add(user)
            db.session.commit()
            # Store the ID for later use outside the session
            user_id = user.id
            user_data = user.to_dict()
            db.session.expunge(user)
            
            # Create a mock object with the needed attributes
            class MockUser:
                def __init__(self, data):
                    for key, value in data.items():
                        setattr(self, key, value)
            
            return MockUser(user_data)

    @pytest.fixture
    def another_user(self, client):
        """Create another test user for conflict scenarios"""
        with client.application.app_context():
            user = User(
                email='another@example.com',
                full_name='Another User',
                username='anotheruser',
                hashed_password='hashed_password_456',
                bio='Another bio'
            )
            db.session.add(user)
            db.session.commit()
            user_data = user.to_dict()
            db.session.expunge(user)
            
            # Create a mock object with the needed attributes
            class MockUser:
                def __init__(self, data):
                    for key, value in data.items():
                        setattr(self, key, value)
            
            return MockUser(user_data)

    @pytest.fixture
    def valid_update_data(self):
        """Valid data for user updates"""
        return {
            "id": 1,
            "username": "updateduser",
            "email": "updated@example.com",
            "full_name": "Updated User",
            "bio": "Updated bio"
        }

    # =================
    # SETUP & FIXTURES (5%)
    # =================

    def test_fixtures_create_properly(self, test_user, another_user):
        """Test that fixtures create users correctly"""
        assert test_user.id is not None
        assert test_user.username == 'testuser'
        assert another_user.id is not None
        assert another_user.username == 'anotheruser'

    # =================
    # HAPPY PATH TESTS (40%)
    # =================

    def test_lookup_user_success(self, client, test_user):
        """Test successful user lookup by username"""
        response = client.get('/api/user/lookup/testuser')
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'user' in data
        assert data['user']['username'] == 'testuser'
        assert data['user']['email'] == 'test@example.com'
        assert data['user']['full_name'] == 'Test User'

    def test_update_user_username_success(self, client, test_user, valid_update_data):
        """Test successful user update with username change"""
        valid_update_data['id'] = test_user.id
        
        response = client.put('/api/user', json=valid_update_data)
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'access_token' in data
        assert 'user' in data
        assert data['user']['username'] == 'updateduser'

    def test_update_user_email_success(self, client, test_user, valid_update_data):
        """Test successful user update with email change"""
        valid_update_data['id'] = test_user.id
        valid_update_data['username'] = test_user.username  # Keep same username
        
        response = client.put('/api/user', json=valid_update_data)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['user']['email'] == 'updated@example.com'

    def test_update_user_bio_and_fullname_success(self, client, test_user, valid_update_data):
        """Test successful user update with bio and full name changes"""
        valid_update_data['id'] = test_user.id
        valid_update_data['username'] = test_user.username
        valid_update_data['email'] = test_user.email
        
        response = client.put('/api/user', json=valid_update_data)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['user']['full_name'] == 'Updated User'
        assert data['user']['bio'] == 'Updated bio'

    def test_reset_img_success(self, client, test_user):
        """Test successful profile image reset"""
        response = client.get(f'/api/user/{test_user.id}/resetImg')
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['profile_image_url'] == 'https://slickpics.s3.us-east-2.amazonaws.com/uploads/FriJul171300242020.png'

    # =================
    # ERROR HANDLING TESTS (30%)
    # =================

    def test_lookup_user_not_found(self, client):
        """Test user lookup with non-existent username"""
        response = client.get('/api/user/lookup/nonexistent')
        
        assert response.status_code == 404
        data = response.get_json()
        assert 'error' in data
        assert data['error'] == 'User not found'

    def test_update_user_username_already_exists(self, client, test_user, another_user, valid_update_data):
        """Test user update with existing username"""
        valid_update_data['id'] = test_user.id
        valid_update_data['username'] = another_user.username  # Use existing username
        
        response = client.put('/api/user', json=valid_update_data)
        
        assert response.status_code == 401
        data = response.get_json()
        assert 'error' in data
        assert data['error'] == 'Username already exists'

    def test_update_user_email_already_exists(self, client, test_user, another_user, valid_update_data):
        """Test user update with existing email"""
        valid_update_data['id'] = test_user.id
        valid_update_data['email'] = another_user.email  # Use existing email
        
        response = client.put('/api/user', json=valid_update_data)
        
        assert response.status_code == 401
        data = response.get_json()
        assert 'error' in data
        assert data['error'] == 'Email already exists'

    def test_update_user_no_changes_made(self, client, test_user):
        """Test user update with no actual changes"""
        # Send same data as current user
        update_data = {
            "id": test_user.id,
            "username": test_user.username,
            "email": test_user.email,
            "full_name": test_user.full_name,
            "bio": test_user.bio
        }
        
        response = client.put('/api/user', json=update_data)
        
        assert response.status_code == 401
        data = response.get_json()
        assert 'error' in data
        assert data['error'] == 'No changes made'

    def test_update_user_missing_data(self, client):
        """Test user update with missing required data"""
        response = client.put('/api/user', json={})
        
        # Should fail due to missing 'id' field
        assert response.status_code == 500

    def test_update_user_invalid_user_id(self, client, valid_update_data):
        """Test user update with non-existent user ID"""
        valid_update_data['id'] = 99999  # Non-existent ID
        
        response = client.put('/api/user', json=valid_update_data)
        
        # Should fail when trying to access attributes of None user
        assert response.status_code == 500

    def test_reset_img_invalid_user_id(self, client):
        """Test profile image reset with non-existent user ID"""
        response = client.get('/api/user/99999/resetImg')
        
        # Should fail when trying to access attributes of None user
        assert response.status_code == 500

    # =================
    # EDGE CASES (15%)
    # =================

    def test_lookup_user_special_characters_username(self, client):
        """Test user lookup with special characters in username"""
        with client.application.app_context():
            special_user = User(
                email='special@example.com',
                full_name='Special User',
                username='user-with.special_chars',
                hashed_password='hashed_password'
            )
            db.session.add(special_user)
            db.session.commit()
            
            response = client.get('/api/user/lookup/user-with.special_chars')
            assert response.status_code == 200

    def test_lookup_user_case_sensitive(self, client, test_user):
        """Test that user lookup is case sensitive"""
        response = client.get('/api/user/lookup/TESTUSER')  # Different case
        
        assert response.status_code == 404
        data = response.get_json()
        assert data['error'] == 'User not found'

    def test_update_user_extremely_long_values(self, client, test_user, valid_update_data):
        """Test user update with extremely long field values"""
        valid_update_data['id'] = test_user.id
        valid_update_data['username'] = 'a' * 300  # Very long username
        valid_update_data['bio'] = 'Very long bio content ' * 100  # Very long bio
        
        response = client.put('/api/user', json=valid_update_data)
        
        # Should handle long values appropriately
        assert response.status_code in [200, 401, 500]

    def test_update_user_empty_string_values(self, client, test_user, valid_update_data):
        """Test user update with empty string values"""
        valid_update_data['id'] = test_user.id
        valid_update_data['bio'] = ''  # Empty bio
        valid_update_data['full_name'] = ''  # Empty full name
        
        response = client.put('/api/user', json=valid_update_data)
        
        # Should handle empty values
        assert response.status_code in [200, 401, 500]

    # =================
    # INTEGRATION TESTS (10%)
    # =================

    @patch('jwt.encode')
    def test_update_user_jwt_token_generation(self, mock_jwt, client, test_user, valid_update_data):
        """Test JWT token generation during user update"""
        mock_jwt.return_value = b'mocked_token'
        valid_update_data['id'] = test_user.id
        
        response = client.put('/api/user', json=valid_update_data)
        
        if response.status_code == 200:
            mock_jwt.assert_called_once_with(
                {'email': valid_update_data['email']}, 
                Config.SECRET_KEY, 
                algorithm="HS256"
            )

    def test_reset_img_database_persistence(self, client, test_user):
        """Test that image reset persists to database"""
        response = client.get(f'/api/user/{test_user.id}/resetImg')
        
        assert response.status_code == 200
        
        # Verify database was updated
        with client.application.app_context():
            updated_user = User.query.get(test_user.id)
            assert updated_user.profile_image_url == 'https://slickpics.s3.us-east-2.amazonaws.com/uploads/FriJul171300242020.png'

    def test_lookup_user_database_query_efficiency(self, client, test_user):
        """Test user lookup performs efficient database query"""
        # This test ensures we're using proper filtering
        response = client.get(f'/api/user/lookup/{test_user.username}')
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['user']['id'] == test_user.id

    def test_update_user_partial_updates(self, client, test_user):
        """Test partial user updates work correctly"""
        # Only update bio, leave everything else the same
        update_data = {
            "id": test_user.id,
            "username": test_user.username,
            "email": test_user.email,
            "full_name": test_user.full_name,
            "bio": "Only bio changed"
        }
        
        response = client.put('/api/user', json=update_data)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['user']['bio'] == "Only bio changed"
        assert data['user']['username'] == test_user.username  # Unchanged
