# Authentication API

> Modern JWT + Flask-Login authentication with CSRF protection and rate limiting

## Overview

The authentication system combines JWT tokens for API access with Flask-Login sessions for web interface compatibility. All authentication endpoints are protected by rate limiting and CSRF validation.

## Base URL

```
GET  /api/auth                    # Check authentication status
POST /api/auth/login              # User login
POST /api/auth/signup             # User registration  
POST /api/auth/logout             # User logout
GET  /api/auth/unauthorized       # Unauthorized response
```

## Rate Limiting

- **Login**: 5 attempts per minute per IP/user
- **Signup**: 3 attempts per minute per IP  
- **Logout**: 10 attempts per minute per user

## Authentication Flow

### 1. User Registration

**Endpoint**: `POST /api/auth/signup`

**Request Body**:

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "full_name": "John Doe",
  "password": "SecurePassword123",
  "confirm_password": "SecurePassword123",
  "bio": "Software developer" // optional
}
```

**Validation Rules**:

- **Username**: 3-30 characters, alphanumeric + underscore only (`^[a-zA-Z0-9_]+$`)
- **Email**: Valid email format
- **Password**: Minimum 8 characters, maximum 128 characters, must contain:
  - Lowercase letter
  - Uppercase letter  
  - Number
- **Confirm Password**: Must match password exactly
- **Full Name**: 1-255 characters, required
- **Bio**: Optional, maximum 2000 characters

**Success Response** (201):

```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "full_name": "John Doe",
      "bio": "Software developer",
      "profile_image_url": null,
      "created_at": "2025-07-31T10:30:00Z",
      "updated_at": "2025-07-31T10:30:00Z"
    }
  }
}
```

**Error Response** (400):

```json
{
  "error": "Validation failed",
  "success": false,
  "details": [
    {
      "field": "password",
      "message": "Password must contain an uppercase letter"
    }
  ]
}
```

**curl Example**:

```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "full_name": "John Doe", 
    "password": "SecurePassword123",
    "confirm_password": "SecurePassword123"
  }'
```

### 2. User Login

**Endpoint**: `POST /api/auth/login`

**Request Body**:

```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Success Response** (200):

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "full_name": "John Doe",
      "bio": "Software developer",
      "profile_image_url": null,
      "created_at": "2025-07-31T10:30:00Z",
      "updated_at": "2025-07-31T10:30:00Z"
    }
  }
}
```

**Error Response** (401):

```json
{
  "error": "Invalid credentials",
  "success": false,
  "details": ["Email or password is incorrect"]
}
```

**curl Example**:

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123"
  }'
```

### 3. Check Authentication Status

**Endpoint**: `GET /api/auth`

**Success Response** (200):

```json
{
  "success": true,
  "message": "User is authenticated",
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "full_name": "John Doe"
    }
  }
}
```

**Unauthenticated Response** (401):

```json
{
  "error": "Please login",
  "success": false
}
```

**curl Example**:

```bash
curl http://localhost:8080/api/auth \
  -H "Cookie: session=your_session_cookie"
```

### 4. User Logout

**Endpoint**: `POST /api/auth/logout`

**Success Response** (200):

```json
{
  "success": true,
  "message": "User logged out successfully"
}
```

**curl Example**:

```bash
curl -X POST http://localhost:8080/api/auth/logout \
  -H "Cookie: session=your_session_cookie"
```

### 5. Unauthorized Response

**Endpoint**: `GET /api/auth/unauthorized`

**Response** (401):

```json
{
  "error": "Unauthorized",
  "success": false,
  "details": ["Authentication required"]
}
```

**Purpose**: Returns standardized unauthorized JSON when Flask-Login authentication fails

**curl Example**:

```bash
curl http://localhost:8080/api/auth/unauthorized
```

## Security Features

### CSRF Protection

All POST endpoints require CSRF tokens:

```http
Cookie: csrf_token=abc123...
X-CSRFToken: abc123...
```

The CSRF token is automatically set in cookies upon visiting the application.

### Rate Limiting Headers

Responses include rate limiting information:

```http
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 4
X-RateLimit-Reset: 1627742400
```

### Session Management

- **Session Cookie**: Secure, HttpOnly, SameSite=Strict
- **Expiration**: Configurable (default: browser session)
- **Storage**: Server-side session storage

## Error Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | User account created |
| 400 | Bad Request | Validation failed |
| 401 | Unauthorized | Authentication required |
| 409 | Conflict | Username/email already exists |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

## Common Errors

### Username Already Exists

```json
{
  "error": "Username already exists",
  "success": false,
  "details": ["This username is already taken"]
}
```

### Email Already Exists

```json
{
  "error": "Email already exists", 
  "success": false,
  "details": ["An account with this email already exists"]
}
```

### Rate Limit Exceeded

```json
{
  "error": "Rate limit exceeded",
  "success": false,
  "message": "Too many requests. Please try again later.",
  "retryAfter": 60
}
```

## Integration Examples

### JavaScript/Frontend

```javascript
// Login function
async function login(email, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCsrfToken()
    },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  if (data.success) {
    // User logged in successfully
    return data.user;
  } else {
    throw new Error(data.error);
  }
}
```

### Python Client

```python
import requests

def signup(username, email, full_name, password):
    response = requests.post('http://localhost:8080/api/auth/signup', 
        json={
            'username': username,
            'email': email, 
            'full_name': full_name,
            'password': password,
            'confirm_password': password
        })
    
    if response.status_code == 201:
        return response.json()['data']['user']
    else:
        raise Exception(response.json()['error'])
```

## Testing

### Unit Tests

```bash
# Run authentication tests
pytest app/tests/test_auth_routes.py -v

# Test specific scenarios
pytest app/tests/test_auth_routes.py::test_signup_validation -v
```

### Performance Testing

```bash
# Check rate limiting
for i in {1..10}; do
  curl -X POST http://localhost:8080/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' &
done
```

## Interactive Testing

Visit the [Swagger UI](http://localhost:8080/api/docs/) for interactive API testing with a visual interface.

---

**Next**: [Posts API](./posts.md) | [Users API](./users.md) | [Architecture Overview](../architecture/overview.md)
