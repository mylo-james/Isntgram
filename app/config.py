import os

class Config:
    database_url = os.environ.get('DATABASE_URL')
    # Handle postgres:// to postgresql:// conversion for PostgreSQL, but not for SQLite
    if database_url and database_url.startswith('postgres://'):
        SQLALCHEMY_DATABASE_URI = database_url.replace('postgres://', 'postgresql://')
    else:
        SQLALCHEMY_DATABASE_URI = database_url
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.environ.get("SECRET_KEY")
    SQLALCHEMY_ECHO = True

