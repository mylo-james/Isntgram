import os

class Config:
    database_url = os.environ.get('DATABASE_URL')
    # Handle postgres:// to postgresql:// conversion for PostgreSQL, but not for SQLite
    if database_url and database_url.startswith('postgres://'):
        SQLALCHEMY_DATABASE_URI = database_url.replace('postgres://', 'postgresql://')
    elif database_url:
        SQLALCHEMY_DATABASE_URI = database_url
    else:
        # Fallback to local SQLite database for development
        SQLALCHEMY_DATABASE_URI = 'sqlite:///instance/local_dev.db'
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.environ.get("SECRET_KEY")
    SQLALCHEMY_ECHO = True

