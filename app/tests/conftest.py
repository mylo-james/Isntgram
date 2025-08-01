"""
Test configuration and fixtures for backend API tests
"""
import pytest
import tempfile
import os
from app import app as flask_app
from app.models import db, User, Post, Comment, Like, Follow
from app.forms.login_form import LoginForm
from app.forms.signup_form import SignUpForm


@pytest.fixture(scope='session')
def app():
    """Create test app with in-memory database."""
    # Set environment variables for testing
    os.environ['FLASK_ENV'] = 'testing'
    os.environ['TESTING'] = 'True'
    
    # Override the database configuration for testing BEFORE any database operations
    flask_app.config.update({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',  # Use in-memory database
        'SQLALCHEMY_TRACK_MODIFICATIONS': False,
        'WTF_CSRF_ENABLED': False,  # Disable CSRF for testing
        'SECRET_KEY': 'test-secret-key'
    })
    
    # Force re-initialization of the database with new config
    if 'sqlalchemy' in flask_app.extensions:
        # Remove existing SQLAlchemy extension
        del flask_app.extensions['sqlalchemy']
    
    # Re-initialize database with test configuration
    db.init_app(flask_app)
    
    with flask_app.app_context():
        # Create all tables
        db.create_all()
        yield flask_app
        # Clean up
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """Create test client."""
    return app.test_client()


@pytest.fixture
def runner(app):
    """Create test CLI runner."""
    return app.test_cli_runner()


@pytest.fixture
def db_session(app):
    """Create database session for testing."""
    with app.app_context():
        # Use the session directly from the app context
        session = db.session
        
        yield session
        
        # Clean up
        session.rollback()
        session.close()


@pytest.fixture
def sample_user(db_session):
    """Create a sample user for testing."""
    # Check if user already exists
    existing_user = User.query.filter(User.username == 'testuser').first()
    if existing_user:
        return existing_user
    
    user = User(
        username='testuser',
        email='test@example.com',
        full_name='Test User'
    )
    user.password = 'TestPassword123'  # Use property setter
    db_session.add(user)
    db_session.commit()
    return user


@pytest.fixture
def sample_post(db_session, sample_user):
    """Create a sample post for testing."""
    post = Post(
        caption='Test post caption',
        image_url='https://example.com/test-image.jpg',
        user_id=sample_user.id
    )
    db_session.add(post)
    db_session.commit()
    return post


@pytest.fixture
def sample_comment(db_session, sample_user, sample_post):
    """Create a sample comment for testing."""
    comment = Comment(
        content='Test comment content',
        user_id=sample_user.id,
        post_id=sample_post.id
    )
    db_session.add(comment)
    db_session.commit()
    return comment


@pytest.fixture
def authenticated_client(client, sample_user):
    """Create authenticated test client."""
    with client.session_transaction() as sess:
        # Use Flask-Login's login_user to properly authenticate
        from flask_login import login_user
        login_user(sample_user)
    return client


@pytest.fixture
def login_form_data():
    """Sample login form data."""
    return {
        'username': 'testuser',
        'password': 'TestPassword123'
    }


@pytest.fixture
def signup_form_data():
    """Sample signup form data."""
    return {
        'username': 'newuser',
        'email': 'newuser@example.com',
        'full_name': 'New User',
        'password': 'NewPassword123',
        'confirmPassword': 'NewPassword123'
    }


@pytest.fixture
def mock_user_query():
    """Mock User.query for testing."""
    from unittest.mock import patch
    with patch('app.models.User.query') as mock_query:
        yield mock_query


@pytest.fixture
def mock_post_query():
    """Mock Post.query for testing."""
    from unittest.mock import patch
    with patch('app.models.Post.query') as mock_query:
        yield mock_query


@pytest.fixture
def mock_aws_upload():
    """Mock AWS S3 upload for testing."""
    from unittest.mock import patch
    with patch('app.api.aws_routes.upload_file_to_s3') as mock_upload:
        mock_upload.return_value = 'https://example.com/test-image.jpg'
        yield mock_upload


@pytest.fixture
def mock_redis():
    """Mock Redis for testing."""
    from unittest.mock import patch
    with patch('app.utils.rate_limiting.redis') as mock_redis:
        mock_redis.from_url.return_value.ping.return_value = True
        yield mock_redis


@pytest.fixture
def test_app_context(app):
    """Provide test application context."""
    with app.app_context():
        yield app


@pytest.fixture
def test_request_context(app):
    """Provide test request context."""
    with app.test_request_context():
        yield app


@pytest.fixture
def mock_db_session():
    """Mock database session for validation tests."""
    from unittest.mock import patch, MagicMock
    with patch('app.models.db.session') as mock_session:
        # Mock the query to return None (no existing user)
        mock_query = MagicMock()
        mock_query.filter.return_value.first.return_value = None
        mock_session.query.return_value = mock_query
        yield mock_session
