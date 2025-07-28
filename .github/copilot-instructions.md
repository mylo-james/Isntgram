# Isntgram Copilot Instructions

> ✅ **Modernized Project (2025)**: Successfully modernized from 2020 codebase. Major migrations complete: React 18.3.1, React Router v6, Vite build system, ESLint/Prettier standards, 0 vulnerabilities achieved.
>
> ✅ **CSS Migration Complete (Phase 2.4)**: Successfully migrated from styled-components to Tailwind CSS v4 with modern design tokens
> 🎯 **Current Phase**: TypeScript Integration (Phase 2.3) - Adding type safety foundation
> 📋 **Next Phase**: Performance Optimization & Testing - Final modernization touches

## Project Overview

Full-stack Instagram clone with modern React 18 frontend and Flask 3.1 backend. Uses PostgreSQL for data persistence and AWS S3 for image storage. Originally built in 2020, modernized to 2025 standards with Vite build system and comprehensive security updates.

## Architecture

### Backend (Flask 3.1 + SQLAlchemy)

- **Entry Point**: `app/__init__.py` - Flask app initialization with blueprint registration
- **API Routes**: Each feature has its own blueprint in `app/api/` (auth, posts, users, etc.)
- **Models**: SQLAlchemy models in `app/models/` with relationships for social media features
- **Database**: PostgreSQL with Alembic migrations in `migrations/`
- **Security**: Updated to Flask 3.1.1 with modern secure dependencies, 0 vulnerabilities

**Key Blueprint Pattern**:

```python
# app/api/post_routes.py
post_routes = Blueprint("posts", __name__)
@post_routes.route("/<id>/scroll/<length>")  # Pagination pattern
```

### Frontend (React 18 + Vite + Modern Tooling)

- **Entry Point**: `src/App.js` with multiple context providers
- **Build System**: Vite 7.0.6 (migrated from Create React App for 10-100x faster builds)
- **Routing**: React Router v6.28.0 (migrated from v5 with modern Routes/Route syntax)
- **State Management**: Multiple React Contexts (`UserContext`, `PostsContext`, `LikeContext`, etc.)
- **Code Quality**: ESLint 8.57.1 + Prettier with single quotes, accessibility rules
- **Styling**: Tailwind CSS v4 with custom Instagram design tokens (migrated from styled-components)

**Context Pattern**:

```javascript
// All contexts follow this pattern in Contexts/
const { currentUser, setCurrentUser } = useContext(UserContext);
```

**Modern Router Pattern (v6)**:

```javascript
// Updated from React Router v5 to v6
import { Routes, Route, Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'; // replaces useHistory
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

# Frontend (from root)
npm run dev  # Vite dev server on localhost:3003

# Database
flask db upgrade  # Run migrations
```

### VS Code Tasks

- "Start Flask Backend" - Runs Flask dev server
- "Start React Frontend" - Runs Vite dev server
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

- Pages in `src/Pages/` (moved from react-app/src/Pages/)
- Reusable components in `src/components/` (moved from react-app/src/components/)
- Context providers wrap entire app in `App.js`

## Current Technical Debt

- ~~React 17~~ ✅ **COMPLETED**: Updated to React 18.3.1
- ~~175 npm vulnerabilities~~ ✅ **COMPLETED**: 0 vulnerabilities achieved
- No TypeScript (Phase 2.3 planned after CSS migration)
- ~~No code standards~~ ✅ **COMPLETED**: ESLint + Prettier configured
- ~~Outdated build system~~ ✅ **COMPLETED**: Migrated to Vite 7.0.6
- styled-components dependency (Phase 2.4 complete)
- Prop drilling instead of proper state management

## Database Schema

Key tables: `users`, `posts`, `comments`, `likes`, `follows`

- Users have profile_image_url (S3)
- Posts have image_url (S3) and caption
- Likes are polymorphic (posts + comments)
- Follows create many-to-many user relationships

## Integration Points

- **AWS S3**: Image storage with public URLs
- **PostgreSQL**: Via SQLAlchemy ORM
- **Vite Proxy**: Frontend development proxies API requests to Flask backend
- **CSRF**: Flask-WTF tokens in cookies, validated on forms
