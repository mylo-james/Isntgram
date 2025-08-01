# Routes and Endpoints

Complete and accurate documentation of all API endpoints in the Isntgram application.

## API - Backend

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/auth` | Check authentication status | No |
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/signup` | User registration | No |
| POST | `/api/auth/logout` | User logout | Yes |
| GET | `/api/auth/unauthorized` | Unauthorized response | No |

### User Routes (`/api/user`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/user/lookup/<username>` | Get user by username | No |
| PUT | `/api/user` | Update current user profile | Yes |
| GET | `/api/user/<id>/resetImg` | Reset user profile image | Yes |

### Profile Routes (`/api/profile`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/profile/<username>` | Get profile by username | No |

### Post Routes (`/api/post`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/post/scroll/<length>` | Infinite scroll feed (paginated) | No |
| GET | `/api/post/explore/<length>` | Explore posts (paginated) | No |
| GET | `/api/post/<id>/scroll/<length>` | User-specific feed | No |
| GET | `/api/post/<post_id>` | Get specific post | No |
| POST | `/api/post` | Create new post | Yes |
| PUT | `/api/post/<post_id>` | Update existing post | Yes |
| DELETE | `/api/post/<post_id>` | Delete post | Yes |

### Follow Routes (`/api/follow`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/follow/<id>` | Get user's followers | No |
| GET | `/api/follow/<id>/following` | Get users that user follows | No |
| POST | `/api/follow` | Follow a user | Yes |
| DELETE | `/api/follow` | Unfollow a user | Yes |

### Like Routes (`/api/like`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/like/user/<id>` | Get likes by user | No |
| GET | `/api/like/<likeable_type>/<id>` | Get likes for content | No |
| POST | `/api/like` | Like content | Yes |
| DELETE | `/api/like` | Unlike content | Yes |

### Comment Routes (`/api/comment`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/comment` | Create comment | Yes |

### AWS Routes (`/api/aws`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/aws/<id>` | Upload profile image | Yes |
| POST | `/api/aws/post/<current_user_id>/<content>` | Upload post image | Yes |

### Search Routes (`/api/query`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/query` | Search functionality | No |

### Note Routes (`/api/note`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/note/<id>/scroll/<length>` | Get notes (paginated) | No |

## Frontend Routes

### Authentication Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/login` | Login.tsx | User login page |
| `/register` | RegisterForm.tsx | User registration page |

### Main Application Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Home.tsx | Main feed page |
| `/profile/:id` | Profile.tsx | User profile page |
| `/profile/:id/tagged` | Profile.tsx | Posts user is tagged in |
| `/profile/:id/saved` | Profile.tsx | User's saved posts (own profile only) |
| `/explore` | Explore.tsx | Explore/discover page |
| `/post/:id` | SinglePost.tsx | Individual post page |
| `/account` | EditProfile.tsx | Edit profile page |
| `/direct/inbox` | Direct Messages | Direct messages inbox |
| `/direct/c/:id` | Conversation | Individual conversation |

## Detailed Endpoint Documentation

### Authentication Endpoints

#### `GET /api/auth`
**Purpose**: Check if user is authenticated
**Response**: User data if authenticated, 401 if not

#### `POST /api/auth/login`
**Purpose**: Authenticate user with email and password
**Request Body**: `{"email": "user@example.com", "password": "password"}`
**Response**: User data and session cookie

#### `POST /api/auth/signup`
**Purpose**: Create new user account
**Request Body**: `{"username": "user", "email": "user@example.com", "full_name": "User Name", "password": "password", "confirm_password": "password", "bio": "Optional bio"}`
**Response**: Created user data

#### `POST /api/auth/logout`
**Purpose**: Log out current user
**Response**: Success message

#### `GET /api/auth/unauthorized`
**Purpose**: Standard unauthorized response
**Response**: 401 error with message

### User Endpoints

#### `GET /api/user/lookup/<username>`
**Purpose**: Find user by username
**Response**: User data or 404 if not found

#### `PUT /api/user`
**Purpose**: Update current user profile
**Request Body**: `{"id": 1, "username": "new_username", "email": "new_email@example.com", "full_name": "New Name", "bio": "New bio"}`
**Response**: Updated user data with access token

#### `GET /api/user/<id>/resetImg`
**Purpose**: Reset user's profile image
**Response**: User data with updated profile image

### Profile Endpoints

#### `GET /api/profile/<username>`
**Purpose**: Get user profile by username
**Response**: Profile data with posts, followers, etc.

### Post Endpoints

#### `GET /api/post/scroll/<length>`
**Purpose**: Get paginated posts for infinite scroll
**Parameters**: `length` - number of posts already loaded
**Response**: Array of posts with user data

#### `GET /api/post/explore/<length>`
**Purpose**: Get randomized posts for explore page
**Parameters**: `length` - number of posts already loaded
**Response**: Array of posts with user data

#### `GET /api/post/<id>/scroll/<length>`
**Purpose**: Get posts from users that specific user follows
**Parameters**: `id` - user ID, `length` - pagination offset
**Response**: Array of posts with likes and comments

#### `GET /api/post/<post_id>`
**Purpose**: Get specific post with full details
**Response**: Post data with user, comments, and likes

#### `POST /api/post`
**Purpose**: Create new post
**Request Body**: `{"caption": "Post caption", "image_url": "https://s3.amazonaws.com/image.jpg"}`
**Response**: Created post data

#### `PUT /api/post/<post_id>`
**Purpose**: Update post caption
**Request Body**: `{"caption": "Updated caption"}`
**Response**: Updated post data

#### `DELETE /api/post/<post_id>`
**Purpose**: Delete post
**Response**: Success message

### Follow Endpoints

#### `GET /api/follow/<id>`
**Purpose**: Get list of users following specified user
**Response**: `{"follows": [follow_data]}`

#### `GET /api/follow/<id>/following`
**Purpose**: Get list of users that specified user follows
**Response**: `{"follows": [follow_data]}`

#### `POST /api/follow`
**Purpose**: Follow a user
**Request Body**: `{"user_id": 123, "user_followed_id": 456}`
**Response**: Follow data

#### `DELETE /api/follow`
**Purpose**: Unfollow a user
**Request Body**: `{"user_id": 123, "user_followed_id": 456}`
**Response**: Deleted follow data

### Like Endpoints

#### `GET /api/like/user/<id>`
**Purpose**: Get all likes by a specific user
**Response**: `{"likes": [like_data]}`

#### `GET /api/like/<likeable_type>/<id>`
**Purpose**: Get likes for specific content (post or comment)
**Parameters**: `likeable_type` - "post" or "comment", `id` - content ID
**Response**: `{"likes": [like_data]}`

#### `POST /api/like`
**Purpose**: Like content
**Request Body**: `{"user_id": 123, "id": 456, "likeable_type": "post"}`
**Response**: `{"like": like_data, "like_list": [like_data]}`

#### `DELETE /api/like`
**Purpose**: Unlike content
**Request Body**: `{"id": 789}` (like ID)
**Response**: Deleted like data

### Comment Endpoints

#### `POST /api/comment`
**Purpose**: Create comment on post
**Request Body**: `{"user_id": 123, "post_id": 456, "content": "Comment text"}`
**Response**: `{"comment": comment_data_with_user_and_likes}`

### AWS Endpoints

#### `POST /api/aws/<id>`
**Purpose**: Upload profile image to S3
**Request**: FormData with 'file' field
**Response**: `{"img": "https://isntgram.s3.us-east-2.amazonaws.com/filename.png"}`

#### `POST /api/aws/post/<current_user_id>/<content>`
**Purpose**: Upload post image to S3 and create post
**Request**: FormData with 'file' field
**Parameters**: `current_user_id` - user ID, `content` - post caption
**Response**: Post data

### Search Endpoints

#### `GET /api/query`
**Purpose**: Search functionality
**Query Parameters**: `query` - search term
**Response**: `{"results": [user_data]}`

### Note Endpoints

#### `GET /api/note/<id>/scroll/<length>`
**Purpose**: Get notes with pagination
**Parameters**: `id` - user ID, `length` - pagination offset
**Response**: `{"notes": [note_data]}` (20 items per page)

## Authentication Requirements

### Public Endpoints (No Auth Required)
- `GET /api/auth` (check status)
- `POST /api/auth/login`
- `POST /api/auth/signup`
- `GET /api/auth/unauthorized`
- `GET /api/user/lookup/<username>`
- `GET /api/profile/<username>`
- `GET /api/post/scroll/<length>`
- `GET /api/post/explore/<length>`
- `GET /api/post/<id>/scroll/<length>`
- `GET /api/post/<post_id>`
- `GET /api/follow/<id>`
- `GET /api/follow/<id>/following`
- `GET /api/like/user/<id>`
- `GET /api/like/<likeable_type>/<id>`
- `GET /api/query`
- `GET /api/note/<id>/scroll/<length>`

### Protected Endpoints (Auth Required)
- `POST /api/auth/logout`
- `PUT /api/user`
- `GET /api/user/<id>/resetImg`
- `POST /api/post`
- `PUT /api/post/<post_id>`
- `DELETE /api/post/<post_id>`
- `POST /api/follow`
- `DELETE /api/follow`
- `POST /api/like`
- `DELETE /api/like`
- `POST /api/comment`
- `POST /api/aws/<id>`
- `POST /api/aws/post/<current_user_id>/<content>`

## Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "error": "Error message",
  "success": false,
  "details": ["Additional error details"]
}
```

## Rate Limiting

- **Authentication**: 5 login attempts per minute, 3 signup attempts per minute
- **Post Creation**: 10 posts per hour
- **Post Updates**: 20 updates per hour
- **Post Deletion**: 10 deletions per hour
- **Scroll/Explore**: 100 requests per minute

## Testing Endpoints

### Health Check
```bash
curl http://localhost:8080/api/auth
```

### Authentication Test
```bash
# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Check auth status
curl http://localhost:8080/api/auth \
  -H "Cookie: session=your_session_cookie"
```

### Post Creation Test
```bash
# Create post
curl -X POST http://localhost:8080/api/post \
  -H "Content-Type: application/json" \
  -H "Cookie: session=$SESSION" \
  -d '{"caption":"Test post","image_url":"https://example.com/image.jpg"}'

# Get posts
curl http://localhost:8080/api/post/scroll/0
```

### Search Test
```bash
# Search for users
curl "http://localhost:8080/api/query?query=john"
```

---

**Related Documentation**: [API Documentation](./api/) | [Database Schema](./reference/database.md) | [Development Guide](./development/getting-started.md)
