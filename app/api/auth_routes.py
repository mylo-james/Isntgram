from flask import Blueprint, jsonify, session, request
from app.models import User, db
from app.schemas.auth_schemas import LoginSchema, SignUpSchema, AuthResponseSchema
from app.schemas.user_schemas import UserResponseSchema
from app.utils.api_utils import (
    handle_validation_error, 
    handle_integrity_error, 
    success_response, 
    error_response,
    ValidationAPIError,
    UnauthorizedAPIError
)
from flask_login import current_user, login_user, logout_user, login_required
from pydantic import ValidationError
from sqlalchemy.exc import IntegrityError
import logging

# Phase 4: Production Features
from app.utils.rate_limiting import smart_rate_limit
from app.utils.documentation import auth_doc
from app.utils.caching import invalidate_user_cache

logger = logging.getLogger(__name__)
auth_routes = Blueprint("session", __name__)


@auth_routes.route("")
def authenticate():
    """
    Authenticates a user.
    """
    if current_user.is_authenticated:
        user_data = UserResponseSchema.model_validate(current_user)
        return success_response({"user": user_data.model_dump()})
    return error_response("Please login", status_code=401)


@auth_routes.route("/login", methods=["POST"])
@smart_rate_limit('auth_login')
@auth_doc("User Login", "Authenticate user with email and password")
def login():
    """
    Logs a user in using modern Pydantic validation.
    Phase 4: Added rate limiting and API documentation.
    """
    try:
        # Parse and validate request data
        login_data = LoginSchema.model_validate(request.get_json())
        
        # Find user by email
        user = User.query.filter(User.email == login_data.email).first()
        
        if user and user.check_password(login_data.password):
            login_user(user)
            user_data = UserResponseSchema.model_validate(user)
            
            # Log successful login
            logger.info(f"User {user.id} ({user.email}) logged in successfully")
            
            return success_response(
                {"user": user_data.model_dump()}, 
                "Login successful"
            )
        else:
            return error_response(
                "Invalid credentials", 
                ["Email or password is incorrect"], 
                401
            )
            
    except ValidationError as e:
        return handle_validation_error(e)
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return error_response("Login failed", status_code=500)


@auth_routes.route("/logout", methods=["POST"])
@smart_rate_limit('auth_logout')
@auth_doc("User Logout", "Log out the current user and clear session")
def logout():
    """
    Logs a user out.
    Phase 4: Added rate limiting and API documentation.
    """
    user_id = getattr(current_user, 'id', None) if current_user.is_authenticated else None
    logout_user()
    
    # Invalidate user cache on logout
    if user_id:
        invalidate_user_cache(user_id)
        logger.info(f"User {user_id} logged out successfully")
    
    return success_response(message="User logged out successfully")


@auth_routes.route("/signup", methods=["POST"])
@smart_rate_limit('auth_signup')
@auth_doc("User Registration", "Create a new user account with comprehensive validation")
def sign_up():
    """
    Creates a new user and logs them in using modern Pydantic validation.
    Phase 4: Added rate limiting and API documentation.
    """
    try:
        # Parse and validate request data
        signup_data = SignUpSchema.model_validate(request.get_json())
        
        # Check if user already exists (additional validation)
        existing_user = User.query.filter(
            (User.email == signup_data.email) | 
            (User.username == signup_data.username)
        ).first()
        
        if existing_user:
            if existing_user.email == signup_data.email:
                return error_response(
                    "Email already exists",
                    ["An account with this email already exists"],
                    400
                )
            else:
                return error_response(
                    "Username already exists", 
                    ["This username is already taken"],
                    400
                )
        
        # Create new user
        user = User(
            username=signup_data.username,
            email=signup_data.email,
            password=signup_data.password,  # This uses the password setter
            full_name=signup_data.full_name,
            bio=signup_data.bio
        )
        
        db.session.add(user)
        db.session.commit()
        
        # Log in the new user
        login_user(user)
        
        user_data = UserResponseSchema.model_validate(user)
        return success_response(
            {"user": user_data.model_dump()}, 
            "Account created successfully"
        ), 201
        
    except ValidationError as e:
        return handle_validation_error(e)
    except IntegrityError as e:
        db.session.rollback()
        return handle_integrity_error(e)
    except Exception as e:
        db.session.rollback()
        logger.error(f"Signup error: {str(e)}")
        return error_response("Account creation failed", status_code=500)


@auth_routes.route("/unauthorized")
def unauthorized():
    """
    Returns unauthorized JSON when flask-login authentication fails
    """
    return error_response("Unauthorized", ["Authentication required"], 401)
