"""
Comment validation schemas using Pydantic.
Provides type-safe validation for comment operations.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

from .user_schemas import UserPublicSchema


class CommentBaseSchema(BaseModel):
    """Base comment schema with common fields."""
    model_config = ConfigDict(from_attributes=True, str_strip_whitespace=True)
    
    content: str = Field(
        ..., 
        min_length=1, 
        max_length=2000, 
        description="Comment content"
    )


class CommentCreateSchema(CommentBaseSchema):
    """Schema for creating a new comment."""
    post_id: int = Field(..., description="ID of the post being commented on")
    # user_id will be extracted from JWT token, not from request body


class CommentUpdateSchema(BaseModel):
    """Schema for updating comment content."""
    model_config = ConfigDict(from_attributes=True, str_strip_whitespace=True)
    
    content: str = Field(
        ..., 
        min_length=1, 
        max_length=2000, 
        description="Updated comment content"
    )


class CommentResponseSchema(CommentBaseSchema):
    """Schema for comment API responses."""
    id: int
    user_id: int
    post_id: int
    created_at: datetime
    updated_at: datetime


class CommentWithUserSchema(CommentResponseSchema):
    """Schema for comment with user information."""
    user: UserPublicSchema


class CommentStatsSchema(BaseModel):
    """Schema for comment statistics."""
    model_config = ConfigDict(from_attributes=True)
    
    likes_count: int = 0


class CommentDetailSchema(CommentWithUserSchema):
    """Schema for detailed comment information with stats."""
    stats: CommentStatsSchema
