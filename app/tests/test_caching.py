"""
Test suite for caching utilities
Tests Redis-based caching with smart invalidation strategies
"""
import pytest
import pickle
import hashlib
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime, timedelta
from app.utils.caching import (
    CacheManager,
    cache_manager,
    cache_key,
    cached,
    smart_cached,
    invalidate_cache_pattern,
    invalidate_user_cache,
    invalidate_post_cache,
    user_profile_cache,
    post_details_cache,
    post_scroll_cache,
    explore_posts_cache,
    search_results_cache
)


class TestCacheManager:
    """Test CacheManager class."""

    def test_cache_manager_initialization(self):
        """Test CacheManager initialization."""
        manager = CacheManager()
        assert manager.redis_client is None
        assert manager.default_timeout == 300
        assert manager.key_prefix == 'isntgram:'

    @patch('app.utils.caching.redis')
    def test_init_app_success(self, mock_redis):
        """Test successful app initialization."""
        # Mock Redis client
        mock_redis_client = Mock()
        mock_redis.from_url.return_value = mock_redis_client
        mock_redis_client.ping.return_value = True
        
        app = Mock()
        app.config = {
            'REDIS_URL': 'redis://localhost:6379/1',
            'CACHE_CONFIG': {
                'CACHE_DEFAULT_TIMEOUT': 600,
                'CACHE_KEY_PREFIX': 'test:'
            }
        }
        app.extensions = {}
        
        manager = CacheManager()
        manager.init_app(app)
        
        assert manager.redis_client == mock_redis_client
        assert manager.default_timeout == 600
        assert manager.key_prefix == 'test:'
        assert app.extensions['cache_manager'] == manager

    @patch('app.utils.caching.redis')
    def test_init_app_failure(self, mock_redis):
        """Test app initialization failure."""
        # Mock Redis connection failure
        mock_redis.from_url.side_effect = Exception("Connection failed")
        
        app = Mock()
        app.config = {'REDIS_URL': 'redis://localhost:6379/1'}
        
        manager = CacheManager()
        manager.init_app(app)
        
        assert manager.redis_client is None

    def test_make_key(self):
        """Test cache key generation."""
        manager = CacheManager()
        manager.key_prefix = 'test:'
        
        key = manager._make_key('user:123')
        assert key == 'test:user:123'

    @patch('app.utils.caching.pickle')
    def test_get_success(self, mock_pickle):
        """Test successful cache get operation."""
        # Mock Redis client
        mock_redis = Mock()
        mock_redis.get.return_value = b'cached_data'
        mock_pickle.loads.return_value = {'user_id': 123}
        
        manager = CacheManager()
        manager.redis_client = mock_redis
        manager.key_prefix = 'test:'
        
        result = manager.get('user:123')
        
        assert result == {'user_id': 123}
        mock_redis.get.assert_called_once_with('test:user:123')

    def test_get_no_redis(self):
        """Test cache get when Redis is not available."""
        manager = CacheManager()
        manager.redis_client = None
        
        result = manager.get('user:123', default='default_value')
        assert result == 'default_value'

    def test_get_exception(self):
        """Test cache get with exception."""
        # Mock Redis client that raises exception
        mock_redis = Mock()
        mock_redis.get.side_effect = Exception("Redis error")
        
        manager = CacheManager()
        manager.redis_client = mock_redis
        
        result = manager.get('user:123', default='default_value')
        assert result == 'default_value'

    @patch('app.utils.caching.pickle')
    def test_set_success(self, mock_pickle):
        """Test successful cache set operation."""
        # Mock Redis client
        mock_redis = Mock()
        mock_redis.setex.return_value = True
        mock_pickle.dumps.return_value = b'serialized_data'
        
        manager = CacheManager()
        manager.redis_client = mock_redis
        manager.key_prefix = 'test:'
        
        result = manager.set('user:123', {'user_id': 123}, 600)
        
        assert result is True
        mock_redis.setex.assert_called_once_with('test:user:123', 600, b'serialized_data')

    def test_set_no_redis(self):
        """Test cache set when Redis is not available."""
        manager = CacheManager()
        manager.redis_client = None
        
        result = manager.set('user:123', {'user_id': 123})
        assert result is False

    def test_set_exception(self):
        """Test cache set with exception."""
        # Mock Redis client that raises exception
        mock_redis = Mock()
        mock_redis.setex.side_effect = Exception("Redis error")
        
        manager = CacheManager()
        manager.redis_client = mock_redis
        
        result = manager.set('user:123', {'user_id': 123})
        assert result is False

    def test_delete_success(self):
        """Test successful cache delete operation."""
        # Mock Redis client
        mock_redis = Mock()
        mock_redis.delete.return_value = 1
        
        manager = CacheManager()
        manager.redis_client = mock_redis
        manager.key_prefix = 'test:'
        
        result = manager.delete('user:123')
        
        assert result is True
        mock_redis.delete.assert_called_once_with('test:user:123')

    def test_delete_no_redis(self):
        """Test cache delete when Redis is not available."""
        manager = CacheManager()
        manager.redis_client = None
        
        result = manager.delete('user:123')
        assert result is False

    def test_delete_pattern_success(self):
        """Test successful pattern delete operation."""
        # Mock Redis client
        mock_redis = Mock()
        mock_redis.keys.return_value = [b'test:user:123', b'test:user:456']
        mock_redis.delete.return_value = 2
        
        manager = CacheManager()
        manager.redis_client = mock_redis
        manager.key_prefix = 'test:'
        
        result = manager.delete_pattern('user:*')
        
        assert result == 2
        mock_redis.keys.assert_called_once_with('test:user:*')
        mock_redis.delete.assert_called_once_with(b'test:user:123', b'test:user:456')

    def test_delete_pattern_no_keys(self):
        """Test pattern delete when no keys match."""
        # Mock Redis client
        mock_redis = Mock()
        mock_redis.keys.return_value = []
        
        manager = CacheManager()
        manager.redis_client = mock_redis
        manager.key_prefix = 'test:'
        
        result = manager.delete_pattern('user:*')
        
        assert result == 0
        mock_redis.delete.assert_not_called()

    def test_clear_all_success(self):
        """Test successful clear all operation."""
        # Mock Redis client
        mock_redis = Mock()
        mock_redis.keys.return_value = [b'test:user:123', b'test:user:456']
        mock_redis.delete.return_value = 2
        
        manager = CacheManager()
        manager.redis_client = mock_redis
        manager.key_prefix = 'test:'
        
        result = manager.clear_all()
        
        assert result is True
        mock_redis.keys.assert_called_once_with('test:*')
        mock_redis.delete.assert_called_once_with(b'test:user:123', b'test:user:456')

    def test_get_stats_success(self):
        """Test successful stats retrieval."""
        # Mock Redis client
        mock_redis = Mock()
        mock_redis.info.return_value = {
            'redis_version': '6.0.0',
            'used_memory_human': '1.2M',
            'uptime_in_seconds': 3600,
            'connected_clients': 5,
            'db1': {'keys': 100}
        }
        mock_redis.keys.return_value = [b'test:key1', b'test:key2']
        
        manager = CacheManager()
        manager.redis_client = mock_redis
        manager.key_prefix = 'test:'
        
        stats = manager.get_stats()
        
        assert stats['status'] == 'active'
        assert stats['redis_version'] == '6.0.0'
        assert stats['our_keys'] == 2

    def test_get_stats_no_redis(self):
        """Test stats retrieval when Redis is not available."""
        manager = CacheManager()
        manager.redis_client = None
        
        stats = manager.get_stats()
        assert stats['status'] == 'unavailable'


class TestCacheKey:
    """Test cache_key function."""

    def test_cache_key_basic(self):
        """Test basic cache key generation."""
        key = cache_key('user', 123)
        assert isinstance(key, str)
        assert len(key) == 32  # MD5 hash length

    def test_cache_key_with_kwargs(self):
        """Test cache key generation with keyword arguments."""
        key1 = cache_key('user', user_id=123, active=True)
        key2 = cache_key('user', user_id=123, active=True)
        key3 = cache_key('user', user_id=123, active=False)
        
        assert key1 == key2  # Same arguments should produce same key
        assert key1 != key3  # Different arguments should produce different key

    def test_cache_key_deterministic(self):
        """Test that cache key generation is deterministic."""
        key1 = cache_key('test', 1, 2, 3, a=1, b=2)
        key2 = cache_key('test', 1, 2, 3, a=1, b=2)
        
        assert key1 == key2


class TestCachedDecorator:
    """Test cached decorator."""

    @patch('app.utils.caching.cache_manager')
    def test_cached_success(self, mock_cache_manager):
        """Test successful caching with decorator."""
        # Mock cache manager
        mock_cache_manager.redis_client = Mock()
        mock_cache_manager.get.return_value = None  # Cache miss
        mock_cache_manager.set.return_value = True
        
        @cached(timeout=600)
        def test_function(user_id):
            return {'user_id': user_id, 'name': 'Test User'}
        
        result = test_function(123)
        
        assert result == {'user_id': 123, 'name': 'Test User'}
        mock_cache_manager.get.assert_called_once()
        mock_cache_manager.set.assert_called_once()

    @patch('app.utils.caching.cache_manager')
    def test_cached_hit(self, mock_cache_manager):
        """Test cache hit with decorator."""
        # Mock cache manager
        mock_cache_manager.redis_client = Mock()
        mock_cache_manager.get.return_value = {'user_id': 123, 'name': 'Cached User'}
        
        @cached(timeout=600)
        def test_function(user_id):
            return {'user_id': user_id, 'name': 'Test User'}
        
        result = test_function(123)
        
        assert result == {'user_id': 123, 'name': 'Cached User'}
        mock_cache_manager.get.assert_called_once()
        mock_cache_manager.set.assert_not_called()

    @patch('app.utils.caching.cache_manager')
    def test_cached_no_redis(self, mock_cache_manager):
        """Test cached decorator when Redis is not available."""
        # Mock cache manager without Redis
        mock_cache_manager.redis_client = None
        
        @cached(timeout=600)
        def test_function(user_id):
            return {'user_id': user_id, 'name': 'Test User'}
        
        result = test_function(123)
        
        assert result == {'user_id': 123, 'name': 'Test User'}


class TestSmartCachedDecorator:
    """Test smart_cached decorator."""

    def test_smart_cached_success(self):
        """Test successful smart caching."""
        # Create a test app with proper config
        from flask import Flask
        test_app = Flask(__name__)
        test_app.config = {
            'SERVER_NAME': 'localhost',
            'APPLICATION_ROOT': '/',
            'PREFERRED_URL_SCHEME': 'http',
            'CACHE_TIMEOUTS': {
                'user_profile': 1800,
                'post_details': 900
            }
        }
        
        # Mock cache manager
        with patch('app.utils.caching.cache_manager') as mock_cache_manager:
            mock_cache_manager.redis_client = Mock()
            mock_cache_manager.get.return_value = None  # Cache miss
            mock_cache_manager.set.return_value = True
            
            with test_app.app_context():
                @smart_cached('user_profile')
                def test_function(user_id):
                    return {'user_id': user_id, 'name': 'Test User'}
                
                result = test_function(123)
                
                assert result == {'user_id': 123, 'name': 'Test User'}
                mock_cache_manager.set.assert_called_once()
                # Should use timeout from config (as positional argument)
                args, kwargs = mock_cache_manager.set.call_args
                assert len(args) >= 3  # key, value, timeout
                assert args[2] == 1800  # timeout should be the third argument


class TestInvalidateFunctions:
    """Test cache invalidation functions."""

    @patch('app.utils.caching.cache_manager')
    def test_invalidate_cache_pattern(self, mock_cache_manager):
        """Test cache pattern invalidation."""
        mock_cache_manager.delete_pattern.return_value = 3
        
        result = invalidate_cache_pattern('user:*')
        
        assert result == 3
        mock_cache_manager.delete_pattern.assert_called_once_with('user:*')

    @patch('app.utils.caching.cache_manager')
    def test_invalidate_user_cache(self, mock_cache_manager):
        """Test user cache invalidation."""
        mock_cache_manager.delete_pattern.side_effect = [2, 1, 0]
        
        result = invalidate_user_cache(123)
        
        assert result == 3
        assert mock_cache_manager.delete_pattern.call_count == 3

    @patch('app.utils.caching.cache_manager')
    def test_invalidate_post_cache(self, mock_cache_manager):
        """Test post cache invalidation."""
        mock_cache_manager.delete_pattern.side_effect = [1, 2, 0]
        
        result = invalidate_post_cache(456)
        
        assert result == 3
        assert mock_cache_manager.delete_pattern.call_count == 3


class TestConvenienceDecorators:
    """Test convenience cache decorators."""

    def test_user_profile_cache(self):
        """Test user_profile_cache decorator."""
        decorator = user_profile_cache()
        assert callable(decorator)
        # The decorator is a lambda that returns smart_cached, so we check the function name
        assert decorator.__name__ == 'decorator'

    def test_post_details_cache(self):
        """Test post_details_cache decorator."""
        decorator = post_details_cache()
        assert callable(decorator)
        assert decorator.__name__ == 'decorator'

    def test_post_scroll_cache(self):
        """Test post_scroll_cache decorator."""
        decorator = post_scroll_cache()
        assert callable(decorator)
        assert decorator.__name__ == 'decorator'

    def test_explore_posts_cache(self):
        """Test explore_posts_cache decorator."""
        decorator = explore_posts_cache()
        assert callable(decorator)
        assert decorator.__name__ == 'decorator'

    def test_search_results_cache(self):
        """Test search_results_cache decorator."""
        decorator = search_results_cache()
        assert callable(decorator)
        assert decorator.__name__ == 'decorator' 