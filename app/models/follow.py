from __future__ import annotations
from typing import TYPE_CHECKING
from datetime import datetime

from ..models import db
from sqlalchemy import func, Integer, DateTime, ForeignKey, Index, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from .user import User

class Follow(db.Model):
    __tablename__ = 'follows'

    # Modern SQLAlchemy 2.0 mapped columns with type annotations
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        Integer, 
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True  # Performance: FK index
    )
    user_followed_id: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        index=True  # Performance: Common query field
    )
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

    # Modern SQLAlchemy 2.0 relationships
    user: Mapped[User] = relationship("User", back_populates="follows", lazy="joined")

    # Performance indexes and constraints
    __table_args__ = (
        Index('ix_follows_both_users', 'user_id', 'user_followed_id'),
        UniqueConstraint('user_id', 'user_followed_id', name='unique_follow_relationship'),
    )

    def to_dict(self) -> dict[str, any]:
        """Convert follow instance to dictionary for API responses."""
        return {
            "id": self.id, 
            "user_id": self.user_id, 
            "user_followed_id": self.user_followed_id, 
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

    @classmethod
    def is_following(cls, user_id: int, followed_user_id: int) -> bool:
        """Check if user is already following another user."""
        return bool(cls.query.filter_by(
            user_id=user_id,
            user_followed_id=followed_user_id
        ).first())

    @classmethod
    def get_followers_count(cls, user_id: int) -> int:
        """Get count of followers for a user."""
        return cls.query.filter_by(user_followed_id=user_id).count()

    @classmethod
    def get_following_count(cls, user_id: int) -> int:
        """Get count of users being followed by a user."""
        return cls.query.filter_by(user_id=user_id).count()
