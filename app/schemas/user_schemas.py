"""
User validation schemas using Pydantic.
Provides type-safe validation for user operations.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserBaseSchema(BaseModel):
    """Base user schema with common fields."""
    model_config = ConfigDict(from_attributes=True, str_strip_whitespace=True)
    
    email: EmailStr = Field(..., description="User's email address")
    full_name: str = Field(..., min_length=1, max_length=255, description="User's full name")
    username: str = Field(
        ..., 
        min_length=3, 
        max_length=30, 
        pattern=r'^[a-zA-Z0-9_]+$',
        description="Username (alphanumeric and underscore only)"
    )
    bio: Optional[str] = Field(None, max_length=2000, description="User bio")


class UserCreateSchema(UserBaseSchema):
    """Schema for creating a new user."""
    password: str = Field(
        ..., 
        min_length=8, 
        max_length=128,
        description="User password (minimum 8 characters)"
    )
    profile_image_url: Optional[str] = Field(None, max_length=255, description="Profile image URL")


class UserUpdateSchema(BaseModel):
    """Schema for updating user information."""
    model_config = ConfigDict(from_attributes=True, str_strip_whitespace=True)
    
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    username: Optional[str] = Field(
        None, 
        min_length=3, 
        max_length=30, 
        pattern=r'^[a-zA-Z0-9_]+$'
    )
    bio: Optional[str] = Field(None, max_length=2000)
    profile_image_url: Optional[str] = Field(None, max_length=255)


class UserResponseSchema(UserBaseSchema):
    """Schema for user API responses."""
    id: int
    profile_image_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    # Security: Never expose password in responses
    # model_config already handles this with from_attributes=True


class UserPublicSchema(BaseModel):
    """Schema for public user information (e.g., in posts/comments)."""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    username: str
    full_name: str
    profile_image_url: Optional[str] = None


class UserStatsSchema(BaseModel):
    """Schema for user statistics."""
    model_config = ConfigDict(from_attributes=True)
    
    posts_count: int = 0
    followers_count: int = 0
    following_count: int = 0
