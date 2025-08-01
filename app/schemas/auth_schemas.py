"""
Authentication validation schemas using Pydantic.
Replaces WTForms with modern validation for auth operations.
"""

from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator
import re


class LoginSchema(BaseModel):
    """Schema for user login."""
    model_config = ConfigDict(str_strip_whitespace=True)
    
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., min_length=1, description="User password")


class SignUpSchema(BaseModel):
    """Schema for user registration with comprehensive validation."""
    model_config = ConfigDict(str_strip_whitespace=True)
    
    username: str = Field(
        ..., 
        min_length=3, 
        max_length=30, 
        pattern=r'^[a-zA-Z0-9_]+$',
        description="Username (alphanumeric and underscore only)"
    )
    email: EmailStr = Field(..., description="User's email address")
    full_name: str = Field(..., min_length=1, max_length=255, description="User's full name")
    password: str = Field(..., min_length=8, max_length=128, description="User password")
    confirm_password: str = Field(..., description="Password confirmation")
    bio: Optional[str] = Field(None, max_length=2000, description="User bio")
    
    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """Validate password meets security requirements."""
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain a lowercase letter")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain an uppercase letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain a number")
        return v
    
    @field_validator('confirm_password')
    @classmethod
    def validate_passwords_match(cls, v: str, info) -> str:
        """Validate password confirmation matches password."""
        if 'password' in info.data and v != info.data['password']:
            raise ValueError("Passwords must match")
        return v


class PasswordResetRequestSchema(BaseModel):
    """Schema for password reset request."""
    model_config = ConfigDict(str_strip_whitespace=True)
    
    email: EmailStr = Field(..., description="Email address for password reset")


class PasswordResetSchema(BaseModel):
    """Schema for password reset with token."""
    model_config = ConfigDict(str_strip_whitespace=True)
    
    token: str = Field(..., description="Password reset token")
    password: str = Field(..., min_length=8, max_length=128, description="New password")
    confirm_password: str = Field(..., description="Password confirmation")
    
    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """Validate password meets security requirements."""
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain a lowercase letter")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain an uppercase letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain a number")
        return v
    
    @field_validator('confirm_password')
    @classmethod
    def validate_passwords_match(cls, v: str, info) -> str:
        """Validate password confirmation matches password."""
        if 'password' in info.data and v != info.data['password']:
            raise ValueError("Passwords must match")
        return v


class AuthResponseSchema(BaseModel):
    """Schema for authentication responses."""
    model_config = ConfigDict(from_attributes=True)
    
    user: dict
    message: str
    success: bool = True
