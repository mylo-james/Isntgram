"""
Caching utilities for performance optimization.
Provides Redis-based caching with smart invalidation strategies.
"""

from functools import wraps
from typing import Optional, Callable, Any, Union, Dict
import json
import pickle
import hashlib
import logging
from datetime import datetime, timedelta
from flask import current_app, request
import redis

logger = logging.getLogger(__name__)


class CacheManager:
    """Centralized cache management with Redis backend."""
    
    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None
        self.default_timeout = 300  # 5 minutes
        self.key_prefix = 'isntgram:'
    
    def init_app(self, app):
        """Initialize caching with Flask app."""
        try:
            redis_url = app.config.get('REDIS_URL', 'redis://localhost:6379/1')
            self.redis_client = redis.from_url(redis_url, decode_responses=False)
            
            # Test Redis connection
            self.redis_client.ping()
            
            # Update configuration from app config
            cache_config = app.config.get('CACHE_CONFIG', {})
            self.default_timeout = cache_config.get('CACHE_DEFAULT_TIMEOUT', 300)
            self.key_prefix = cache_config.get('CACHE_KEY_PREFIX', 'isntgram:')
            
            app.extensions['cache_manager'] = self
            logger.info("✅ Redis cache initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize Redis cache: {e}")
            self.redis_client = None
    
    def _make_key(self, key: str) -> str:
        """Generate prefixed cache key."""
        return f"{self.key_prefix}{key}"
    
    def get(self, key: str, default=None) -> Any:
        """Retrieve value from cache."""
        if not self.redis_client:
            return default
        
        try:
            cache_key = self._make_key(key)
            value = self.redis_client.get(cache_key)
            if value is not None:
                return pickle.loads(value)
            return default
        except Exception as e:
            logger.error(f"Cache get error for key {key}: {e}")
            return default
    
    def set(self, key: str, value: Any, timeout: Optional[int] = None) -> bool:
        """Store value in cache."""
        if not self.redis_client:
            return False
        
        try:
            cache_key = self._make_key(key)
            timeout = timeout or self.default_timeout
            serialized_value = pickle.dumps(value)
            result = self.redis_client.setex(cache_key, timeout, serialized_value)
            return bool(result)
        except Exception as e:
            logger.error(f"Cache set error for key {key}: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """Delete value from cache."""
        if not self.redis_client:
            return False
        
        try:
            cache_key = self._make_key(key)
            result = self.redis_client.delete(cache_key)
            return bool(result)
        except Exception as e:
            logger.error(f"Cache delete error for key {key}: {e}")
            return False
    
    def delete_pattern(self, pattern: str) -> int:
        """Delete all keys matching pattern."""
        if not self.redis_client:
            return 0
        
        try:
            cache_pattern = self._make_key(pattern)
            keys = self.redis_client.keys(cache_pattern)
            if keys:
                deleted = self.redis_client.delete(*keys)
                logger.info(f"Deleted {deleted} cache keys matching pattern: {pattern}")
                return deleted
            return 0
        except Exception as e:
            logger.error(f"Cache pattern delete error for {pattern}: {e}")
            return 0
    
    def clear_all(self) -> bool:
        """Clear all cache entries with our prefix."""
        if not self.redis_client:
            return False
        
        try:
            pattern = f"{self.key_prefix}*"
            keys = self.redis_client.keys(pattern)
            if keys:
                self.redis_client.delete(*keys)
                logger.info(f"Cleared all cache entries ({len(keys)} keys)")
            return True
        except Exception as e:
            logger.error(f"Cache clear all error: {e}")
            return False
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        if not self.redis_client:
            return {'status': 'unavailable'}
        
        try:
            info = self.redis_client.info()
            pattern = f"{self.key_prefix}*"
            our_keys = len(self.redis_client.keys(pattern))
            
            return {
                'status': 'active',
                'redis_version': info.get('redis_version'),
                'used_memory_human': info.get('used_memory_human'),
                'total_keys': info.get('db1', {}).get('keys', 0),
                'our_keys': our_keys,
                'uptime_in_seconds': info.get('uptime_in_seconds'),
                'connected_clients': info.get('connected_clients')
            }
        except Exception as e:
            logger.error(f"Error getting cache stats: {e}")
            return {'status': 'error', 'message': str(e)}


# Global cache manager instance
cache_manager = CacheManager()


def cache_key(*args, **kwargs) -> str:
    """Generate cache key from function arguments."""
    # Create a deterministic key from arguments
    key_data = f"{args}:{sorted(kwargs.items())}"
    return hashlib.md5(key_data.encode()).hexdigest()


def cached(timeout: Optional[int] = None, key_func: Optional[Callable] = None):
    """
    Decorator for caching function results.
    
    Args:
        timeout: Cache timeout in seconds
        key_func: Function to generate cache key
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            if not cache_manager.redis_client:
                # Cache not available, call function directly
                return func(*args, **kwargs)
            
            # Generate cache key
            if key_func:
                cache_key_str = key_func(*args, **kwargs)
            else:
                func_name = f"{func.__module__}.{func.__name__}"
                cache_key_str = f"func:{func_name}:{cache_key(*args, **kwargs)}"
            
            # Try to get from cache
            cached_result = cache_manager.get(cache_key_str)
            if cached_result is not None:
                logger.debug(f"Cache hit for {func.__name__}")
                return cached_result
            
            # Cache miss - call function
            logger.debug(f"Cache miss for {func.__name__}")
            result = func(*args, **kwargs)
            
            # Store in cache
            cache_timeout = timeout or cache_manager.default_timeout
            cache_manager.set(cache_key_str, result, cache_timeout)
            
            return result
        
        return wrapper
    return decorator


def smart_cached(cache_type: str):
    """
    Smart caching decorator that uses config-based timeouts.
    
    Args:
        cache_type: Type of data being cached (from CACHE_TIMEOUTS config)
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            if not cache_manager.redis_client:
                return func(*args, **kwargs)
            
            # Get timeout from config
            cache_timeouts = current_app.config.get('CACHE_TIMEOUTS', {})
            timeout = cache_timeouts.get(cache_type, 300)  # 5 min default
            
            # Generate cache key
            func_name = f"{func.__module__}.{func.__name__}"
            cache_key_str = f"{cache_type}:{func_name}:{cache_key(*args, **kwargs)}"
            
            # Try cache first
            cached_result = cache_manager.get(cache_key_str)
            if cached_result is not None:
                return cached_result
            
            # Execute and cache
            result = func(*args, **kwargs)
            cache_manager.set(cache_key_str, result, timeout)
            
            return result
        
        return wrapper
    return decorator


def invalidate_cache_pattern(pattern: str):
    """Invalidate all cache entries matching pattern."""
    return cache_manager.delete_pattern(pattern)


def invalidate_user_cache(user_id: int):
    """Invalidate all cache entries for a specific user."""
    patterns = [
        f"user_profile:*user_id:{user_id}*",
        f"post_details:*user_id:{user_id}*",
        f"user_followers:*user_id:{user_id}*",
    ]
    
    total_deleted = 0
    for pattern in patterns:
        total_deleted += cache_manager.delete_pattern(pattern)
    
    logger.info(f"Invalidated {total_deleted} cache entries for user {user_id}")
    return total_deleted


def invalidate_post_cache(post_id: int):
    """Invalidate all cache entries for a specific post."""
    patterns = [
        f"post_details:*post_id:{post_id}*",
        f"post_scroll:*",  # Scroll includes this post
        f"explore_posts:*",  # Explore might include this post
    ]
    
    total_deleted = 0
    for pattern in patterns:
        total_deleted += cache_manager.delete_pattern(pattern)
    
    logger.info(f"Invalidated {total_deleted} cache entries for post {post_id}")
    return total_deleted


# Convenience decorators for common cache types
user_profile_cache = lambda: smart_cached('user_profile')
post_details_cache = lambda: smart_cached('post_details')
post_scroll_cache = lambda: smart_cached('post_scroll')
explore_posts_cache = lambda: smart_cached('explore_posts')
search_results_cache = lambda: smart_cached('search_results')
