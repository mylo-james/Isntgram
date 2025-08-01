from __future__ import annotations
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime

from ..models import db
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import func, String, Integer, DateTime, Text
from sqlalchemy.orm import validates, Mapped, mapped_column, relationship
from flask_login import UserMixin

if TYPE_CHECKING:
    from .post import Post
    from .follow import Follow
    from .like import Like
    from .comment import Comment

class User(db.Model, UserMixin):
    __tablename__ = 'users'

    # Modern SQLAlchemy 2.0 mapped columns with type annotations
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    username: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    hashed_password: Mapped[str] = mapped_column(String(128), nullable=False)
    profile_image_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(), 
        onupdate=func.now(),
        nullable=False
    )

    # Modern SQLAlchemy 2.0 relationships with type annotations
    posts: Mapped[List[Post]] = relationship("Post", back_populates="user", lazy="select")
    follows: Mapped[List[Follow]] = relationship("Follow", back_populates="user", lazy="select")
    likes: Mapped[List[Like]] = relationship("Like", back_populates="user", lazy="select")
    comments: Mapped[List[Comment]] = relationship("Comment", back_populates="user", lazy="select")

    @validates('username', 'email')
    def validate_username(self, key: str, value: str) -> str:
        if key == 'username':
            if not value:
                raise AssertionError('Must provide a username!')
            if User.query.filter(User.username == value).first():
                raise AssertionError('Username already exists!')
        if key == 'email':
            if not value:
                raise AssertionError('Must provide an email!')
            if User.query.filter(User.email == value).first():
                raise AssertionError('Email already exists!')

        return value

    @property
    def password(self) -> str:
        return self.hashed_password

    @password.setter
    def password(self, password: str) -> None:
        self.hashed_password = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.hashed_password, password)

    def to_dict(self) -> dict[str, any]:
        """Convert user instance to dictionary for API responses."""
        return {
            "id": self.id, 
            "email": self.email, 
            "full_name": self.full_name, 
            "username": self.username,
            "profile_image_url": self.profile_image_url,
            "bio": self.bio,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
