from __future__ import annotations
from typing import TYPE_CHECKING
from datetime import datetime

from ..models import db
from sqlalchemy import func, String, Integer, DateTime, Text, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from .user import User
    from .post import Post

class Comment(db.Model):
    __tablename__ = 'comments'

    # Modern SQLAlchemy 2.0 mapped columns with type annotations
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        Integer, 
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True  # Performance: FK index
    )
    post_id: Mapped[int] = mapped_column(
        Integer, 
        ForeignKey("posts.id", ondelete="CASCADE"), 
        nullable=False,
        index=True  # Performance: FK index
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
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

    # Modern SQLAlchemy 2.0 relationships with optimized loading
    user: Mapped[User] = relationship("User", back_populates="comments", lazy="joined")
    post: Mapped[Post] = relationship("Post", back_populates="comments", lazy="select")

    # Performance indexes for common queries
    __table_args__ = (
        Index('ix_comments_post_created', 'post_id', 'created_at'),
    )

    def to_dict(self) -> dict[str, any]:
        """Convert comment instance to dictionary for API responses."""
        return {
            "id": self.id, 
            "user_id": self.user_id, 
            "post_id": self.post_id, 
            "created_at": self.created_at.isoformat() if self.created_at else None, 
            "content": self.content
        }

    def to_dict_with_user(self) -> dict[str, any]:
        """Convert comment with user data for API responses (optimized with joined loading)."""
        base_dict = self.to_dict()
        if self.user:
            base_dict["user"] = self.user.to_dict()
        return base_dict
