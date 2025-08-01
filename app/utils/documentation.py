"""
API Documentation utilities using Flasgger for Swagger/OpenAPI.
Provides decorators and schemas for comprehensive API documentation.
"""

from functools import wraps
from typing import Dict, Any, List, Optional, Union
from flasgger import Swagger
from flasgger.utils import swag_from
import yaml
import json
import logging

logger = logging.getLogger(__name__)


class APIDocumentationManager:
    """Centralized API documentation management."""
    
    def __init__(self):
        self.swagger: Optional[Swagger] = None
        self.api_specs: Dict[str, Any] = {}
    
    def init_app(self, app):
        """Initialize Swagger documentation with Flask app."""
        try:
            swagger_config = app.config.get('SWAGGER_CONFIG', {})
            swagger_template = app.config.get('SWAGGER_TEMPLATE', {})
            
            self.swagger = Swagger(
                app,
                config=swagger_config,
                template=swagger_template
            )
            
            app.extensions['api_docs'] = self
            logger.info("✅ API documentation (Swagger) initialized successfully")
            logger.info(f"📖 API docs available at: /api/docs/")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize API documentation: {e}")
    
    def register_spec(self, endpoint: str, spec: Dict[str, Any]):
        """Register an API specification for an endpoint."""
        self.api_specs[endpoint] = spec


# Global documentation manager
api_docs = APIDocumentationManager()


def api_doc(
    summary: str,
    description: Optional[str] = None,
    tags: Optional[List[str]] = None,
    parameters: Optional[List[Dict]] = None,
    responses: Optional[Dict[str, Dict]] = None,
    security: Optional[List[Dict]] = None,
    consumes: Optional[List[str]] = None,
    produces: Optional[List[str]] = None
):
    """
    Decorator for API endpoint documentation.
    
    Args:
        summary: Brief summary of the endpoint
        description: Detailed description
        tags: List of tags for grouping
        parameters: List of parameter definitions
        responses: Response definitions by status code
        security: Security requirements
        consumes: Content types the endpoint accepts
        produces: Content types the endpoint returns
    """
    def decorator(func):
        # Build the Swagger specification
        spec = {
            'summary': summary,
            'operationId': f"{func.__module__}.{func.__name__}",
            'tags': tags or ['API'],
            'parameters': parameters or [],
            'responses': responses or {
                '200': {'description': 'Success'},
                '400': {'description': 'Bad Request'},
                '401': {'description': 'Unauthorized'},
                '500': {'description': 'Internal Server Error'}
            }
        }
        
        if description:
            spec['description'] = description
        if security:
            spec['security'] = security
        if consumes:
            spec['consumes'] = consumes
        if produces:
            spec['produces'] = produces
        
        # Add the spec to the function
        func.__swagger_spec__ = spec
        
        @wraps(func)
        def wrapper(*args, **kwargs):
            return func(*args, **kwargs)
        
        return wrapper
    
    return decorator


# Common parameter definitions
COMMON_PARAMETERS = {
    'auth_header': {
        'name': 'Authorization',
        'in': 'header',
        'type': 'string',
        'required': True,
        'description': 'Bearer token for authentication'
    },
    'user_id_path': {
        'name': 'user_id',
        'in': 'path',
        'type': 'integer',
        'required': True,
        'description': 'User ID'
    },
    'post_id_path': {
        'name': 'post_id',
        'in': 'path',
        'type': 'integer',
        'required': True,
        'description': 'Post ID'
    },
    'pagination_length': {
        'name': 'length',
        'in': 'path',
        'type': 'integer',
        'required': True,
        'description': 'Number of items already loaded (for pagination)'
    },
    'search_query': {
        'name': 'q',
        'in': 'query',
        'type': 'string',
        'required': True,
        'description': 'Search query string'
    }
}

# Common response schemas
COMMON_RESPONSES = {
    'success_response': {
        'type': 'object',
        'properties': {
            'success': {'type': 'boolean', 'example': True},
            'message': {'type': 'string', 'example': 'Operation completed successfully'},
            'data': {'type': 'object'}
        }
    },
    'error_response': {
        'type': 'object',
        'properties': {
            'error': {'type': 'string', 'example': 'Error message'},
            'success': {'type': 'boolean', 'example': False},
            'details': {'type': 'object'}
        }
    },
    'validation_error': {
        'type': 'object',
        'properties': {
            'error': {'type': 'string', 'example': 'Validation failed'},
            'details': {
                'type': 'array',
                'items': {
                    'type': 'object',
                    'properties': {
                        'field': {'type': 'string'},
                        'message': {'type': 'string'}
                    }
                }
            }
        }
    },
    'user_schema': {
        'type': 'object',
        'properties': {
            'id': {'type': 'integer', 'example': 1},
            'username': {'type': 'string', 'example': 'john_doe'},
            'email': {'type': 'string', 'example': 'john@example.com'},
            'fullName': {'type': 'string', 'example': 'John Doe'},
            'bio': {'type': 'string', 'example': 'Software developer'},
            'profileImageUrl': {'type': 'string', 'example': 'https://s3.example.com/image.jpg'},
            'followersCount': {'type': 'integer', 'example': 150},
            'followingCount': {'type': 'integer', 'example': 200},
            'postsCount': {'type': 'integer', 'example': 25},
            'createdAt': {'type': 'string', 'format': 'date-time'},
            'updatedAt': {'type': 'string', 'format': 'date-time'}
        }
    },
    'post_schema': {
        'type': 'object',
        'properties': {
            'id': {'type': 'integer', 'example': 1},
            'caption': {'type': 'string', 'example': 'Beautiful sunset!'},
            'imageUrl': {'type': 'string', 'example': 'https://s3.example.com/post.jpg'},
            'likesCount': {'type': 'integer', 'example': 42},
            'commentsCount': {'type': 'integer', 'example': 8},
            'isLiked': {'type': 'boolean', 'example': False},
            'user': {'$ref': '#/definitions/User'},
            'createdAt': {'type': 'string', 'format': 'date-time'},
            'updatedAt': {'type': 'string', 'format': 'date-time'}
        }
    }
}


def auth_doc(summary: str, description: Optional[str] = None, **kwargs):
    """Decorator for authentication endpoints - simplified for Flasgger."""
    def decorator(func):
        # Set up a simple docstring that Flasgger can parse
        func.__doc__ = f"""
        {summary}
        ---
        tags:
          - Authentication
        consumes:
          - application/json
        produces:
          - application/json
        responses:
          200:
            description: Success
          400:
            description: Validation Error
          401:
            description: Unauthorized
          429:
            description: Rate limit exceeded
          500:
            description: Internal Server Error
        """
        return func
    return decorator


def post_doc(summary: str, description: Optional[str] = None, requires_auth: bool = True):
    """Decorator for post-related endpoints."""
    parameters = []
    security = []
    
    if requires_auth:
        parameters.append(COMMON_PARAMETERS['auth_header'])
        security.append({'Bearer': []})
    
    return api_doc(
        summary=summary,
        description=description,
        tags=['Posts'],
        parameters=parameters,
        security=security,
        produces=['application/json'],
        responses={
            '200': {
                'description': 'Success',
                'schema': {
                    'type': 'object',
                    'properties': {
                        'post': COMMON_RESPONSES['post_schema'],
                        'posts': {
                            'type': 'array',
                            'items': COMMON_RESPONSES['post_schema']
                        }
                    }
                }
            },
            '400': {'description': 'Bad Request'},
            '401': {'description': 'Unauthorized'},
            '403': {'description': 'Forbidden'},
            '404': {'description': 'Not Found'},
            '500': {'description': 'Internal Server Error'}
        }
    )


def user_doc(summary: str, description: Optional[str] = None, requires_auth: bool = True):
    """Decorator for user-related endpoints."""
    parameters = []
    security = []
    
    if requires_auth:
        parameters.append(COMMON_PARAMETERS['auth_header'])
        security.append({'Bearer': []})
    
    return api_doc(
        summary=summary,
        description=description,
        tags=['Users'],
        parameters=parameters,
        security=security,
        produces=['application/json'],
        responses={
            '200': {
                'description': 'Success',
                'schema': {
                    'type': 'object',
                    'properties': {
                        'user': COMMON_RESPONSES['user_schema'],
                        'users': {
                            'type': 'array',
                            'items': COMMON_RESPONSES['user_schema']
                        }
                    }
                }
            },
            '400': {'description': 'Bad Request'},
            '401': {'description': 'Unauthorized'},
            '404': {'description': 'Not Found'},
            '500': {'description': 'Internal Server Error'}
        }
    )


def paginated_doc(summary: str, description: Optional[str] = None):
    """Decorator for paginated endpoints."""
    return api_doc(
        summary=summary,
        description=description,
        tags=['Pagination'],
        parameters=[
            COMMON_PARAMETERS['auth_header'],
            COMMON_PARAMETERS['pagination_length']
        ],
        security=[{'Bearer': []}],
        produces=['application/json'],
        responses={
            '200': {
                'description': 'Success',
                'schema': {
                    'type': 'object',
                    'properties': {
                        'posts': {
                            'type': 'array',
                            'items': COMMON_RESPONSES['post_schema']
                        },
                        'hasMore': {'type': 'boolean'},
                        'totalCount': {'type': 'integer'}
                    }
                }
            },
            '400': {'description': 'Bad Request'},
            '401': {'description': 'Unauthorized'},
            '500': {'description': 'Internal Server Error'}
        }
    )


def file_upload_doc(summary: str, description: Optional[str] = None):
    """Decorator for file upload endpoints."""
    return api_doc(
        summary=summary,
        description=description,
        tags=['File Upload'],
        parameters=[
            COMMON_PARAMETERS['auth_header'],
            {
                'name': 'file',
                'in': 'formData',
                'type': 'file',
                'required': True,
                'description': 'Image file to upload'
            }
        ],
        security=[{'Bearer': []}],
        consumes=['multipart/form-data'],
        produces=['application/json'],
        responses={
            '200': {
                'description': 'File uploaded successfully',
                'schema': {
                    'type': 'object',
                    'properties': {
                        'url': {'type': 'string', 'example': 'https://s3.example.com/image.jpg'},
                        'filename': {'type': 'string', 'example': 'image_123456.jpg'}
                    }
                }
            },
            '400': {'description': 'Bad Request'},
            '401': {'description': 'Unauthorized'},
            '413': {'description': 'File too large'},
            '500': {'description': 'Internal Server Error'}
        }
    )
