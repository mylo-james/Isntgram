# Getting Started Guide

> Set up the Isntgram backend in under 5 minutes

## Prerequisites

- **Python 3.11+** (recommended: 3.11.6)
- **Git** for version control
- **Optional**: Redis for caching (will use memory fallback if not available)

## Quick Setup (5 Minutes)

### 1. Clone Repository
```bash
git clone https://github.com/mylo-james/Isntgram.git
cd Isntgram
```

### 2. Set Up Python Environment
```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On macOS/Linux:
source .venv/bin/activate
# On Windows:
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Initialize Database
```bash
# Create database tables
flask db upgrade

# Optional: Seed with test data
flask db seed
```

### 4. Start Development Server
```bash
# Start backend server
flask run --port 8080

# Server will be available at:
# http://localhost:8080
```

### 5. Verify Installation
```bash
# Test API health
curl http://localhost:8080/api/auth

# Expected response:
# {"error": "Please login", "success": false}

# Access interactive API docs
open http://localhost:8080/api/docs/
```

## Environment Configuration

### Required Environment Variables
Create a `.env` file in the project root:

```bash
# Flask Configuration
FLASK_APP=app
FLASK_ENV=development
SECRET_KEY=your-secret-key-here

# Database (optional - defaults to SQLite)
DATABASE_URL=sqlite:///instance/local_dev.db

# AWS S3 (optional for development)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET=your-bucket-name

# Redis (optional - will use memory fallback)
REDIS_URL=redis://localhost:6379/0
```

### Development vs Production Config
The application automatically detects the environment:

- **Development**: Uses SQLite, memory cache fallback, debug logging
- **Production**: Requires PostgreSQL, Redis, proper secret keys

## Project Structure

```
isntgram/
├── app/                        # Main application package
│   ├── __init__.py            # Flask app factory
│   ├── api/                   # API blueprint routes
│   │   ├── auth_routes.py     # Authentication endpoints
│   │   ├── post_routes.py     # Post CRUD operations
│   │   └── ...
│   ├── models/                # SQLAlchemy models
│   │   ├── user.py           # User model
│   │   ├── post.py           # Post model
│   │   └── ...
│   ├── schemas/               # Pydantic validation schemas
│   │   ├── auth_schemas.py   # Authentication validation
│   │   └── ...
│   ├── utils/                 # Utility modules
│   │   ├── rate_limiting.py  # Rate limiting utilities
│   │   ├── caching.py        # Cache management
│   │   └── ...
│   └── config/                # Configuration modules
├── migrations/                # Database migration files
├── documentation/             # API documentation
├── tests/                     # Test suite
└── requirements.txt          # Python dependencies
```

## Development Workflow

### 1. Making API Changes

**Add New Endpoint**:
```python
# app/api/new_routes.py
from flask import Blueprint
from ..utils.rate_limiting import smart_rate_limit
from ..utils.documentation import api_doc

new_routes = Blueprint("new_feature", __name__)

@new_routes.route("/endpoint", methods=["POST"])
@smart_rate_limit('new_endpoint')
@api_doc(summary="New endpoint", description="Description here")
def new_endpoint():
    # Implementation
    pass
```

**Register Blueprint**:
```python
# app/__init__.py
from .api.new_routes import new_routes
app.register_blueprint(new_routes, url_prefix='/api/new')
```

### 2. Database Changes

**Create Migration**:
```bash
# Generate migration after model changes
flask db migrate -m "Add new field to User model"

# Apply migration
flask db upgrade
```

**Add New Model**:
```python
# app/models/new_model.py
from sqlalchemy.orm import Mapped, mapped_column
from . import db

class NewModel(db.Model):
    __tablename__ = 'new_models'
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(unique=True)
```

### 3. Testing Changes

```bash
# Run all tests
pytest

# Run specific test file
pytest app/tests/test_auth_routes.py

# Run with coverage
pytest --cov=app

# Performance testing
flask db test-n1
```

## Common Development Tasks

### Creating a New User (API)
```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "developer",
    "email": "dev@example.com",
            "full_name": "Developer User",
        "password": "DevPassword123",
        "confirm_password": "DevPassword123"
  }'
```

### Uploading an Image
```bash
# Upload image file
curl -X POST http://localhost:8080/api/aws/upload \
  -H "Cookie: session=your_session_cookie" \
  -F "image=@path/to/image.jpg"

# Response includes image URL for post creation
```

### Creating a Post
```bash
curl -X POST http://localhost:8080/api/post \
  -H "Content-Type: application/json" \
  -H "Cookie: session=your_session_cookie" \
  -d '{
    "caption": "My first post!",
            "image_url": "https://s3.amazonaws.com/bucket/image.jpg"
  }'
```

## Development Tools

### Flask CLI Commands

```bash
# Database operations
flask db upgrade              # Apply migrations
flask db migrate             # Create new migration
flask db seed                # Seed with test data
flask db test-n1             # Test N+1 query prevention

# Performance tools
flask perf health-check      # System health check
flask perf test-indexes      # Test database indexes

# Cache management
flask cache clear            # Clear all cache
flask cache stats            # Cache statistics
```

### VS Code Tasks

The project includes pre-configured VS Code tasks:

- **Start Flask Backend**: `Ctrl+Shift+P` → "Run Task" → "Start Flask Backend"
- **Start React Frontend**: Run React development server
- **Full Development Stack**: Start both backend and frontend

### Debugging

**Enable Debug Mode**:
```bash
flask run --debug
```

**Debug Configuration** (VSCode):
```json
{
  "name": "Flask Debug",
  "type": "python",
  "request": "launch",
  "program": "${workspaceFolder}/.venv/bin/flask",
  "args": ["run", "--debug"],
  "env": {"FLASK_APP": "app"},
  "console": "integratedTerminal"
}
```

## Performance Monitoring

### Built-in Monitoring
- **Query Performance**: Automatic logging of slow queries (>10ms)
- **API Response Times**: Built-in request timing
- **Cache Hit Rates**: Redis cache statistics
- **Rate Limiting Status**: Request quota monitoring

### Health Checks
```bash
# Quick health check
flask perf health-check

# Database performance
flask db analyze

# Cache status
curl http://localhost:8080/api/health/cache
```

## Troubleshooting

### Common Issues

**Port 8080 Already in Use**:
```bash
# Find process using port 8080
lsof -i :8080

# Kill process or use different port
flask run --port 8081
```

**Database Issues**:
```bash
# Reset database
rm instance/local_dev.db
flask db upgrade
flask db seed
```

**Redis Connection Failed**:
- Redis is optional in development
- Application will use memory fallback
- Install Redis for full feature testing:
  ```bash
  # macOS
  brew install redis
  brew services start redis
  
  # Ubuntu
  sudo apt install redis-server
  sudo systemctl start redis
  ```

**Module Import Errors**:
```bash
# Ensure virtual environment is activated
source .venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

### Getting Help

1. **Check Logs**: Flask debug mode provides detailed error messages
2. **API Documentation**: Visit `/api/docs/` for interactive testing
3. **Performance Issues**: Run `flask perf health-check`
4. **Database Problems**: Check `flask db --help` for database commands

## Next Steps

Once you have the backend running:

1. **Explore API Documentation**: Visit `http://localhost:8080/api/docs/`
2. **Read Architecture Guide**: [System Overview](../architecture/overview.md)
3. **Set Up Frontend**: Follow React frontend setup guide
4. **Learn Testing**: [Testing Guide](./testing.md)
5. **Deploy to Production**: [Deployment Guide](./deployment.md)

---

**Related Guides**:
- [API Documentation](../api/authentication.md)
- [Architecture Overview](../architecture/overview.md)
- [Testing Guide](./testing.md)