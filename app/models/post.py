from __future__ import annotations
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime

from ..models import db
from sqlalchemy import func, String, Integer, DateTime, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from .user import User
    from .comment import Comment

class Post(db.Model):
    __tablename__ = "posts"

    # Modern SQLAlchemy 2.0 mapped columns with type annotations
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        Integer, 
        ForeignKey("users.id", ondelete="CASCADE"), 
        nullable=False,
        index=True  # Performance: FK index
    )
    image_url: Mapped[str] = mapped_column(String(2000), nullable=False)
    caption: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        nullable=False,
        index=True  # Performance: Common query field
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Modern SQLAlchemy 2.0 relationships with optimized loading
    user: Mapped[User] = relationship("User", back_populates="posts", lazy="joined")
    comments: Mapped[List[Comment]] = relationship(
        "Comment", 
        back_populates="post", 
        lazy="select",
        cascade="all, delete-orphan"
    )

    def to_dict(self) -> dict[str, any]:
        """Convert post instance to dictionary for API responses."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "image_url": self.image_url,
            "caption": self.caption,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def to_dict_with_user(self) -> dict[str, any]:
        """Convert post with user data for API responses (optimized with joined loading)."""
        base_dict = self.to_dict()
        if self.user:
            base_dict["user"] = self.user.to_dict()
        return base_dict
