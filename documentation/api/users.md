# Users API

> User management with profile updates, lookups, and image handling

## Overview

The Users API provides user lookup, profile updates, and image management functionality. All user operations are optimized for performance with proper validation and error handling.

## Base URLs

```http
GET  /api/user/lookup/<username>     # Find user by username
PUT  /api/user                        # Update user profile
GET  /api/user/<id>/resetImg          # Reset profile image
```

## Authentication Required

- **Profile Updates**: Authentication required
- **Image Reset**: Authentication required
- **User Lookup**: Public endpoint

---

## 1. Lookup User by Username

**Endpoint**: `GET /api/user/lookup/<username>`

**Purpose**: Find a user by their username and return basic user information

**Parameters**:
- **username**: Username to search for

**Success Response** (200):
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "full_name": "John Doe",
    "profile_image_url": "https://s3.amazonaws.com/isntgram/profile_1.jpg",
    "bio": "Software developer",
    "created_at": "2025-07-31T10:30:00Z",
    "updated_at": "2025-07-31T10:30:00Z"
  }
}
```

**Error Response** (404):
```json
{
  "error": "User not found"
}
```

**curl Example**:
```bash
curl http://localhost:8080/api/user/lookup/john_doe
```

---

## 2. Update User Profile

**Endpoint**: `PUT /api/user`

**Purpose**: Update current user's profile information

**Request Body**:
```json
{
  "id": 1,
  "username": "new_username",
  "email": "new_email@example.com",
  "full_name": "New Full Name",
  "bio": "Updated bio information"
}
```

**Validation Rules**:
- **id**: Required, must be valid user ID
- **username**: Optional, must be unique if changed
- **email**: Optional, must be valid email format if changed
- **full_name**: Optional, max 255 characters
- **bio**: Optional, max 2000 characters

**Success Response** (200):
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "username": "new_username",
    "email": "new_email@example.com",
    "full_name": "New Full Name",
    "profile_image_url": "https://s3.amazonaws.com/isntgram/profile_1.jpg",
    "bio": "Updated bio information",
    "created_at": "2025-07-31T10:30:00Z",
    "updated_at": "2025-07-31T16:45:00Z"
  }
}
```

**Error Responses**:

**Missing Data** (400):
```json
{
  "error": "Missing required data"
}
```

**User Not Found** (404):
```json
{
  "error": "User not found"
}
```

**Username Already Exists** (401):
```json
{
  "error": "Username already exists"
}
```

**Email Already Exists** (401):
```json
{
  "error": "Email already exists"
}
```

**No Changes Made** (401):
```json
{
  "error": "No changes made"
}
```

**curl Example**:
```bash
curl -X PUT http://localhost:8080/api/user \
  -H "Content-Type: application/json" \
  -H "Cookie: session=your_session_cookie" \
  -d '{
    "id": 1,
    "username": "new_username",
    "email": "new_email@example.com",
    "full_name": "New Full Name",
    "bio": "Updated bio information"
  }'
```

---

## 3. Reset Profile Image

**Endpoint**: `GET /api/user/<id>/resetImg`

**Purpose**: Reset user's profile image to default

**Parameters**:
- **id**: User ID

**Success Response** (200):
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "full_name": "John Doe",
  "profile_image_url": "https://slickpics.s3.us-east-2.amazonaws.com/uploads/FriJul171300242020.png",
  "bio": "Software developer",
  "created_at": "2025-07-31T10:30:00Z",
  "updated_at": "2025-07-31T16:45:00Z"
}
```

**Error Response** (404):
```json
{
  "error": "User not found"
}
```

**curl Example**:
```bash
curl http://localhost:8080/api/user/1/resetImg \
  -H "Cookie: session=your_session_cookie"
```

---

## Error Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 400 | Bad Request | Missing required data |
| 401 | Unauthorized | Username/email already exists or no changes made |
| 404 | Not Found | User not found |
| 500 | Internal Server Error | Server error |

## Common Errors

### Username Already Exists

```json
{
  "error": "Username already exists"
}
```

**Cause**: Attempting to change username to one that already exists

**Solution**: Choose a different username

### Email Already Exists

```json
{
  "error": "Email already exists"
}
```

**Cause**: Attempting to change email to one that already exists

**Solution**: Choose a different email address

### No Changes Made

```json
{
  "error": "No changes made"
}
```

**Cause**: Submitting update request with no actual changes

**Solution**: Only submit requests when making actual changes

## Integration Examples

### JavaScript/Frontend

```javascript
// Lookup user by username
async function lookupUser(username) {
  const response = await fetch(`/api/user/lookup/${username}`);
  const data = await response.json();
  
  if (response.ok) {
    return data.user;
  } else {
    throw new Error(data.error);
  }
}

// Update user profile
async function updateProfile(userData) {
  const response = await fetch('/api/user', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCsrfToken()
    },
    body: JSON.stringify(userData)
  });
  
  const data = await response.json();
  if (response.ok) {
    // Store new access token
    localStorage.setItem('access_token', data.access_token);
    return data.user;
  } else {
    throw new Error(data.error);
  }
}

// Reset profile image
async function resetProfileImage(userId) {
  const response = await fetch(`/api/user/${userId}/resetImg`, {
    headers: {
      'X-CSRFToken': getCsrfToken()
    }
  });
  
  const data = await response.json();
  if (response.ok) {
    return data;
  } else {
    throw new Error(data.error);
  }
}
```

### Python Client

```python
import requests

def lookup_user(username):
    response = requests.get(f'http://localhost:8080/api/user/lookup/{username}')
    
    if response.status_code == 200:
        return response.json()['user']
    else:
        raise Exception(response.json()['error'])

def update_user_profile(user_data):
    response = requests.put('http://localhost:8080/api/user', 
        json=user_data,
        cookies={'session': 'your_session_cookie'})
    
    if response.status_code == 200:
        data = response.json()
        # Store new access token
        return data['user']
    else:
        raise Exception(response.json()['error'])

def reset_profile_image(user_id):
    response = requests.get(f'http://localhost:8080/api/user/{user_id}/resetImg',
        cookies={'session': 'your_session_cookie'})
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(response.json()['error'])
```

## Testing Examples

### User Lookup Test
```bash
# Lookup existing user
curl http://localhost:8080/api/user/lookup/john_doe

# Lookup non-existent user
curl http://localhost:8080/api/user/lookup/nonexistent_user
```

### Profile Update Test
```bash
# Update profile
curl -X PUT http://localhost:8080/api/user \
  -H "Content-Type: application/json" \
  -H "Cookie: session=$SESSION" \
  -d '{
    "id": 1,
    "username": "updated_username",
    "email": "updated@example.com",
    "full_name": "Updated Name",
    "bio": "Updated bio"
  }'
```

### Image Reset Test
```bash
# Reset profile image
curl http://localhost:8080/api/user/1/resetImg \
  -H "Cookie: session=$SESSION"
```

## Performance Considerations

### Database Queries
- **User Lookup**: Optimized with username index
- **Profile Updates**: Efficient single-record updates
- **Image Reset**: Direct field update without complex queries

### Caching Strategy
- **User Data**: Consider caching frequently accessed user profiles
- **Lookup Results**: Cache username lookups for performance
- **Profile Images**: CDN caching for image delivery

### Security Features
- **Input Validation**: All fields validated before database operations
- **Duplicate Prevention**: Checks for username/email conflicts
- **Access Control**: Profile updates require authentication
- **CSRF Protection**: All POST/PUT requests protected

---

**Next**: [Posts API](./posts.md) | [Profile API](./profile.md) | [Authentication API](./authentication.md)
