# API Examples

> Copy-paste ready examples for testing the Isntgram API

## Complete User Journey

### 1. User Registration & Login

```bash
# Register new user
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "api_tester",
    "email": "tester@example.com",
    "full_name": "API Tester",
    "password": "TestPassword123",
    "confirm_password": "TestPassword123",
    "bio": "Testing the Instagram clone API"
  }'

# Expected Response (200):
{
  "user": {
    "id": 1,
    "username": "api_tester",
    "email": "tester@example.com",
    "full_name": "API Tester",
    "profile_image_url": null,
    "bio": "Testing the Instagram clone API",
    "created_at": "2025-07-31T10:30:00Z",
    "updated_at": "2025-07-31T10:30:00Z"
  }
}

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tester@example.com",
    "password": "TestPassword123"
  }'
```

### 2. Check Authentication Status

```bash
# Verify login status
curl http://localhost:8080/api/auth \
  -H "Cookie: session=your_session_cookie_here"

# Expected Response (200):
{
  "user": {
    "id": 1,
    "username": "api_tester",
    "email": "tester@example.com",
    "full_name": "API Tester",
    "profile_image_url": null,
    "bio": "Testing the Instagram clone API",
    "created_at": "2025-07-31T10:30:00Z",
    "updated_at": "2025-07-31T10:30:00Z"
  }
}
```

### 3. Upload Image and Create Post

```bash
# Upload post image and create post in one operation
curl -X POST "http://localhost:8080/api/aws/post/1/My%20first%20API%20post!%20🚀" \
  -H "Cookie: session=your_session_cookie" \
  -F "file=@/path/to/your/image.jpg"

# Expected Response (200):
{
  "id": 123,
  "user_id": 1,
  "image_url": "https://isntgram.s3.us-east-2.amazonaws.com/FriJul171300242020.png",
  "caption": "My first API post! 🚀",
  "created_at": "2025-07-31T15:30:00Z",
  "updated_at": "2025-07-31T15:30:00Z"
}
```

### 4. View Posts Feed

```bash
# Get infinite scroll feed
curl http://localhost:8080/api/post/scroll/0

# Expected Response (200):
{
  "posts": [
    {
      "id": 123,
      "user_id": 1,
      "image_url": "https://isntgram.s3.us-east-2.amazonaws.com/FriJul171300242020.png",
      "caption": "My first API post! 🚀",
      "created_at": "2025-07-31T15:30:00Z",
      "updated_at": "2025-07-31T15:30:00Z",
      "user": {
        "id": 1,
        "username": "api_tester",
        "full_name": "API Tester",
        "profile_image_url": null
      }
    }
  ]
}

# Get explore feed
curl http://localhost:8080/api/post/explore/0
```

### 5. Social Interactions

```bash
# Like a post
curl -X POST http://localhost:8080/api/like \
  -H "Content-Type: application/json" \
  -H "Cookie: session=your_session_cookie" \
  -d '{
    "user_id": 1,
    "id": 123,
    "likeable_type": "post"
  }'

# Expected Response (200):
{
  "like": {
    "id": 1,
    "user_id": 1,
    "likeable_type": "post",
    "likeable_id": 123,
    "created_at": "2025-07-31T16:30:00Z"
  },
  "like_list": [
    {
      "id": 1,
      "user_id": 1,
      "likeable_type": "post",
      "likeable_id": 123,
      "created_at": "2025-07-31T16:30:00Z"
    }
  ]
}

# Comment on a post
curl -X POST http://localhost:8080/api/comment \
  -H "Content-Type: application/json" \
  -H "Cookie: session=your_session_cookie" \
  -d '{
    "user_id": 1,
    "post_id": 123,
    "content": "Great post! Love the composition."
  }'

# Expected Response (200):
{
  "comment": {
    "id": 45,
    "user_id": 1,
    "post_id": 123,
    "content": "Great post! Love the composition.",
    "created_at": "2025-07-31T17:00:00Z",
    "updated_at": "2025-07-31T17:00Z",
    "user": {
      "id": 1,
      "username": "api_tester",
      "full_name": "API Tester",
      "profile_image_url": null
    },
    "likes": []
  }
}

# Follow a user
curl -X POST http://localhost:8080/api/follow \
  -H "Content-Type: application/json" \
  -H "Cookie: session=your_session_cookie" \
  -d '{
    "user_id": 1,
    "user_followed_id": 2
  }'

# Expected Response (200):
{
  "id": 1,
  "user_id": 1,
  "user_followed_id": 2,
  "created_at": "2025-07-31T18:30:00Z"
}
```

### 6. User Management

```bash
# Lookup user by username
curl http://localhost:8080/api/user/lookup/api_tester

# Expected Response (200):
{
  "user": {
    "id": 1,
    "username": "api_tester",
    "email": "tester@example.com",
    "full_name": "API Tester",
    "profile_image_url": null,
    "bio": "Testing the Instagram clone API",
    "created_at": "2025-07-31T10:30:00Z",
    "updated_at": "2025-07-31T10:30:00Z"
  }
}

# Update user profile
curl -X PUT http://localhost:8080/api/user \
  -H "Content-Type: application/json" \
  -H "Cookie: session=your_session_cookie" \
  -d '{
    "id": 1,
    "username": "updated_tester",
    "email": "updated@example.com",
    "full_name": "Updated API Tester",
    "bio": "Updated bio for testing"
  }'

# Expected Response (200):
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "username": "updated_tester",
    "email": "updated@example.com",
    "full_name": "Updated API Tester",
    "profile_image_url": null,
    "bio": "Updated bio for testing",
    "created_at": "2025-07-31T10:30:00Z",
    "updated_at": "2025-07-31T19:45:00Z"
  }
}

# Reset profile image
curl http://localhost:8080/api/user/1/resetImg \
  -H "Cookie: session=your_session_cookie"
```

### 7. Search and Discovery

```bash
# Search for users
curl "http://localhost:8080/api/query?query=api"

# Expected Response (200):
{
  "results": [
    {
      "id": 1,
      "username": "api_tester",
      "email": "tester@example.com",
      "full_name": "API Tester",
      "profile_image_url": null,
      "bio": "Testing the Instagram clone API",
      "created_at": "2025-07-31T10:30:00Z",
      "updated_at": "2025-07-31T10:30:00Z"
    }
  ]
}

# Get user profile
curl http://localhost:8080/api/profile/api_tester

# Expected Response (200):
{
  "num_posts": 1,
  "posts": [
    {
      "id": 123,
      "user_id": 1,
      "image_url": "https://isntgram.s3.us-east-2.amazonaws.com/FriJul171300242020.png",
      "caption": "My first API post! 🚀",
      "created_at": "2025-07-31T15:30:00Z",
      "updated_at": "2025-07-31T15:30:00Z",
      "like_count": 1,
      "comment_count": 1
    }
  ],
  "followersList": [],
  "followingList": [
    {
      "id": 1,
      "user_id": 1,
      "user_followed_id": 2,
      "created_at": "2025-07-31T18:30:00Z"
    }
  ],
  "user": {
    "id": 1,
    "username": "api_tester",
    "email": "tester@example.com",
    "full_name": "API Tester",
    "profile_image_url": null,
    "bio": "Testing the Instagram clone API",
    "created_at": "2025-07-31T10:30:00Z",
    "updated_at": "2025-07-31T10:30:00Z"
  }
}
```

### 8. Activity Feed

```bash
# Get activity feed
curl http://localhost:8080/api/note/1/scroll/0

# Expected Response (200):
{
  "notes": [
    {
      "id": 1,
      "user_id": 2,
      "user_followed_id": 1,
      "created_at": "2025-07-31T16:30:00Z",
      "user": {
        "id": 2,
        "username": "jane_smith",
        "full_name": "Jane Smith",
        "profile_image_url": "https://s3.amazonaws.com/isntgram/profile_2.jpg"
      },
      "type": "follow"
    },
    {
      "id": 3,
      "user_id": 3,
      "likeable_type": "post",
      "likeable_id": 123,
      "created_at": "2025-07-31T16:45:00Z",
      "user": {
        "id": 3,
        "username": "mike_jones",
        "full_name": "Mike Jones",
        "profile_image_url": "https://s3.amazonaws.com/isntgram/profile_3.jpg"
      },
      "post": {
        "id": 123,
        "image_url": "https://isntgram.s3.us-east-2.amazonaws.com/FriJul171300242020.png",
        "caption": "My first API post! 🚀"
      },
      "type": "like"
    }
  ]
}
```

## Error Handling Examples

### Common Error Responses

```bash
# Missing required fields
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test",
    "email": "test@example.com"
  }'

# Expected Response (400):
{
  "error": "Missing required fields: full_name, password, confirm_password"
}

# User not found
curl http://localhost:8080/api/user/lookup/nonexistent_user

# Expected Response (404):
{
  "error": "User not found"
}

# Already following
curl -X POST http://localhost:8080/api/follow \
  -H "Content-Type: application/json" \
  -H "Cookie: session=your_session_cookie" \
  -d '{
    "user_id": 1,
    "user_followed_id": 2
  }'

# Expected Response (400):
{
  "error": "Already Follow!"
}
```

## Advanced Examples

### Batch Operations

```bash
# Get multiple posts with pagination
curl http://localhost:8080/api/post/scroll/0
curl http://localhost:8080/api/post/scroll/3
curl http://localhost:8080/api/post/scroll/6

# Get user's followers and following
curl http://localhost:8080/api/follow/1
curl http://localhost:8080/api/follow/1/following

# Get likes for different content types
curl http://localhost:8080/api/like/post/123
curl http://localhost:8080/api/like/comment/45
curl http://localhost:8080/api/like/user/1
```

### File Upload Examples

```bash
# Upload profile image
curl -X POST http://localhost:8080/api/aws/1 \
  -H "Cookie: session=your_session_cookie" \
  -F "file=@profile_image.jpg"

# Expected Response (200):
{
  "img": "https://isntgram.s3.us-east-2.amazonaws.com/FriJul171300242020.png"
}

# Upload post image without caption
curl -X POST http://localhost:8080/api/aws/post/1/null \
  -H "Cookie: session=your_session_cookie" \
  -F "file=@post_image.jpg"
```

## Testing Scripts

### Complete Test Suite

```bash
#!/bin/bash

# Test authentication
echo "Testing authentication..."
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_user",
    "email": "test@example.com",
    "full_name": "Test User",
    "password": "password123",
    "confirm_password": "password123"
  }'

echo -e "\n\nTesting login..."
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

echo -e "\n\nTesting post creation..."
curl -X POST "http://localhost:8080/api/aws/post/1/Test%20post" \
  -F "file=@test_image.jpg"

echo -e "\n\nTesting feed..."
curl http://localhost:8080/api/post/scroll/0

echo -e "\n\nTesting search..."
curl "http://localhost:8080/api/query?query=test"

echo -e "\n\nAll tests completed!"
```

### JavaScript Integration Example

```javascript
// Complete API client example
class IsntgramAPI {
  constructor(baseURL = 'http://localhost:8080') {
    this.baseURL = baseURL;
  }

  async signup(userData) {
    const response = await fetch(`${this.baseURL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  }

  async login(credentials) {
    const response = await fetch(`${this.baseURL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return response.json();
  }

  async createPost(userId, caption, imageFile) {
    const formData = new FormData();
    formData.append('file', imageFile);
    
    const response = await fetch(
      `${this.baseURL}/api/aws/post/${userId}/${encodeURIComponent(caption)}`,
      {
        method: 'POST',
        body: formData
      }
    );
    return response.json();
  }

  async getFeed(offset = 0) {
    const response = await fetch(`${this.baseURL}/api/post/scroll/${offset}`);
    return response.json();
  }

  async searchUsers(query) {
    const response = await fetch(`${this.baseURL}/api/query?query=${encodeURIComponent(query)}`);
    return response.json();
  }
}

// Usage example
const api = new IsntgramAPI();

// Complete user journey
async function testAPI() {
  try {
    // Signup
    const user = await api.signup({
      username: 'test_user',
      email: 'test@example.com',
      full_name: 'Test User',
      password: 'password123',
      confirm_password: 'password123'
    });
    console.log('User created:', user);

    // Login
    const loginResult = await api.login({
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('Login successful:', loginResult);

    // Get feed
    const feed = await api.getFeed(0);
    console.log('Feed loaded:', feed);

    // Search users
    const searchResults = await api.searchUsers('test');
    console.log('Search results:', searchResults);

  } catch (error) {
    console.error('API test failed:', error);
  }
}

testAPI();
```

## Performance Testing

### Load Testing Examples

```bash
# Test feed loading performance
time curl http://localhost:8080/api/post/scroll/0

# Test search performance
time curl "http://localhost:8080/api/query?query=test"

# Test authentication performance
time curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

**Next**: [Authentication API](./../api/authentication.md) | [Posts API](./../api/posts.md) | [Complete API Reference](./../routes_endpoints.md)