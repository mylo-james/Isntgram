"""
Test suite for rate limiting utilities
Tests Redis-based rate limiting with smart user tracking
"""
import pytest
from unittest.mock import Mock, patch, MagicMock
from app.utils.rate_limiting import (
    RateLimitManager, 
    rate_limit, 
    smart_rate_limit,
    get_rate_limit_status,
    reset_rate_limit,
    rate_limiter
)
from flask import Flask


class TestRateLimitManager:
    """Test cases for RateLimitManager class."""

    def test_init_app_success(self):
        """Test successful app initialization."""
        with patch('app.utils.rate_limiting.redis') as mock_redis:
            mock_redis.from_url.return_value = Mock()
            mock_redis.from_url.return_value.ping.return_value = True

            app = Flask(__name__)
            app.config = {
                'RATELIMIT_STORAGE_URI': 'redis://localhost:6379/0',
                'RATELIMIT_DEFAULT': '1000/hour;100/minute',
                'RATELIMIT_STRATEGY': 'fixed-window'
            }

            manager = RateLimitManager()
            manager.init_app(app)

            assert manager.limiter is not None
            assert manager.redis_client is not None

    def test_init_app_failure(self):
        """Test app initialization failure."""
        with patch('app.utils.rate_limiting.redis') as mock_redis:
            mock_redis.from_url.side_effect = Exception("Connection failed")

            app = Flask(__name__)
            app.config = {'RATELIMIT_STORAGE_URI': 'redis://localhost:6379/1'}

            manager = RateLimitManager()
            manager.init_app(app)

            # Should fallback to in-memory storage
            assert manager.limiter is not None

    def test_get_rate_limit_key(self):
        """Test rate limit key generation."""
        manager = RateLimitManager()

        # Mock request context with user
        with patch('app.utils.rate_limiting.request') as mock_request:
            mock_request.current_user_id = '123'
            mock_request.remote_addr = '192.168.1.1'

            key = manager._get_rate_limit_key()
            assert key == 'user:123'

    def test_get_rate_limit_key_no_user(self):
        """Test rate limit key generation without user."""
        manager = RateLimitManager()

        # Mock request context without user
        with patch('app.utils.rate_limiting.request') as mock_request:
            mock_request.current_user_id = None
            mock_request.remote_addr = '192.168.1.1'

            with patch('app.utils.rate_limiting.get_remote_address') as mock_get_addr:
                mock_get_addr.return_value = '192.168.1.1'
                key = manager._get_rate_limit_key()
                assert key == 'ip:192.168.1.1'

    def test_on_rate_limit_exceeded(self):
        """Test rate limit exceeded handler."""
        manager = RateLimitManager()

        # Mock exception
        mock_exception = Mock()
        mock_exception.retry_after = 60

        result = manager._on_rate_limit_exceeded(mock_exception)

        assert result[1] == 429  # HTTP status code
        assert 'Rate limit exceeded' in result[0].get_json()['error']


class TestRateLimitDecorator:
    """Test cases for rate_limit decorator."""

    @patch('app.utils.rate_limiting.rate_limiter')
    def test_rate_limit_success(self, mock_limiter):
        """Test successful rate limiting."""
        mock_limiter.limiter = Mock()
        mock_limiter.limiter.limit.return_value = lambda func: func

        @rate_limit("10/minute")
        def test_function():
            return "success"

        result = test_function()
        assert result == "success"

    @patch('app.utils.rate_limiting.rate_limiter')
    def test_rate_limit_with_limiter(self, mock_limiter):
        """Test rate limiting with limiter available."""
        mock_limiter.limiter = Mock()
        mock_limiter.limiter.limit.return_value = lambda func: func

        @rate_limit("5/minute")
        def test_function():
            return "success"

        result = test_function()
        assert result == "success"

    @patch('app.utils.rate_limiting.rate_limiter')
    def test_rate_limit_no_limiter(self, mock_limiter):
        """Test rate limiting when limiter is not available."""
        mock_limiter.limiter = None

        @rate_limit("10/minute")
        def test_function():
            return "success"

        result = test_function()
        assert result == "success"


class TestSmartRateLimitDecorator:
    """Test cases for smart_rate_limit decorator."""

    @patch('app.utils.rate_limiting.rate_limiter')
    @patch('app.utils.rate_limiting.current_app')
    def test_smart_rate_limit_auth_endpoint(self, mock_app, mock_limiter):
        """Test smart rate limiting for auth endpoints."""
        mock_limiter.limiter = Mock()
        mock_limiter.limiter.limit.return_value = lambda func: func
        mock_app.config = {'RATE_LIMITS': {'auth_login': '5/minute'}}

        @smart_rate_limit('auth_login')
        def test_login():
            return "login_success"

        result = test_login()
        assert result == "login_success"

    @patch('app.utils.rate_limiting.rate_limiter')
    @patch('app.utils.rate_limiting.current_app')
    def test_smart_rate_limit_post_endpoint(self, mock_app, mock_limiter):
        """Test smart rate limiting for post endpoints."""
        mock_limiter.limiter = Mock()
        mock_limiter.limiter.limit.return_value = lambda func: func
        mock_app.config = {'RATE_LIMITS': {'post_create': '10/minute'}}

        @smart_rate_limit('post_create')
        def test_create_post():
            return "post_created"

        result = test_create_post()
        assert result == "post_created"

    @patch('app.utils.rate_limiting.rate_limiter')
    @patch('app.utils.rate_limiting.current_app')
    def test_smart_rate_limit_user_endpoint(self, mock_app, mock_limiter):
        """Test smart rate limiting for user endpoints."""
        mock_limiter.limiter = Mock()
        mock_limiter.limiter.limit.return_value = lambda func: func
        mock_app.config = {'RATE_LIMITS': {'user_update': '20/minute'}}

        @smart_rate_limit('user_update')
        def test_update_user():
            return "user_updated"

        result = test_update_user()
        assert result == "user_updated"


class TestRateLimitStatusFunctions:
    """Test cases for rate limit status functions."""

    @patch('app.utils.rate_limiting.rate_limiter')
    def test_get_rate_limit_status_success(self, mock_limiter):
        """Test getting rate limit status."""
        mock_limiter.redis_client = Mock()

        status = get_rate_limit_status('user:123')
        
        assert 'status' in status
        assert 'key' in status
        assert 'redis_available' in status

    @patch('app.utils.rate_limiting.rate_limiter')
    def test_get_rate_limit_status_no_redis(self, mock_limiter):
        """Test getting rate limit status when Redis is not available."""
        mock_limiter.redis_client = None

        status = get_rate_limit_status('user:123')
        
        assert status['status'] == 'Rate limiting not available'

    @patch('app.utils.rate_limiting.rate_limiter')
    def test_reset_rate_limit_success(self, mock_limiter):
        """Test resetting rate limit."""
        mock_limiter.redis_client = Mock()
        mock_limiter.redis_client.keys.return_value = ['user:123:limit1', 'user:123:limit2']
        mock_limiter.redis_client.delete.return_value = 2

        result = reset_rate_limit('123')
        assert result is True

    @patch('app.utils.rate_limiting.rate_limiter')
    def test_reset_rate_limit_no_redis(self, mock_limiter):
        """Test resetting rate limit when Redis is not available."""
        mock_limiter.redis_client = None

        result = reset_rate_limit('123')
        assert result is False

    @patch('app.utils.rate_limiting.rate_limiter')
    def test_reset_rate_limit_exception(self, mock_limiter):
        """Test resetting rate limit with exception."""
        mock_limiter.redis_client = Mock()
        mock_limiter.redis_client.keys.side_effect = Exception("Redis error")

        result = reset_rate_limit('123')
        assert result is False


class TestRateLimitIntegration:
    """Integration tests for rate limiting functionality."""

    @patch('app.utils.rate_limiting.rate_limiter')
    def test_rate_limit_integration_flow(self, mock_limiter):
        """Test complete rate limiting flow."""
        mock_limiter.limiter = Mock()
        mock_limiter.limiter.limit.return_value = lambda func: func

        @rate_limit("3/minute")
        def test_function():
            return "success"

        # Test multiple calls
        result1 = test_function()
        result2 = test_function()
        result3 = test_function()

        assert result1 == "success"
        assert result2 == "success"
        assert result3 == "success"

    @patch('app.utils.rate_limiting.rate_limiter')
    @patch('app.utils.rate_limiting.current_app')
    def test_smart_rate_limit_integration(self, mock_app, mock_limiter):
        """Test smart rate limiting integration."""
        mock_limiter.limiter = Mock()
        mock_limiter.limiter.limit.return_value = lambda func: func
        mock_app.config = {
            'RATE_LIMITS': {
                'auth_login': '5/minute',
                'post_create': '10/minute'
            }
        }

        @smart_rate_limit('auth_login')
        def login_function():
            return "login_success"

        @smart_rate_limit('post_create')
        def create_post_function():
            return "post_created"

        # Test both functions work
        login_result = login_function()
        post_result = create_post_function()

        assert login_result == "login_success"
        assert post_result == "post_created"

    def test_rate_limit_manager_initialization(self):
        """Test RateLimitManager initialization."""
        manager = RateLimitManager()
        
        assert manager.limiter is None
        assert manager.redis_client is None

    def test_rate_limit_decorator_without_limiter(self):
        """Test rate limit decorator when limiter is not available."""
        # Temporarily set limiter to None
        original_limiter = rate_limiter.limiter
        rate_limiter.limiter = None

        try:
            @rate_limit("10/minute")
            def test_function():
                return "success"

            result = test_function()
            assert result == "success"
        finally:
            # Restore original limiter
            rate_limiter.limiter = original_limiter

    def test_smart_rate_limit_without_limiter(self):
        """Test smart rate limit decorator when limiter is not available."""
        # Temporarily set limiter to None
        original_limiter = rate_limiter.limiter
        rate_limiter.limiter = None

        try:
            @smart_rate_limit('auth_login')
            def test_function():
                return "success"

            result = test_function()
            assert result == "success"
        finally:
            # Restore original limiter
            rate_limiter.limiter = original_limiter 