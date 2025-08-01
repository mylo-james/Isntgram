from __future__ import annotations
from typing import TYPE_CHECKING, Literal
from datetime import datetime

from ..models import db
from sqlalchemy import func, String, Integer, DateTime, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from .user import User

# Type for polymorphic likeable types
LikeableType = Literal["Post", "Comment"]

class Like(db.Model):
    __tablename__ = 'likes'

    # Modern SQLAlchemy 2.0 mapped columns with type annotations
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        Integer, 
        ForeignKey('users.id', ondelete="CASCADE"), 
        nullable=False,
        index=True  # Performance: FK index
    )
    likeable_id: Mapped[int] = mapped_column(Integer, nullable=False)
    likeable_type: Mapped[LikeableType] = mapped_column(String(10), nullable=False)
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
    user: Mapped[User] = relationship("User", back_populates="likes", lazy="joined")

    # Performance indexes for polymorphic queries
    __table_args__ = (
        Index('ix_likes_polymorphic', 'likeable_id', 'likeable_type'),
        Index('ix_likes_user_polymorphic', 'user_id', 'likeable_id', 'likeable_type'),
    )


    def to_dict(self) -> dict[str, any]:
        """Convert like instance to dictionary for API responses."""
        return {
            "id": self.id, 
            "user_id": self.user_id, 
            "likeable_id": self.likeable_id, 
            "likeable_type": self.likeable_type,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    @classmethod
    def get_likes_for_post(cls, post_id: int) -> list[Like]:
        """Optimized query for getting all likes for a specific post."""
        return cls.query.filter_by(
            likeable_id=post_id, 
            likeable_type="Post"
        ).all()

    @classmethod
    def get_likes_for_comment(cls, comment_id: int) -> list[Like]:
        """Optimized query for getting all likes for a specific comment.""" 
        return cls.query.filter_by(
            likeable_id=comment_id, 
            likeable_type="Comment"
        ).all()

    @classmethod
    def user_liked_post(cls, user_id: int, post_id: int) -> bool:
        """Check if user has already liked a specific post."""
        return bool(cls.query.filter_by(
            user_id=user_id,
            likeable_id=post_id,
            likeable_type="Post"
        ).first())

    @classmethod
    def user_liked_comment(cls, user_id: int, comment_id: int) -> bool:
        """Check if user has already liked a specific comment."""
        return bool(cls.query.filter_by(
            user_id=user_id,
            likeable_id=comment_id,
            likeable_type="Comment"
        ).first())
