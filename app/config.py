import os

uri = os.environ.get("DATABASE_URL") or "postgresql://insta_admin:password@localhost/insta_app"

if uri.startswith("postgres://"):
    uri=uri.replace('postgres://', "postgresql://", 1)

class Configuration:
    SQLALCHEMY_DATABASE_URI = uri
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.environ.get("SECRET_KEY")
