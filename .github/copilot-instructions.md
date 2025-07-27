# Isntgram Copilot Instructions

> ⚠️ **Legacy Project Notice**: This is an old project from 2020 currently undergoing modernization. These instructions reflect the current codebase state but will be updated as we implement fixes and modernizations. See `MODERNIZATION_ROADMAP.md` for planned updates.
>
> 🔄 **Modernization Philosophy**: Existing patterns should be evaluated, not blindly followed. Prioritize modern best practices over legacy approaches. When suggesting changes, favor current industry standards over maintaining consistency with outdated code.

## Project Overview

Full-stack Instagram clone with React frontend and Flask backend. Uses PostgreSQL for data persistence and AWS S3 for image storage. Built in 2020, currently undergoing modernization.

## Architecture

### Backend (Flask + SQLAlchemy)

- **Entry Point**: `app/__init__.py` - Flask app initialization with blueprint registration
- **API Routes**: Each feature has its own blueprint in `app/api/` (auth, posts, users, etc.)
- **Models**: SQLAlchemy models in `app/models/` with relationships for social media features
- **Database**: PostgreSQL with Alembic migrations in `migrations/`

**Key Blueprint Pattern**:

```python
# app/api/post_routes.py
post_routes = Blueprint("posts", __name__)
@post_routes.route("/<id>/scroll/<length>")  # Pagination pattern
```

### Frontend (React + Context API)

- **Entry Point**: `react-app/src/App.js` with multiple context providers
- **State Management**: Multiple React Contexts (`UserContext`, `PostsContext`, `LikeContext`, etc.)
- **Routing**: React Router v5 with custom `ProtectedRoute` and `AuthRoute` components
- **Styling**: Styled-components for component-level styling

**Context Pattern**:

```javascript
// All contexts follow this pattern in Contexts/
const { currentUser, setCurrentUser } = useContext(UserContext);
```

## Critical Patterns

### Authentication Flow

1. CSRF tokens via Flask-WTF (auto-injected in cookies)
2. Flask-Login for session management
3. JWT tokens for API authentication (stored in localStorage as "Isntgram_access_token")
4. Protected routes redirect to `/auth/login` if no current user

### API Response Format

Most endpoints return data with nested relationships:

```json
{
  "post": { "user": {...}, "comments": [...], "likes": [...] },
  "posts": [...]
}
```

### Infinite Scroll Implementation

Uses `react-infinite-scroller` with pagination via URL params:

- Pattern: `/api/post/scroll/<length>` where length = items already loaded
- Fetches 3 items at a time
- State managed in component with `toRender` array

### Database Relationships

- **Polymorphic Likes**: `likeable_type` + `likeable_id` for posts/comments
- **Follow System**: `Follow` model with `user_id` and `user_followed_id`
- **Image Storage**: AWS S3 URLs stored as strings in database

## Development Workflows

### Local Development

```bash
# Backend (from root)
python -m flask run  # Uses .flaskenv

# Frontend (from react-app/)
npm start  # Proxies to localhost:5000

# Database
flask db upgrade  # Run migrations
```

### VS Code Tasks

- "Start Flask Backend" - Runs Flask dev server
- "Start React Frontend" - Runs React dev server
- "Open Modernization Roadmap" - Opens project roadmap

### File Upload Pattern

All image uploads go through `app/api/aws_routes.py`:

1. File received via FormData
2. Filename changed with timestamp
3. Uploaded to S3 bucket 'isntgram'
4. S3 URL saved to database

## Project-Specific Conventions

### Error Handling

- Backend: Returns `{"error": "message"}` with HTTP status codes
- Frontend: Uses `react-toastify` for user notifications
- Auth errors automatically redirect to login

### API Naming

- Snake_case in Python/database
- camelCase in JavaScript/React
- Blueprint prefixes: `/api/auth`, `/api/post`, `/api/user`, etc.

### Component Structure

- Pages in `react-app/src/Pages/`
- Reusable components in `react-app/src/components/`
- Context providers wrap entire app in `App.js`

## Current Technical Debt

- React 17 (needs update to 18+)
- 175 npm vulnerabilities
- No TypeScript
- Prop drilling instead of proper state management
- N+1 queries in some endpoints (see `profile_routes.py`)

## Database Schema

Key tables: `users`, `posts`, `comments`, `likes`, `follows`

- Users have profile_image_url (S3)
- Posts have image_url (S3) and caption
- Likes are polymorphic (posts + comments)
- Follows create many-to-many user relationships

## Integration Points

- **AWS S3**: Image storage with public URLs
- **PostgreSQL**: Via SQLAlchemy ORM
- **React Proxy**: Frontend development proxies to Flask backend
- **CSRF**: Flask-WTF tokens in cookies, validated on forms
