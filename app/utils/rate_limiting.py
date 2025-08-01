"""
Rate limiting utilities for API endpoints.
Provides decorators and configuration for production-ready rate limiting.
"""

from functools import wraps
from typing import Optional, Callable, Any
from flask import request, jsonify, current_app
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import redis
import logging

logger = logging.getLogger(__name__)


class RateLimitManager:
    """Centralized rate limiting management."""
    
    def __init__(self):
        self.limiter: Optional[Limiter] = None
        self.redis_client: Optional[redis.Redis] = None
    
    def init_app(self, app):
        """Initialize rate limiting with Flask app."""
        try:
            # Initialize Redis connection
            redis_url = app.config.get('RATELIMIT_STORAGE_URI', 'redis://localhost:6379/0')
            self.redis_client = redis.from_url(redis_url, decode_responses=True)
            
            # Test Redis connection
            self.redis_client.ping()
            logger.info("✅ Redis connection established for rate limiting")
            
            # Initialize Flask-Limiter
            self.limiter = Limiter(
                app=app,
                key_func=self._get_rate_limit_key,
                storage_uri=redis_url,
                default_limits=[app.config.get('RATELIMIT_DEFAULT', '1000/hour;100/minute')],
                strategy=app.config.get('RATELIMIT_STRATEGY', 'fixed-window'),
                headers_enabled=True,  # Include rate limit headers in response
                on_breach=self._on_rate_limit_exceeded
            )
            
            app.extensions['rate_limiter'] = self
            logger.info("✅ Rate limiting initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize rate limiting: {e}")
            # Fallback to in-memory storage for development
            self.limiter = Limiter(
                app=app,
                key_func=get_remote_address,
                storage_uri='memory://',
                default_limits=['1000/hour;100/minute']
            )
            logger.warning("⚠️ Using in-memory rate limiting (development only)")
    
    def _get_rate_limit_key(self) -> str:
        """Generate rate limit key based on user and IP."""
        # Try to get user ID from JWT token
        user_id = getattr(request, 'current_user_id', None)
        if user_id:
            return f"user:{user_id}"
        
        # Fallback to IP address
        return f"ip:{get_remote_address()}"
    
    def _on_rate_limit_exceeded(self, e):
        """Handle rate limit exceeded events."""
        logger.warning(f"Rate limit exceeded: {e}")
        return jsonify({
            'error': 'Rate limit exceeded',
            'message': 'Too many requests. Please try again later.',
            'retry_after': e.retry_after
        }), 429


# Global rate limiter instance
rate_limiter = RateLimitManager()


def rate_limit(limit: str, per_user: bool = True):
    """
    Decorator for applying rate limits to endpoints.
    
    Args:
        limit: Rate limit string (e.g., '10/minute', '100/hour')
        per_user: If True, apply limit per user; if False, per IP
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            if not rate_limiter.limiter:
                # Rate limiting not available, proceed without limits
                logger.warning("Rate limiting not available, proceeding without limits")
                return func(*args, **kwargs)
            
            # Apply the rate limit
            try:
                # Use the limiter's limit decorator
                limited_func = rate_limiter.limiter.limit(limit)(func)
                return limited_func(*args, **kwargs)
            except Exception as e:
                logger.error(f"Rate limiting error: {e}")
                # Proceed without rate limiting if there's an error
                return func(*args, **kwargs)
        
        return wrapper
    return decorator


def smart_rate_limit(endpoint_name: str):
    """
    Smart rate limiting decorator that uses config-based limits.
    
    Args:
        endpoint_name: Name of the endpoint to look up in RATE_LIMITS config
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            if not rate_limiter.limiter:
                return func(*args, **kwargs)
            
            # Get rate limit from config
            rate_limits = current_app.config.get('RATE_LIMITS', {})
            limit = rate_limits.get(endpoint_name, '100/minute')  # Default fallback
            
            try:
                limited_func = rate_limiter.limiter.limit(limit)(func)
                return limited_func(*args, **kwargs)
            except Exception as e:
                logger.error(f"Smart rate limiting error for {endpoint_name}: {e}")
                return func(*args, **kwargs)
        
        return wrapper
    return decorator


def get_rate_limit_status(user_id: Optional[str] = None) -> dict:
    """
    Get current rate limit status for debugging/monitoring.
    
    Returns:
        Dictionary with rate limit information
    """
    if not rate_limiter.redis_client:
        return {'status': 'Rate limiting not available'}
    
    try:
        key = f"user:{user_id}" if user_id else f"ip:{get_remote_address()}"
        
        # Get current rate limit data from Redis
        # This is implementation-specific and may need adjustment
        # based on Flask-Limiter's internal structure
        
        return {
            'status': 'active',
            'key': key,
            'redis_available': True
        }
    except Exception as e:
        logger.error(f"Error getting rate limit status: {e}")
        return {'status': 'error', 'message': str(e)}


def reset_rate_limit(user_id: Optional[str] = None) -> bool:
    """
    Reset rate limits for a user (admin function).
    
    Args:
        user_id: User ID to reset limits for
        
    Returns:
        True if successful, False otherwise
    """
    if not rate_limiter.redis_client:
        return False
    
    try:
        key_pattern = f"user:{user_id}:*" if user_id else f"ip:{get_remote_address()}:*"
        
        # Find and delete rate limit keys
        keys = rate_limiter.redis_client.keys(key_pattern)
        if keys:
            rate_limiter.redis_client.delete(*keys)
            logger.info(f"Reset rate limits for pattern: {key_pattern}")
        
        return True
    except Exception as e:
        logger.error(f"Error resetting rate limits: {e}")
        return False
