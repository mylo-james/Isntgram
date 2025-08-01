import pytest
from app import app
from app.models import User, Post, Comment, Like, Follow
from app.forms.login_form import LoginForm
from app.forms.signup_form import SignUpForm
from app.tests.factories import (
    UserFactory, PostFactory, CommentFactory, LikeFactory, FollowFactory,
    create_test_users, create_test_posts, create_test_comments
)


def test_app_import():
    """Test that the Flask app can be imported."""
    from app import app
    assert app is not None
    assert hasattr(app, 'config')


def test_blueprint_registration():
    """Test that all blueprints are registered."""
    from app import app
    
    # Check that blueprints are registered
    assert len(app.blueprints) > 0
    
    # Check for specific blueprints
    blueprint_names = [bp.name for bp in app.blueprints.values()]
    expected_blueprints = ['session', 'users', 'profile', 'follow', 'like', 'posts', 'note', 'comment', 'query', 'aws']
    
    for blueprint in expected_blueprints:
        assert blueprint in blueprint_names


def test_database_models_import():
    """Test that all database models can be imported."""
    from app.models import User, Post, Comment, Like, Follow
    
    assert User is not None
    assert Post is not None
    assert Comment is not None
    assert Like is not None
    assert Follow is not None


def test_form_imports():
    """Test that all forms can be imported."""
    from app.forms.login_form import LoginForm
    from app.forms.signup_form import SignUpForm
    
    assert LoginForm is not None
    assert SignUpForm is not None


def test_api_routes_import():
    """Test that all API routes can be imported."""
    from app.api import auth_routes, user_routes, post_routes, comment_routes, like_routes, follow_routes
    
    assert auth_routes is not None
    assert user_routes is not None
    assert post_routes is not None
    assert comment_routes is not None
    assert like_routes is not None
    assert follow_routes is not None


def test_utils_import():
    """Test that utility functions can be imported."""
    from app.utils.api_utils import APIError, ValidationAPIError, NotFoundAPIError
    
    assert APIError is not None
    assert ValidationAPIError is not None
    assert NotFoundAPIError is not None


def test_config_import():
    """Test that configuration can be imported."""
    from app.config import Config
    
    assert Config is not None


def test_cli_import():
    """Test that CLI commands can be imported."""
    from app.cli import init_app
    
    assert init_app is not None


def test_schema_import():
    """Test that Pydantic schemas can be imported."""
    from app.schemas.auth_schemas import LoginSchema, SignUpSchema
    
    assert LoginSchema is not None
    assert SignUpSchema is not None


def test_user_validation():
    """Test User model validation."""
    from app.models import User
    from app import app
    from unittest.mock import patch, MagicMock
    
    with app.app_context():
        # Mock User.query to return None (no existing user)
        with patch('app.models.User.query') as mock_query:
            mock_query.filter.return_value.first.return_value = None
            
            user = User()
            
            # Test username validation - should pass with mocked query
            user.username = "testuser"
            assert user.username == "testuser"
            
            # Test email validation - should pass with mocked query
            user.email = "test@example.com"
            assert user.email == "test@example.com"
            
            # Test full_name validation
            user.full_name = "Test User"
            assert user.full_name == "Test User"


def test_user_to_dict():
    """Test User to_dict method."""
    from app.models import User
    from app import app
    from unittest.mock import patch, MagicMock
    
    with app.app_context():
        # Mock User.query to return None (no existing user)
        with patch('app.models.User.query') as mock_query:
            mock_query.filter.return_value.first.return_value = None
            
            user = User()
            user.username = "testuser"
            user.email = "test@example.com"
            user.full_name = "Test User"
            user.bio = "Test bio"
            user.profile_image_url = "https://example.com/image.jpg"
            
            user_dict = user.to_dict()
            
            assert user_dict['username'] == "testuser"
            assert user_dict['email'] == "test@example.com"
            assert user_dict['full_name'] == "Test User"
            assert user_dict['bio'] == "Test bio"
            assert user_dict['profile_image_url'] == "https://example.com/image.jpg"


def test_factory_user_creation(app):
    """Test that UserFactory creates valid users."""
    with app.app_context():
        user = UserFactory.build()
        
        assert user.username is not None
        assert user.email is not None
        assert user.full_name is not None
        assert '@' in user.email
        assert user.username in user.email


def test_factory_post_creation(app):
    """Test that PostFactory creates valid posts."""
    with app.app_context():
        post = PostFactory.build()
        
        assert post.caption is not None
        assert post.image_url is not None
        assert post.user is not None


def test_factory_comment_creation(app):
    """Test that CommentFactory creates valid comments."""
    with app.app_context():
        comment = CommentFactory.build()
        
        assert comment.content is not None
        assert comment.user is not None
        assert comment.post is not None


def test_factory_like_creation(app):
    """Test that LikeFactory creates valid likes."""
    with app.app_context():
        like = LikeFactory.build()
        
        assert like.user is not None
        assert like.likeable_type in ['Post', 'Comment']  # Match the Literal type
        assert like.likeable_id is not None


def test_factory_follow_creation(app):
    """Test that FollowFactory creates valid follows."""
    with app.app_context():
        follow = FollowFactory.build()
        
        assert follow.user is not None
        assert follow.user_followed_id is not None
        assert follow.user_id != follow.user_followed_id  # Different users


def test_utility_functions(app):
    """Test utility functions for creating test data."""
    with app.app_context():
        # Test creating multiple users
        users = create_test_users(3)
        assert len(users) == 3
        assert all(isinstance(user, User) for user in users)
        
        # Test creating posts for a user
        user = UserFactory.create()
        posts = create_test_posts(2, user)
        assert len(posts) == 2
        assert all(post.user_id == user.id for post in posts)
        
        # Test creating comments for a post
        post = PostFactory.create()
        comments = create_test_comments(2, post)
        assert len(comments) == 2
        assert all(comment.post_id == post.id for comment in comments) 