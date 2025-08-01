"""
Like validation schemas using Pydantic.
Provides type-safe validation for like operations.
"""

from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field, ConfigDict

from .user_schemas import UserPublicSchema

# Type-safe likeable types
LikeableType = Literal["Post", "Comment"]


class LikeCreateSchema(BaseModel):
    """Schema for creating a new like."""
    model_config = ConfigDict(from_attributes=True)
    
    likeable_id: int = Field(..., description="ID of the item being liked")
    likeable_type: LikeableType = Field(..., description="Type of item being liked")
    # user_id will be extracted from JWT token, not from request body


class LikeResponseSchema(BaseModel):
    """Schema for like API responses."""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    user_id: int
    likeable_id: int
    likeable_type: LikeableType
    created_at: datetime


class LikeWithUserSchema(LikeResponseSchema):
    """Schema for like with user information."""
    user: UserPublicSchema


class LikeStatsSchema(BaseModel):
    """Schema for aggregated like statistics."""
    model_config = ConfigDict(from_attributes=True)
    
    total_likes: int = 0
    user_liked: bool = False  # Whether the current user has liked this item
