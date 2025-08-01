"""
Test suite for configuration management
Tests environment-based configuration loading
"""
import pytest
import os
from unittest.mock import patch
from app.config import Config
from app.config.production import ProductionConfig, DevelopmentConfig


class TestConfig:
    """Test cases for configuration classes."""

    def test_config_initialization(self):
        """Test Config class initialization."""
        config = Config()
        assert config is not None
        assert hasattr(config, 'SQLALCHEMY_DATABASE_URI')
        assert hasattr(config, 'SQLALCHEMY_TRACK_MODIFICATIONS')
        assert hasattr(config, 'SQLALCHEMY_ECHO')

    def test_config_default_values(self):
        """Test Config default values."""
        config = Config()
        
        assert config.SQLALCHEMY_TRACK_MODIFICATIONS is False
        assert config.SQLALCHEMY_ECHO is True

    def test_config_environment_variables(self):
        """Test Config with environment variables."""
        with patch.dict(os.environ, {
            'DATABASE_URL': 'postgresql://user:pass@host:5432/testdb'
        }):
            config = Config()
            
            assert config.SQLALCHEMY_DATABASE_URI == 'postgresql://user:pass@host:5432/testdb'

    def test_config_default_database_url(self):
        """Test Config default database URL when DATABASE_URL not set."""
        with patch.dict(os.environ, {}, clear=True):
            config = Config()
            
            assert 'sqlite:///instance/local_dev.db' in config.SQLALCHEMY_DATABASE_URI

    def test_config_postgres_url_conversion(self):
        """Test Config postgres:// to postgresql:// conversion."""
        with patch.dict(os.environ, {
            'DATABASE_URL': 'postgres://user:pass@host:5432/testdb'
        }):
            config = Config()
            
            assert config.SQLALCHEMY_DATABASE_URI == 'postgresql://user:pass@host:5432/testdb'

    def test_config_sqlite_url_no_conversion(self):
        """Test Config SQLite URL not converted."""
        with patch.dict(os.environ, {
            'DATABASE_URL': 'sqlite:///test.db'
        }):
            config = Config()
            
            assert config.SQLALCHEMY_DATABASE_URI == 'sqlite:///test.db'


class TestProductionConfig:
    """Test cases for ProductionConfig class."""

    def test_production_config_inheritance(self):
        """Test ProductionConfig inherits from Config."""
        config = ProductionConfig()
        
        # Should inherit base Config attributes
        assert hasattr(config, 'SQLALCHEMY_DATABASE_URI')
        assert hasattr(config, 'SQLALCHEMY_TRACK_MODIFICATIONS')
        assert hasattr(config, 'SQLALCHEMY_ECHO')

    def test_production_config_swagger_config(self):
        """Test ProductionConfig Swagger configuration."""
        config = ProductionConfig()
        
        assert hasattr(config, 'SWAGGER_CONFIG')
        assert hasattr(config, 'SWAGGER_TEMPLATE')
        
        # Check Swagger config structure
        swagger_config = config.SWAGGER_CONFIG
        assert 'specs' in swagger_config
        assert 'swagger_ui' in swagger_config
        assert swagger_config['swagger_ui'] is True

    def test_production_config_rate_limiting(self):
        """Test ProductionConfig rate limiting configuration."""
        config = ProductionConfig()
        
        assert hasattr(config, 'RATELIMIT_STORAGE_URI')
        assert hasattr(config, 'RATELIMIT_STRATEGY')
        assert hasattr(config, 'RATELIMIT_DEFAULT')
        assert hasattr(config, 'RATE_LIMITS')
        
        # Check rate limits structure
        rate_limits = config.RATE_LIMITS
        assert 'auth_login' in rate_limits
        assert 'post_create' in rate_limits
        assert 'like_toggle' in rate_limits

    def test_production_config_redis_caching(self):
        """Test ProductionConfig Redis caching configuration."""
        config = ProductionConfig()
        
        assert hasattr(config, 'REDIS_URL')
        assert hasattr(config, 'CACHE_CONFIG')
        
        # Check cache config structure
        cache_config = config.CACHE_CONFIG
        assert 'CACHE_TYPE' in cache_config
        assert 'CACHE_REDIS_URL' in cache_config
        assert 'CACHE_DEFAULT_TIMEOUT' in cache_config
        assert 'CACHE_KEY_PREFIX' in cache_config

    def test_production_config_environment_override(self):
        """Test ProductionConfig environment variable overrides."""
        with patch.dict(os.environ, {
            'REDIS_URL': 'redis://custom-redis:6379/2',
            'API_HOST': 'api.example.com:8080'
        }):
            config = ProductionConfig()
            
            assert config.REDIS_URL == 'redis://custom-redis:6379/2'
            assert 'api.example.com:8080' in config.SWAGGER_TEMPLATE['host']

    def test_production_config_default_values(self):
        """Test ProductionConfig default values."""
        with patch.dict(os.environ, {}, clear=True):
            config = ProductionConfig()
            
            assert config.RATELIMIT_STORAGE_URI == 'redis://localhost:6379/0'
            assert config.REDIS_URL == 'redis://localhost:6379/1'
            assert config.RATELIMIT_STRATEGY == 'fixed-window'
            assert config.RATELIMIT_DEFAULT == '1000/hour;100/minute'


class TestDevelopmentConfig:
    """Test cases for DevelopmentConfig class."""

    def test_development_config_inheritance(self):
        """Test DevelopmentConfig inherits from ProductionConfig."""
        config = DevelopmentConfig()
        
        # Should inherit ProductionConfig attributes
        assert hasattr(config, 'SWAGGER_CONFIG')
        assert hasattr(config, 'RATE_LIMITS')
        assert hasattr(config, 'CACHE_CONFIG')

    def test_development_config_overrides(self):
        """Test DevelopmentConfig overrides production settings."""
        config = DevelopmentConfig()
        
        # Development-specific overrides
        assert config.SECRET_KEY == 'dev-secret-key-change-in-production'
        assert config.DEBUG is True
        assert config.TESTING is False
        assert config.SQLALCHEMY_DATABASE_URI == 'sqlite:///instance/local_dev.db'
        assert config.SQLALCHEMY_ECHO is True

    def test_development_config_csrf_settings(self):
        """Test DevelopmentConfig CSRF settings."""
        config = DevelopmentConfig()
        
        assert hasattr(config, 'WTF_CSRF_ENABLED')
        assert hasattr(config, 'WTF_CSRF_TIME_LIMIT')
        assert config.WTF_CSRF_ENABLED is True
        assert config.WTF_CSRF_TIME_LIMIT is None

    def test_development_config_rate_limits(self):
        """Test DevelopmentConfig rate limits are more lenient."""
        config = DevelopmentConfig()
        
        # Development should have more lenient limits
        dev_limits = config.RATE_LIMITS
        assert dev_limits['auth_login'] == '20/minute'  # More lenient than production
        assert dev_limits['auth_signup'] == '10/minute'
        assert dev_limits['post_create'] == '50/hour'

    def test_development_config_cache_timeouts(self):
        """Test DevelopmentConfig cache timeouts are shorter."""
        config = DevelopmentConfig()
        
        # Development should have shorter cache times
        dev_timeouts = config.CACHE_TIMEOUTS
        assert dev_timeouts['user_profile'] == 60  # Shorter than production
        assert dev_timeouts['post_details'] == 30
        assert dev_timeouts['post_scroll'] == 10


class TestConfigIntegration:
    """Integration tests for configuration functionality."""

    def test_config_environment_isolation(self):
        """Test that different configs handle environment variables correctly."""
        # Test base Config
        with patch.dict(os.environ, {
            'DATABASE_URL': 'postgresql://test:5432/db1'
        }):
            base_config = Config()
            assert base_config.SQLALCHEMY_DATABASE_URI == 'postgresql://test:5432/db1'

        # Test ProductionConfig
        with patch.dict(os.environ, {
            'REDIS_URL': 'redis://prod-redis:6379/1'
        }):
            prod_config = ProductionConfig()
            assert prod_config.REDIS_URL == 'redis://prod-redis:6379/1'

        # Test DevelopmentConfig (should override database URL)
        dev_config = DevelopmentConfig()
        assert dev_config.SQLALCHEMY_DATABASE_URI == 'sqlite:///instance/local_dev.db'

    def test_config_attribute_types(self):
        """Test that config attributes have correct types."""
        base_config = Config()
        prod_config = ProductionConfig()
        dev_config = DevelopmentConfig()

        # Test string attributes
        assert isinstance(base_config.SQLALCHEMY_DATABASE_URI, str)
        assert isinstance(prod_config.RATELIMIT_STRATEGY, str)
        assert isinstance(dev_config.SECRET_KEY, str)

        # Test boolean attributes
        assert isinstance(base_config.SQLALCHEMY_TRACK_MODIFICATIONS, bool)
        assert isinstance(base_config.SQLALCHEMY_ECHO, bool)
        assert isinstance(dev_config.DEBUG, bool)
        assert isinstance(dev_config.TESTING, bool)

        # Test dictionary attributes
        assert isinstance(prod_config.RATE_LIMITS, dict)
        assert isinstance(prod_config.CACHE_CONFIG, dict)
        assert isinstance(prod_config.SWAGGER_CONFIG, dict)

    def test_config_required_attributes(self):
        """Test that all configs have required attributes."""
        base_config = Config()
        prod_config = ProductionConfig()
        dev_config = DevelopmentConfig()

        # Base Config required attributes
        required_base = ['SQLALCHEMY_DATABASE_URI', 'SQLALCHEMY_TRACK_MODIFICATIONS', 'SQLALCHEMY_ECHO']
        for attr in required_base:
            assert hasattr(base_config, attr), f"Config missing required attribute: {attr}"

        # Production Config additional required attributes
        required_prod = ['SWAGGER_CONFIG', 'RATE_LIMITS', 'CACHE_CONFIG', 'RATELIMIT_STORAGE_URI']
        for attr in required_prod:
            assert hasattr(prod_config, attr), f"ProductionConfig missing required attribute: {attr}"

        # Development Config additional required attributes
        required_dev = ['DEBUG', 'TESTING', 'WTF_CSRF_ENABLED', 'CACHE_TIMEOUTS']
        for attr in required_dev:
            assert hasattr(dev_config, attr), f"DevelopmentConfig missing required attribute: {attr}"

    def test_config_optional_attributes(self):
        """Test that optional attributes are handled correctly."""
        # Test with no environment variables
        with patch.dict(os.environ, {}, clear=True):
            base_config = Config()
            prod_config = ProductionConfig()

            # Should have fallback values
            assert base_config.SQLALCHEMY_DATABASE_URI is not None
            assert prod_config.REDIS_URL is not None
            assert prod_config.RATELIMIT_STORAGE_URI is not None

    def test_config_environment_override_chain(self):
        """Test that environment variables override config values correctly."""
        with patch.dict(os.environ, {
            'DATABASE_URL': 'postgresql://override:5432/override',
            'REDIS_URL': 'redis://override:6379/override'
        }):
            base_config = Config()
            prod_config = ProductionConfig()

            # Environment should override defaults
            assert base_config.SQLALCHEMY_DATABASE_URI == 'postgresql://override:5432/override'
            assert prod_config.REDIS_URL == 'redis://override:6379/override' 