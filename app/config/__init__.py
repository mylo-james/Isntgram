"""Configuration package for production features."""
import os

# Original Config class
class Config:
    database_url = os.environ.get('DATABASE_URL')
    # Handle postgres:// to postgresql:// conversion for PostgreSQL, but not for SQLite
    if database_url and database_url.startswith('postgres://'):
        SQLALCHEMY_DATABASE_URI = database_url.replace('postgres://', 'postgresql://')
    elif database_url:
        SQLALCHEMY_DATABASE_URI = database_url
    else:
        SQLALCHEMY_DATABASE_URI = "sqlite:///instance/local_dev.db"
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = True
    JWT_ACCESS_LIFESPAN = {'hours': 24}
    JWT_REFRESH_LIFESPAN = {'days': 30}

# Import production configurations
from .production import DevelopmentConfig, ProductionConfig

__all__ = ['Config', 'DevelopmentConfig', 'ProductionConfig']
