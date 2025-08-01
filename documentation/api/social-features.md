# Social Features API

> Follow, like, and comment functionality with real-time interactions

## Overview

The Social Features API provides comprehensive social interaction capabilities including follows, likes, and comments. All features are optimized for performance with proper validation and real-time updates.

## Base URLs

```http
# Follow Routes
GET  /api/follow/<id>                    # Get user's followers
GET  /api/follow/<id>/following          # Get users that user follows
POST /api/follow                         # Follow a user
DELETE /api/follow                       # Unfollow a user

# Like Routes
GET  /api/like/user/<id>                 # Get likes by user
GET  /api/like/<likeable_type>/<id>      # Get likes for content
POST /api/like                           # Like content
DELETE /api/like                         # Unlike content

# Comment Routes
POST /api/comment                        # Create comment
```

## Authentication Required

- **Follow Operations**: Authentication required
- **Like Operations**: Authentication required
- **Comment Operations**: Authentication required
- **Read Operations**: Public endpoints

---

## Follow System

### 1. Get User's Followers

**Endpoint**: `GET /api/follow/<id>`

**Purpose**: Get list of users following the specified user

**Parameters**:
- **id**: User ID to get followers for

**Success Response** (200):
```json
{
  "follows": [
    {
      "id": 1,
      "user_id": 2,
      "user_followed_id": 1,
      "created_at": "2025-07-31T10:30:00Z"
    },
    {
      "id": 2,
      "user_id": 3,
      "user_followed_id": 1,
      "created_at": "2025-07-31T11:15:00Z"
    }
  ]
}
```

**curl Example**:
```bash
curl http://localhost:8080/api/follow/1
```

### 2. Get Users That User Follows

**Endpoint**: `GET /api/follow/<id>/following`

**Purpose**: Get list of users that the specified user follows

**Parameters**:
- **id**: User ID to get following list for

**Success Response** (200):
```json
{
  "follows": [
    {
      "id": 3,
      "user_id": 1,
      "user_followed_id": 2,
      "created_at": "2025-07-31T09:30:00Z"
    },
    {
      "id": 4,
      "user_id": 1,
      "user_followed_id": 3,
      "created_at": "2025-07-31T10:45:00Z"
    }
  ]
}
```

**curl Example**:
```bash
curl http://localhost:8080/api/follow/1/following
```

### 3. Follow a User

**Endpoint**: `POST /api/follow`

**Purpose**: Create a follow relationship between users

**Request Body**:
```json
{
  "user_id": 1,
  "user_followed_id": 2
}
```

**Validation Rules**:
- **user_id**: Required, must be valid user ID
- **user_followed_id**: Required, must be valid user ID
- Cannot follow yourself
- Cannot follow someone you already follow

**Success Response** (200):
```json
{
  "id": 5,
  "user_id": 1,
  "user_followed_id": 2,
  "created_at": "2025-07-31T16:30:00Z"
}
```

**Error Response** (400):
```json
{
  "error": "Already Follow!"
}
```

**curl Example**:
```bash
curl -X POST http://localhost:8080/api/follow \
  -H "Content-Type: application/json" \
  -H "Cookie: session=your_session_cookie" \
  -d '{
    "user_id": 1,
    "user_followed_id": 2
  }'
```

### 4. Unfollow a User

**Endpoint**: `DELETE /api/follow`

**Purpose**: Remove a follow relationship between users

**Request Body**:
```json
{
  "user_id": 1,
  "user_followed_id": 2
}
```

**Success Response** (200):
```json
{
  "id": 5,
  "user_id": 1,
  "user_followed_id": 2,
  "created_at": "2025-07-31T16:30:00Z"
}
```

**Error Response** (400):
```json
{
  "error": "Doesn't follow!"
}
```

**curl Example**:
```bash
curl -X DELETE http://localhost:8080/api/follow \
  -H "Content-Type: application/json" \
  -H "Cookie: session=your_session_cookie" \
  -d '{
    "user_id": 1,
    "user_followed_id": 2
  }'
```

---

## Like System

### 1. Get Likes by User

**Endpoint**: `GET /api/like/user/<id>`

**Purpose**: Get all likes created by a specific user

**Parameters**:
- **id**: User ID to get likes for

**Success Response** (200):
```json
{
  "likes": [
    {
      "id": 1,
      "user_id": 1,
      "likeable_type": "post",
      "likeable_id": 123,
      "created_at": "2025-07-31T15:30:00Z"
    },
    {
      "id": 2,
      "user_id": 1,
      "likeable_type": "comment",
      "likeable_id": 45,
      "created_at": "2025-07-31T16:15:00Z"
    }
  ]
}
```

**curl Example**:
```bash
curl http://localhost:8080/api/like/user/1
```

### 2. Get Likes for Content

**Endpoint**: `GET /api/like/<likeable_type>/<id>`

**Purpose**: Get all likes for a specific piece of content

**Parameters**:
- **likeable_type**: Type of content ("post" or "comment")
- **id**: ID of the content

**Success Response** (200):
```json
{
  "likes": [
    {
      "id": 1,
      "user_id": 1,
      "likeable_type": "post",
      "likeable_id": 123,
      "created_at": "2025-07-31T15:30:00Z"
    },
    {
      "id": 3,
      "user_id": 2,
      "likeable_type": "post",
      "likeable_id": 123,
      "created_at": "2025-07-31T16:45:00Z"
    }
  ]
}
```

**curl Example**:
```bash
curl http://localhost:8080/api/like/post/123
```

### 3. Like Content

**Endpoint**: `POST /api/like`

**Purpose**: Create a like on a piece of content

**Request Body**:
```json
{
  "user_id": 1,
  "id": 123,
  "likeable_type": "post"
}
```

**Validation Rules**:
- **user_id**: Required, must be valid user ID
- **id**: Required, must be valid content ID
- **likeable_type**: Required, must be "post" or "comment"
- Cannot like the same content twice

**Success Response** (200):
```json
{
  "like": {
    "id": 4,
    "user_id": 1,
    "likeable_type": "post",
    "likeable_id": 123,
    "created_at": "2025-07-31T17:00:00Z"
  },
  "like_list": [
    {
      "id": 1,
      "user_id": 1,
      "likeable_type": "post",
      "likeable_id": 123,
      "created_at": "2025-07-31T15:30:00Z"
    },
    {
      "id": 3,
      "user_id": 2,
      "likeable_type": "post",
      "likeable_id": 123,
      "created_at": "2025-07-31T16:45:00Z"
    },
    {
      "id": 4,
      "user_id": 1,
      "likeable_type": "post",
      "likeable_id": 123,
      "created_at": "2025-07-31T17:00:00Z"
    }
  ]
}
```

**curl Example**:
```bash
curl -X POST http://localhost:8080/api/like \
  -H "Content-Type: application/json" \
  -H "Cookie: session=your_session_cookie" \
  -d '{
    "user_id": 1,
    "id": 123,
    "likeable_type": "post"
  }'
```

### 4. Unlike Content

**Endpoint**: `DELETE /api/like`

**Purpose**: Remove a like from content

**Request Body**:
```json
{
  "id": 4
}
```

**Validation Rules**:
- **id**: Required, must be valid like ID
- User must own the like to delete it

**Success Response** (200):
```json
{
  "id": 4,
  "user_id": 1,
  "likeable_type": "post",
  "likeable_id": 123,
  "created_at": "2025-07-31T17:00:00Z"
}
```

**curl Example**:
```bash
curl -X DELETE http://localhost:8080/api/like \
  -H "Content-Type: application/json" \
  -H "Cookie: session=your_session_cookie" \
  -d '{
    "id": 4
  }'
```

---

## Comment System

### 1. Create Comment

**Endpoint**: `POST /api/comment`

**Purpose**: Create a comment on a post

**Request Body**:
```json
{
  "user_id": 1,
  "post_id": 123,
  "content": "Great photo! Love the composition."
}
```

**Validation Rules**:
- **user_id**: Required, must be valid user ID
- **post_id**: Required, must be valid post ID
- **content**: Required, cannot be empty
- Content length: Maximum 1000 characters

**Success Response** (200):
```json
{
  "comment": {
    "id": 45,
    "user_id": 1,
    "post_id": 123,
    "content": "Great photo! Love the composition.",
    "created_at": "2025-07-31T18:30:00Z",
    "updated_at": "2025-07-31T18:30:00Z",
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "full_name": "John Doe",
      "profile_image_url": "https://s3.amazonaws.com/isntgram/profile_1.jpg",
      "bio": "Software developer",
      "created_at": "2025-07-31T10:30:00Z",
      "updated_at": "2025-07-31T10:30:00Z"
    },
    "likes": []
  }
}
```

**Error Responses**:

**Missing Required Fields** (400):
```json
{
  "error": "Missing required fields: user_id, post_id, content"
}
```

**User Not Found** (404):
```json
{
  "error": "User not found"
}
```

**Post Not Found** (404):
```json
{
  "error": "Post not found"
}
```

**curl Example**:
```bash
curl -X POST http://localhost:8080/api/comment \
  -H "Content-Type: application/json" \
  -H "Cookie: session=your_session_cookie" \
  -d '{
    "user_id": 1,
    "post_id": 123,
    "content": "Great photo! Love the composition."
  }'
```

---

## Error Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 400 | Bad Request | Validation failed or already exists |
| 404 | Not Found | User, post, or content not found |
| 500 | Internal Server Error | Server error |

## Common Errors

### Already Following
```json
{
  "error": "Already Follow!"
}
```

**Cause**: Attempting to follow someone you already follow

**Solution**: Check if already following before making request

### Not Following
```json
{
  "error": "Doesn't follow!"
}
```

**Cause**: Attempting to unfollow someone you don't follow

**Solution**: Check if following before making request

### Missing Required Fields
```json
{
  "error": "Missing required fields: user_id, post_id, content"
}
```

**Cause**: Missing required fields in request body

**Solution**: Include all required fields

## Integration Examples

### JavaScript/Frontend

```javascript
// Follow a user
async function followUser(userId, userToFollowId) {
  const response = await fetch('/api/follow', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCsrfToken()
    },
    body: JSON.stringify({
      user_id: userId,
      user_followed_id: userToFollowId
    })
  });
  
  const data = await response.json();
  if (response.ok) {
    return data;
  } else {
    throw new Error(data.error);
  }
}

// Like a post
async function likePost(userId, postId) {
  const response = await fetch('/api/like', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCsrfToken()
    },
    body: JSON.stringify({
      user_id: userId,
      id: postId,
      likeable_type: 'post'
    })
  });
  
  const data = await response.json();
  if (response.ok) {
    return data;
  } else {
    throw new Error(data.error);
  }
}

// Create comment
async function createComment(userId, postId, content) {
  const response = await fetch('/api/comment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCsrfToken()
    },
    body: JSON.stringify({
      user_id: userId,
      post_id: postId,
      content: content
    })
  });
  
  const data = await response.json();
  if (response.ok) {
    return data.comment;
  } else {
    throw new Error(data.error);
  }
}
```

### Python Client

```python
import requests

def follow_user(user_id, user_to_follow_id):
    response = requests.post('http://localhost:8080/api/follow',
        json={
            'user_id': user_id,
            'user_followed_id': user_to_follow_id
        },
        cookies={'session': 'your_session_cookie'})
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(response.json()['error'])

def like_content(user_id, content_id, content_type):
    response = requests.post('http://localhost:8080/api/like',
        json={
            'user_id': user_id,
            'id': content_id,
            'likeable_type': content_type
        },
        cookies={'session': 'your_session_cookie'})
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(response.json()['error'])

def create_comment(user_id, post_id, content):
    response = requests.post('http://localhost:8080/api/comment',
        json={
            'user_id': user_id,
            'post_id': post_id,
            'content': content
        },
        cookies={'session': 'your_session_cookie'})
    
    if response.status_code == 200:
        return response.json()['comment']
    else:
        raise Exception(response.json()['error'])
```

## Testing Examples

### Follow System Test
```bash
# Get user's followers
curl http://localhost:8080/api/follow/1

# Get users that user follows
curl http://localhost:8080/api/follow/1/following

# Follow a user
curl -X POST http://localhost:8080/api/follow \
  -H "Content-Type: application/json" \
  -H "Cookie: session=$SESSION" \
  -d '{"user_id": 1, "user_followed_id": 2}'

# Unfollow a user
curl -X DELETE http://localhost:8080/api/follow \
  -H "Content-Type: application/json" \
  -H "Cookie: session=$SESSION" \
  -d '{"user_id": 1, "user_followed_id": 2}'
```

### Like System Test
```bash
# Get likes by user
curl http://localhost:8080/api/like/user/1

# Get likes for a post
curl http://localhost:8080/api/like/post/123

# Like a post
curl -X POST http://localhost:8080/api/like \
  -H "Content-Type: application/json" \
  -H "Cookie: session=$SESSION" \
  -d '{"user_id": 1, "id": 123, "likeable_type": "post"}'

# Unlike a post
curl -X DELETE http://localhost:8080/api/like \
  -H "Content-Type: application/json" \
  -H "Cookie: session=$SESSION" \
  -d '{"id": 4}'
```

### Comment System Test
```bash
# Create a comment
curl -X POST http://localhost:8080/api/comment \
  -H "Content-Type: application/json" \
  -H "Cookie: session=$SESSION" \
  -d '{
    "user_id": 1,
    "post_id": 123,
    "content": "Great photo! Love the composition."
  }'
```

## Performance Considerations

### Database Queries
- **Follow Queries**: Optimized with proper indexes
- **Like Queries**: Efficient polymorphic queries
- **Comment Queries**: Optimized with user relationship loading

### Caching Strategy
- **Follow Lists**: Cache frequently accessed follow relationships
- **Like Counts**: Cache like counts for performance
- **Comment Lists**: Cache comment lists with pagination

### Security Features
- **Input Validation**: All fields validated before database operations
- **Duplicate Prevention**: Checks for existing relationships
- **Access Control**: All write operations require authentication
- **CSRF Protection**: All POST/DELETE requests protected

---

**Next**: [Posts API](./posts.md) | [Users API](./users.md) | [Authentication API](./authentication.md)
