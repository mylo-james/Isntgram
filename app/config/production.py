"""
Production configuration for Phase 4 features:
- API Documentation (Swagger)
- Rate Limiting
- Caching (Redis)
"""

import os
from typing import Dict, Any
from ..config import Config


class ProductionConfig(Config):
    """Configuration for production-ready features."""
    
    # API Documentation
    SWAGGER_CONFIG = {
        'headers': [],
        'specs': [
            {
                'endpoint': 'apispec_1',
                'route': '/apispec_1.json',
                'rule_filter': lambda rule: True,  # All endpoints
                'model_filter': lambda tag: True,  # All models
            }
        ],
        'static_url_path': '/flasgger_static',
        'swagger_ui': True,
        'specs_route': '/api/docs/'
    }
    
    SWAGGER_TEMPLATE = {
        'swagger': '2.0',
        'info': {
            'title': 'Isntgram API',
            'description': 'Instagram Clone REST API with modern Flask + SQLAlchemy 2.0 + Pydantic',
            'version': '2.0.0',
            'contact': {
                'name': 'Isntgram Development Team',
                'url': 'https://github.com/mylo-james/Isntgram'
            }
        },
        'host': os.getenv('API_HOST', 'localhost:8080'),
        'basePath': '/',
        'schemes': ['http', 'https'],
        'consumes': ['application/json', 'multipart/form-data'],
        'produces': ['application/json'],
        'securityDefinitions': {
            'Bearer': {
                'type': 'apiKey',
                'name': 'Authorization',
                'in': 'header',
                'description': 'JWT token for authentication. Format: Bearer <token>'
            }
        },
        'security': [{'Bearer': []}]
    }
    
    # Rate Limiting Configuration
    RATELIMIT_STORAGE_URI = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    RATELIMIT_STRATEGY = 'fixed-window'
    RATELIMIT_DEFAULT = '1000/hour;100/minute'  # Global limits
    
    # Rate limits by endpoint type
    RATE_LIMITS: Dict[str, str] = {
        # Authentication endpoints
        'auth_login': '5/minute',
        'auth_signup': '3/minute', 
        'auth_logout': '10/minute',
        
        # Post operations
        'post_create': '10/hour',
        'post_update': '20/hour',
        'post_delete': '10/hour',
        'post_scroll': '100/minute',
        'post_explore': '50/minute',
        
        # User interactions
        'like_toggle': '200/minute',
        'comment_create': '30/minute',
        'follow_toggle': '50/minute',
        
        # Content retrieval
        'user_profile': '100/minute',
        'search': '30/minute',
        
        # File uploads
        'image_upload': '20/hour',
    }
    
    # Redis Caching Configuration
    REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/1')
    CACHE_CONFIG = {
        'CACHE_TYPE': 'redis',
        'CACHE_REDIS_URL': REDIS_URL,
        'CACHE_DEFAULT_TIMEOUT': 300,  # 5 minutes default
        'CACHE_KEY_PREFIX': 'isntgram:',
    }
    
    # Cache timeouts by data type
    CACHE_TIMEOUTS: Dict[str, int] = {
        'user_profile': 600,      # 10 minutes
        'post_details': 300,      # 5 minutes  
        'post_scroll': 60,        # 1 minute (dynamic content)
        'explore_posts': 180,     # 3 minutes
        'user_followers': 300,    # 5 minutes
        'search_results': 120,    # 2 minutes
        'static_content': 3600,   # 1 hour
    }
    
    # Performance Monitoring
    PERFORMANCE_MONITORING = {
        'slow_query_threshold': 0.01,  # 10ms
        'log_queries': True,
        'enable_profiling': os.getenv('ENABLE_PROFILING', 'false').lower() == 'true'
    }


# Development overrides
class DevelopmentConfig(ProductionConfig):
    """Development-specific configuration."""
    
    # Flask configuration
    SECRET_KEY = 'dev-secret-key-change-in-production'
    DEBUG = True
    TESTING = False
    
    # Database configuration (inherit from original Config)
    SQLALCHEMY_DATABASE_URI = 'sqlite:///instance/local_dev.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = True  # Enable SQL query logging in development
    
    # CSRF Protection
    WTF_CSRF_ENABLED = True
    WTF_CSRF_TIME_LIMIT = None
    
    # More lenient rate limits for development
    RATE_LIMITS = {
        'auth_login': '20/minute',
        'auth_signup': '10/minute',
        'post_create': '50/hour',
        'like_toggle': '1000/minute',
        'comment_create': '100/minute',
    }
    
    # Shorter cache times for development
    CACHE_TIMEOUTS = {
        'user_profile': 60,
        'post_details': 30,
        'post_scroll': 10,
        'explore_posts': 30,
    }
    
    PERFORMANCE_MONITORING = {
        'slow_query_threshold': 0.02,  # 20ms (more lenient)
        'log_queries': True,
        'enable_profiling': True
    }
