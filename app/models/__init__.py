from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .comment import Comment
from .follow import Follow
from .like import Like
from .post import Post
from .user import User
