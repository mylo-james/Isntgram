"""
Post validation schemas using Pydantic.
Provides type-safe validation for post operations.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, HttpUrl, ConfigDict

from .user_schemas import UserPublicSchema


class PostBaseSchema(BaseModel):
    """Base post schema with common fields."""
    model_config = ConfigDict(from_attributes=True, str_strip_whitespace=True)
    
    image_url: str = Field(..., max_length=2000, description="Post image URL")
    caption: Optional[str] = Field(None, max_length=2000, description="Post caption")


class PostCreateSchema(PostBaseSchema):
    """Schema for creating a new post."""
    # user_id will be extracted from JWT token, not from request body
    pass


class PostUpdateSchema(BaseModel):
    """Schema for updating post information."""
    model_config = ConfigDict(from_attributes=True, str_strip_whitespace=True)
    
    caption: Optional[str] = Field(None, max_length=2000, description="Updated post caption")


class PostResponseSchema(PostBaseSchema):
    """Schema for post API responses."""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime


class PostWithUserSchema(PostResponseSchema):
    """Schema for post with user information."""
    user: UserPublicSchema


class PostStatsSchema(BaseModel):
    """Schema for post statistics."""
    model_config = ConfigDict(from_attributes=True)
    
    likes_count: int = 0
    comments_count: int = 0


class PostDetailSchema(PostWithUserSchema):
    """Schema for detailed post information with stats."""
    stats: PostStatsSchema
