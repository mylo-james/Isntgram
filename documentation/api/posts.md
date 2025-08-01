# Posts API

> CRUD operations with infinite scroll, caching, and AWS S3 image upload

## Overview

The Posts API provides full CRUD operations for Instagram-style posts with optimized performance through caching and pagination. All post operations require authentication and are subject to rate limiting.

## Base URLs

```http
GET    /api/post/scroll/<length>           # Infinite scroll feed (paginated)
GET    /api/post/explore/<length>          # Discover content (paginated)
GET    /api/post/<post_id>                 # Get specific post
GET    /api/post/<id>/scroll/<length>      # User-specific feed
POST   /api/post                           # Create new post
PUT    /api/post/<post_id>                 # Update existing post
DELETE /api/post/<post_id>                 # Delete post
```

## Rate Limiting

- **Create Post**: 10 posts per hour
- **Update Post**: 20 updates per hour  
- **Delete Post**: 10 deletions per hour
- **Scroll/Explore**: 100 requests per minute

## Authentication Required

All endpoints require user authentication via session cookie or JWT token.

---

## 1. Create Post

**Endpoint**: `POST /api/post`

**Request Body**:
```json
{
  "caption": "Beautiful sunset at the beach! 🌅",
  "image_url": "https://s3.amazonaws.com/isntgram/image_1627742400123.jpg"
}
```

**Field Validation**:
- **caption**: Optional, max 2000 characters
- **image_url**: Required, valid URL format, max 2000 characters

**Success Response** (201):
```json
{
  "success": true,
  "message": "Post created successfully",
  "data": {
    "post": {
      "id": 123,
      "user_id": 1,
      "caption": "Beautiful sunset at the beach! 🌅",
      "image_url": "https://s3.amazonaws.com/isntgram/image_1627742400123.jpg",
      "created_at": "2025-07-31T15:30:00Z",
      "updated_at": "2025-07-31T15:30:00Z",
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
  }
}
```

**curl Example**:
```bash
curl -X POST http://localhost:8080/api/post \
  -H "Content-Type: application/json" \
  -H "Cookie: session=your_session_cookie" \
  -d '{
    "caption": "Beautiful sunset at the beach! 🌅",
    "image_url": "https://s3.amazonaws.com/isntgram/image_1627742400123.jpg"
  }'
```

---

## 2. Infinite Scroll Feed

**Endpoint**: `GET /api/post/scroll/<length>`

**Parameters**:
- **length**: Number of posts already loaded (for pagination)

**Query Examples**:
- `/api/post/scroll/0` - First page (initial load)
- `/api/post/scroll/3` - Next 3 posts (after loading 3)
- `/api/post/scroll/6` - Next 3 posts (after loading 6)

**Success Response** (200):
```json
{
  "success": true,
  "message": "Posts retrieved successfully",
  "data": {
    "posts": [
      {
        "id": 125,
        "user_id": 2,
        "caption": "Coffee and code ☕️💻",
        "image_url": "https://s3.amazonaws.com/isntgram/image_125.jpg",
        "created_at": "2025-07-31T14:20:00Z",
        "updated_at": "2025-07-31T14:20:00Z",
        "user": {
          "id": 2,
          "username": "jane_smith",
          "email": "jane@example.com",
          "full_name": "Jane Smith",
          "profile_image_url": "https://s3.amazonaws.com/isntgram/profile_2.jpg",
          "bio": "Frontend developer",
          "created_at": "2025-07-31T10:30:00Z",
          "updated_at": "2025-07-31T10:30:00Z"
        },
        "like_count": 15,
        "comment_count": 3
      },
      {
        "id": 124,
        "user_id": 3,
        "caption": "Mountain hiking adventure! 🏔️",
        "image_url": "https://s3.amazonaws.com/isntgram/image_124.jpg",
        "created_at": "2025-07-31T12:15:00Z",
        "updated_at": "2025-07-31T12:15:00Z",
        "user": {
          "id": 3,
          "username": "outdoor_explorer",
          "email": "mike@example.com",
          "full_name": "Mike Johnson",
          "profile_image_url": "https://s3.amazonaws.com/isntgram/profile_3.jpg",
          "bio": "Adventure photographer",
          "created_at": "2025-07-31T10:30:00Z",
          "updated_at": "2025-07-31T10:30:00Z"
        },
        "like_count": 42,
        "comment_count": 8
      }
    ]
  }
}
```

**Performance Features**:
- **N+1 Prevention**: Uses `joinedload()` for user data
- **Pagination**: 3 posts per page for optimal loading
- **Optimized Queries**: Efficient count queries for likes and comments

**curl Example**:
```bash
curl http://localhost:8080/api/post/scroll/0 \
  -H "Cookie: session=your_session_cookie"
```

---

## 3. Explore Posts

**Endpoint**: `GET /api/post/explore/<length>`

**Purpose**: Discover trending/popular posts from users you don't follow

**Parameters**:
- **length**: Number of posts already loaded (for pagination)

**Success Response** (200):
```json
{
  "success": true,
  "message": "Explore posts retrieved successfully", 
  "data": {
    "posts": [
      {
        "id": 130,
        "user_id": 15,
        "caption": "Amazing street art in downtown! 🎨",
        "image_url": "https://s3.amazonaws.com/isntgram/image_130.jpg",
        "created_at": "2025-07-31T16:45:00Z",
        "updated_at": "2025-07-31T16:45:00Z",
        "user": {
          "id": 15,
          "username": "street_artist",
          "email": "alex@example.com",
          "full_name": "Alex Rivera",
          "profile_image_url": "https://s3.amazonaws.com/isntgram/profile_15.jpg",
          "bio": "Street artist and photographer",
          "created_at": "2025-07-31T10:30:00Z",
          "updated_at": "2025-07-31T10:30:00Z"
        },
        "like_count": 89,
        "comment_count": 12
      }
    ]
  }
}
```

**Algorithm**: 
- Posts from non-followed users
- Randomized selection for variety
- 3 posts per page for optimal loading

**curl Example**:
```bash
curl http://localhost:8080/api/post/explore/0 \
  -H "Cookie: session=your_session_cookie"
```

---

## 4. User-Specific Feed

**Endpoint**: `GET /api/post/<id>/scroll/<length>`

**Purpose**: Get posts from users that a specific user follows

**Parameters**:
- **id**: User ID to get feed for
- **length**: Number of posts already loaded (for pagination)

**Success Response** (200):
```json
{
  "posts": [
    {
      "id": 125,
      "user_id": 2,
      "caption": "Coffee and code ☕️💻",
      "image_url": "https://s3.amazonaws.com/isntgram/image_125.jpg",
      "created_at": "2025-07-31T14:20:00Z",
      "updated_at": "2025-07-31T14:20:00Z",
      "user": {
        "id": 2,
        "username": "jane_smith",
        "email": "jane@example.com",
        "full_name": "Jane Smith",
        "profile_image_url": "https://s3.amazonaws.com/isntgram/profile_2.jpg",
        "bio": "Frontend developer",
        "created_at": "2025-07-31T10:30:00Z",
        "updated_at": "2025-07-31T10:30:00Z"
      },
      "likes": [
        {
          "id": 1,
          "user_id": 3,
          "likeable_type": "post",
          "likeable_id": 125,
          "created_at": "2025-07-31T14:25:00Z"
        }
      ],
      "comments": [
        {
          "id": 45,
          "user_id": 3,
          "post_id": 125,
          "content": "Great setup!",
          "created_at": "2025-07-31T14:30:00Z",
          "updated_at": "2025-07-31T14:30:00Z",
          "user": {
            "id": 3,
            "username": "outdoor_explorer",
            "email": "mike@example.com",
            "full_name": "Mike Johnson",
            "profile_image_url": "https://s3.amazonaws.com/isntgram/profile_3.jpg",
            "bio": "Adventure photographer",
            "created_at": "2025-07-31T10:30:00Z",
            "updated_at": "2025-07-31T10:30:00Z"
          }
        }
      ]
    }
  ]
}
```

**curl Example**:
```bash
curl http://localhost:8080/api/post/1/scroll/0 \
  -H "Cookie: session=your_session_cookie"
```

---

## 5. Get Specific Post

**Endpoint**: `GET /api/post/<post_id>`

**Success Response** (200):
```json
{
  "post": {
    "id": 123,
    "user_id": 1,
    "caption": "Beautiful sunset at the beach! 🌅",
    "image_url": "https://s3.amazonaws.com/isntgram/image_123.jpg",
    "created_at": "2025-07-31T15:30:00Z",
    "updated_at": "2025-07-31T15:30:00Z",
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
    "comments": [
      {
        "id": 45,
        "user_id": 2,
        "post_id": 123,
        "content": "Gorgeous shot!",
        "created_at": "2025-07-31T15:45:00Z",
        "updated_at": "2025-07-31T15:45:00Z",
        "user": {
          "id": 2,
          "username": "jane_smith",
          "email": "jane@example.com",
          "full_name": "Jane Smith",
          "profile_image_url": "https://s3.amazonaws.com/isntgram/profile_2.jpg",
          "bio": "Frontend developer",
          "created_at": "2025-07-31T10:30:00Z",
          "updated_at": "2025-07-31T10:30:00Z"
        }
      }
    ],
    "likes": [
      {
        "id": 1,
        "user_id": 2,
        "likeable_type": "post",
        "likeable_id": 123,
        "created_at": "2025-07-31T15:35:00Z"
      }
    ]
  }
}
```

**curl Example**:
```bash
curl http://localhost:8080/api/post/123 \
  -H "Cookie: session=your_session_cookie"
```

---

## 6. Update Post

**Endpoint**: `PUT /api/post/<post_id>`

**Authorization**: Only post owner can update

**Request Body**:
```json
{
  "caption": "Updated caption: Beautiful sunset at Santa Monica! 🌅🏖️"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Post updated successfully",
  "data": {
    "post": {
      "id": 123,
      "user_id": 1,
      "caption": "Updated caption: Beautiful sunset at Santa Monica! 🌅🏖️",
      "image_url": "https://s3.amazonaws.com/isntgram/image_123.jpg",
      "created_at": "2025-07-31T15:30:00Z",
      "updated_at": "2025-07-31T16:15:00Z",
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
  }
}
```

**curl Example**:
```bash
curl -X PUT http://localhost:8080/api/post/123 \
  -H "Content-Type: application/json" \
  -H "Cookie: session=your_session_cookie" \
  -d '{
    "caption": "Updated caption: Beautiful sunset at Santa Monica! 🌅🏖️"
  }'
```

---

## 7. Delete Post

**Endpoint**: `DELETE /api/post/<post_id>`

**Authorization**: Only post owner can delete

**Success Response** (200):
```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

**Error Response** (403):
```json
{
  "error": "Not authorized to delete this post",
  "success": false
}
```

**curl Example**:
```bash
curl -X DELETE http://localhost:8080/api/post/123 \
  -H "Cookie: session=your_session_cookie"
```

---

## Error Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Post created successfully |
| 400 | Bad Request | Validation failed |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Not authorized to modify this post |
| 404 | Not Found | Post not found |
| 429 | Too Many Requests | Rate limit exceeded |

## Performance Optimizations

### Database Queries
```sql
-- Optimized scroll query with JOIN
SELECT posts.*, users.username, users.full_name 
FROM posts 
JOIN users ON posts.user_id = users.id 
ORDER BY posts.created_at DESC 
LIMIT 3 OFFSET ?
```

### Modern SQLAlchemy 2.0 Patterns
```python
# Optimized query with joined loading
posts = (Post.query
        .options(joinedload(Post.user))
        .order_by(desc(Post.created_at))
        .offset(length)
        .limit(3)
        .all())
```

### Image Optimization
- **S3 Integration**: Direct upload to AWS S3
- **CDN**: CloudFront for global delivery
- **Formats**: JPEG/PNG, max 10MB
- **Thumbnails**: Generated automatically

## Testing Examples

### Create and Verify Post
```bash
# Create post
POST_ID=$(curl -X POST http://localhost:8080/api/post \
  -H "Content-Type: application/json" \
  -H "Cookie: session=$SESSION" \
  -d '{"caption":"Test post","image_url":"https://example.com/image.jpg"}' \
  | jq -r '.data.post.id')

# Verify post exists
curl http://localhost:8080/api/post/$POST_ID \
  -H "Cookie: session=$SESSION"
```

### Test Pagination
```bash
# Load first page
curl http://localhost:8080/api/post/scroll/0 \
  -H "Cookie: session=$SESSION"

# Load second page  
curl http://localhost:8080/api/post/scroll/3 \
  -H "Cookie: session=$SESSION"
```

## Integration with Media Upload

Before creating a post, upload the image:

```bash
# 1. Upload image
IMAGE_URL=$(curl -X POST http://localhost:8080/api/aws/upload \
  -H "Cookie: session=$SESSION" \
  -F "image=@photo.jpg" \
  | jq -r '.url')

# 2. Create post with uploaded image
curl -X POST http://localhost:8080/api/post \
  -H "Content-Type: application/json" \
  -H "Cookie: session=$SESSION" \
  -d "{\"caption\":\"My photo\",\"image_url\":\"$IMAGE_URL\"}"
```

---

**Next**: [Social Features API](./social-features.md) | [Media Upload API](./media.md) | [Authentication API](./authentication.md)