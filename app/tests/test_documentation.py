"""
Test suite for API documentation utilities
Tests OpenAPI/Swagger documentation generation
"""
import pytest
import json
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime
from app.utils.documentation import (
    APIDocumentationManager,
    api_doc,
    auth_doc,
    post_doc,
    user_doc,
    paginated_doc,
    file_upload_doc
)


class TestAPIDocumentationManager:
    """Test APIDocumentationManager class."""

    def test_documentation_manager_initialization(self):
        """Test APIDocumentationManager initialization."""
        manager = APIDocumentationManager()
        assert manager.app is None
        assert manager.specs == {}
        assert manager.base_spec == {
            'openapi': '3.0.0',
            'info': {
                'title': 'Isntgram API',
                'version': '1.0.0',
                'description': 'Instagram clone API documentation'
            },
            'paths': {},
            'components': {
                'securitySchemes': {
                    'bearerAuth': {
                        'type': 'http',
                        'scheme': 'bearer',
                        'bearerFormat': 'JWT'
                    }
                }
            }
        }

    def test_init_app_success(self):
        """Test successful app initialization."""
        app = Mock()
        app.config = {
            'API_TITLE': 'Test API',
            'API_VERSION': '2.0.0',
            'API_DESCRIPTION': 'Test API documentation'
        }
        app.extensions = {}
        
        manager = APIDocumentationManager()
        manager.init_app(app)
        
        assert manager.app == app
        assert app.extensions['api_documentation'] == manager
        assert manager.base_spec['info']['title'] == 'Test API'
        assert manager.base_spec['info']['version'] == '2.0.0'

    def test_register_spec(self):
        """Test registering API specification."""
        manager = APIDocumentationManager()
        
        spec = {
            'summary': 'Test endpoint',
            'description': 'Test endpoint description',
            'responses': {
                '200': {'description': 'Success'}
            }
        }
        
        manager.register_spec('/api/test', spec)
        
        assert '/api/test' in manager.specs
        assert manager.specs['/api/test'] == spec

    def test_get_spec(self):
        """Test getting API specification."""
        manager = APIDocumentationManager()
        
        spec = {
            'summary': 'Test endpoint',
            'description': 'Test endpoint description'
        }
        
        manager.register_spec('/api/test', spec)
        
        retrieved_spec = manager.get_spec('/api/test')
        assert retrieved_spec == spec

    def test_get_spec_not_found(self):
        """Test getting non-existent specification."""
        manager = APIDocumentationManager()
        
        spec = manager.get_spec('/api/nonexistent')
        assert spec is None

    def test_generate_openapi_spec(self):
        """Test generating OpenAPI specification."""
        manager = APIDocumentationManager()
        
        # Register some specs
        auth_spec = {
            'summary': 'User authentication',
            'description': 'Login and registration endpoints',
            'responses': {
                '200': {'description': 'Success'},
                '401': {'description': 'Unauthorized'}
            }
        }
        
        post_spec = {
            'summary': 'Post management',
            'description': 'Create and manage posts',
            'responses': {
                '200': {'description': 'Success'},
                '400': {'description': 'Bad request'}
            }
        }
        
        manager.register_spec('/api/auth/login', auth_spec)
        manager.register_spec('/api/posts', post_spec)
        
        openapi_spec = manager.generate_openapi_spec()
        
        assert openapi_spec['openapi'] == '3.0.0'
        assert openapi_spec['info']['title'] == 'Isntgram API'
        assert '/api/auth/login' in openapi_spec['paths']
        assert '/api/posts' in openapi_spec['paths']


class TestAPIDocDecorator:
    """Test api_doc decorator."""

    def test_api_doc_basic(self):
        """Test basic api_doc decorator."""
        spec = {
            'summary': 'Test endpoint',
            'description': 'Test endpoint description',
            'responses': {
                '200': {'description': 'Success'}
            }
        }
        
        @api_doc(spec)
        def test_function():
            return "success"
        
        result = test_function()
        assert result == "success"

    def test_api_doc_with_parameters(self):
        """Test api_doc decorator with parameters."""
        spec = {
            'summary': 'Test endpoint with params',
            'description': 'Test endpoint with parameters',
            'parameters': [
                {
                    'name': 'user_id',
                    'in': 'path',
                    'required': True,
                    'schema': {'type': 'integer'}
                }
            ],
            'responses': {
                '200': {'description': 'Success'},
                '404': {'description': 'Not found'}
            }
        }
        
        @api_doc(spec)
        def test_function(user_id):
            return f"user_{user_id}"
        
        result = test_function(123)
        assert result == "user_123"

    def test_api_doc_with_request_body(self):
        """Test api_doc decorator with request body."""
        spec = {
            'summary': 'Test endpoint with body',
            'description': 'Test endpoint with request body',
            'requestBody': {
                'required': True,
                'content': {
                    'application/json': {
                        'schema': {
                            'type': 'object',
                            'properties': {
                                'username': {'type': 'string'},
                                'email': {'type': 'string'}
                            }
                        }
                    }
                }
            },
            'responses': {
                '201': {'description': 'Created'},
                '400': {'description': 'Bad request'}
            }
        }
        
        @api_doc(spec)
        def test_function(data):
            return f"created_{data['username']}"
        
        result = test_function({'username': 'testuser', 'email': 'test@example.com'})
        assert result == "created_testuser"


class TestAuthDocDecorator:
    """Test auth_doc decorator."""

    def test_auth_doc_basic(self):
        """Test basic auth_doc decorator."""
        @auth_doc('User login', 'Authenticate user with credentials')
        def test_login():
            return "login_success"
        
        result = test_login()
        assert result == "login_success"

    def test_auth_doc_with_parameters(self):
        """Test auth_doc decorator with parameters."""
        @auth_doc('User registration', 'Register new user account')
        def test_register(username, email):
            return f"registered_{username}"
        
        result = test_register('testuser', 'test@example.com')
        assert result == "registered_testuser"

    def test_auth_doc_with_responses(self):
        """Test auth_doc decorator with custom responses."""
        @auth_doc('Password reset', 'Request password reset', responses={
            '200': {'description': 'Reset email sent'},
            '404': {'description': 'User not found'}
        })
        def test_password_reset(email):
            return f"reset_sent_to_{email}"
        
        result = test_password_reset('test@example.com')
        assert result == "reset_sent_to_test@example.com"


class TestPostDocDecorator:
    """Test post_doc decorator."""

    def test_post_doc_basic(self):
        """Test basic post_doc decorator."""
        @post_doc('Create post', 'Create a new post')
        def test_create_post():
            return "post_created"
        
        result = test_create_post()
        assert result == "post_created"

    def test_post_doc_with_auth_required(self):
        """Test post_doc decorator with auth required."""
        @post_doc('Create post', 'Create a new post', requires_auth=True)
        def test_create_post():
            return "post_created"
        
        result = test_create_post()
        assert result == "post_created"

    def test_post_doc_without_auth(self):
        """Test post_doc decorator without auth required."""
        @post_doc('Get public posts', 'Get public posts', requires_auth=False)
        def test_get_public_posts():
            return "public_posts"
        
        result = test_get_public_posts()
        assert result == "public_posts"

    def test_post_doc_with_parameters(self):
        """Test post_doc decorator with parameters."""
        @post_doc('Update post', 'Update existing post')
        def test_update_post(post_id, content):
            return f"updated_post_{post_id}"
        
        result = test_update_post(123, "New content")
        assert result == "updated_post_123"


class TestUserDocDecorator:
    """Test user_doc decorator."""

    def test_user_doc_basic(self):
        """Test basic user_doc decorator."""
        @user_doc('Get user profile', 'Get user profile information')
        def test_get_profile():
            return "user_profile"
        
        result = test_get_profile()
        assert result == "user_profile"

    def test_user_doc_with_auth_required(self):
        """Test user_doc decorator with auth required."""
        @user_doc('Update profile', 'Update user profile', requires_auth=True)
        def test_update_profile():
            return "profile_updated"
        
        result = test_update_profile()
        assert result == "profile_updated"

    def test_user_doc_without_auth(self):
        """Test user_doc decorator without auth required."""
        @user_doc('Get public profile', 'Get public user profile', requires_auth=False)
        def test_get_public_profile():
            return "public_profile"
        
        result = test_get_public_profile()
        assert result == "public_profile"

    def test_user_doc_with_parameters(self):
        """Test user_doc decorator with parameters."""
        @user_doc('Follow user', 'Follow another user')
        def test_follow_user(user_id):
            return f"following_user_{user_id}"
        
        result = test_follow_user(456)
        assert result == "following_user_456"


class TestPaginatedDocDecorator:
    """Test paginated_doc decorator."""

    def test_paginated_doc_basic(self):
        """Test basic paginated_doc decorator."""
        @paginated_doc('Get posts', 'Get paginated list of posts')
        def test_get_posts():
            return "paginated_posts"
        
        result = test_get_posts()
        assert result == "paginated_posts"

    def test_paginated_doc_with_parameters(self):
        """Test paginated_doc decorator with parameters."""
        @paginated_doc('Get user posts', 'Get paginated list of user posts')
        def test_get_user_posts(user_id, page=1, per_page=10):
            return f"user_{user_id}_posts_page_{page}"
        
        result = test_get_user_posts(123, page=2, per_page=20)
        assert result == "user_123_posts_page_2"

    def test_paginated_doc_with_custom_responses(self):
        """Test paginated_doc decorator with custom responses."""
        @paginated_doc('Get comments', 'Get paginated list of comments', responses={
            '200': {'description': 'Comments retrieved'},
            '404': {'description': 'Post not found'}
        })
        def test_get_comments(post_id):
            return f"comments_for_post_{post_id}"
        
        result = test_get_comments(789)
        assert result == "comments_for_post_789"


class TestFileUploadDocDecorator:
    """Test file_upload_doc decorator."""

    def test_file_upload_doc_basic(self):
        """Test basic file_upload_doc decorator."""
        @file_upload_doc('Upload image', 'Upload user profile image')
        def test_upload_image():
            return "image_uploaded"
        
        result = test_upload_image()
        assert result == "image_uploaded"

    def test_file_upload_doc_with_parameters(self):
        """Test file_upload_doc decorator with parameters."""
        @file_upload_doc('Upload post image', 'Upload image for post')
        def test_upload_post_image(post_id):
            return f"post_{post_id}_image_uploaded"
        
        result = test_upload_post_image(123)
        assert result == "post_123_image_uploaded"

    def test_file_upload_doc_with_custom_responses(self):
        """Test file_upload_doc decorator with custom responses."""
        @file_upload_doc('Upload file', 'Upload any file type', responses={
            '200': {'description': 'File uploaded successfully'},
            '400': {'description': 'Invalid file type'},
            '413': {'description': 'File too large'}
        })
        def test_upload_file():
            return "file_uploaded"
        
        result = test_upload_file()
        assert result == "file_uploaded"


class TestDocumentationIntegration:
    """Integration tests for documentation system."""

    def test_documentation_integration_flow(self):
        """Test complete documentation flow."""
        manager = APIDocumentationManager()
        
        # Test auth endpoint documentation
        @auth_doc('User login', 'Authenticate user')
        def login_endpoint():
            return "login_success"
        
        # Test post endpoint documentation
        @post_doc('Create post', 'Create new post')
        def create_post_endpoint():
            return "post_created"
        
        # Test user endpoint documentation
        @user_doc('Get profile', 'Get user profile')
        def get_profile_endpoint():
            return "profile_retrieved"
        
        # Test paginated endpoint documentation
        @paginated_doc('Get posts', 'Get paginated posts')
        def get_posts_endpoint():
            return "posts_retrieved"
        
        # Test file upload endpoint documentation
        @file_upload_doc('Upload image', 'Upload profile image')
        def upload_image_endpoint():
            return "image_uploaded"
        
        # Verify all functions work
        assert login_endpoint() == "login_success"
        assert create_post_endpoint() == "post_created"
        assert get_profile_endpoint() == "profile_retrieved"
        assert get_posts_endpoint() == "posts_retrieved"
        assert upload_image_endpoint() == "image_uploaded"

    def test_documentation_spec_generation(self):
        """Test OpenAPI specification generation."""
        manager = APIDocumentationManager()
        
        # Register specs manually
        auth_spec = {
            'summary': 'User authentication',
            'description': 'Login and registration',
            'responses': {'200': {'description': 'Success'}}
        }
        
        post_spec = {
            'summary': 'Post management',
            'description': 'Create and manage posts',
            'responses': {'201': {'description': 'Created'}}
        }
        
        manager.register_spec('/api/auth/login', auth_spec)
        manager.register_spec('/api/posts', post_spec)
        
        # Generate OpenAPI spec
        openapi_spec = manager.generate_openapi_spec()
        
        # Verify structure
        assert 'openapi' in openapi_spec
        assert 'info' in openapi_spec
        assert 'paths' in openapi_spec
        assert 'components' in openapi_spec
        
        # Verify paths
        assert '/api/auth/login' in openapi_spec['paths']
        assert '/api/posts' in openapi_spec['paths']
        
        # Verify security schemes
        assert 'securitySchemes' in openapi_spec['components']
        assert 'bearerAuth' in openapi_spec['components']['securitySchemes'] 