"""
Modern validation schemas using Pydantic for Instagram clone.
Provides type-safe data validation and serialization.
"""

from .user_schemas import UserCreateSchema, UserUpdateSchema, UserResponseSchema
from .post_schemas import PostCreateSchema, PostUpdateSchema, PostResponseSchema
from .like_schemas import LikeCreateSchema, LikeResponseSchema
from .auth_schemas import LoginSchema, SignUpSchema, AuthResponseSchema

__all__ = [
    "UserCreateSchema",
    "UserUpdateSchema", 
    "UserResponseSchema",
    "PostCreateSchema",
    "PostUpdateSchema",
    "PostResponseSchema",
    "LikeCreateSchema",
    "LikeResponseSchema",
    "LoginSchema",
    "SignUpSchema",
    "AuthResponseSchema",
]
