# Isntgram Copilot Instructions

> ✅ **MODERNIZATION COMPLETE (2025)**: Successfully transformed 2020 codebase to cutting-edge 2025 standards!
>
> ✅ **Phase 1 & 2 Complete**: Security (0 vulnerabilities), React 18.3.1, TypeScript, Vite, Tailwind CSS v4, ESLint v9
> ✅ **Universal API Middleware**: snake_case ↔ camelCase conversion with 100% feature parity
> 🎯 **Current Phase**: TypeScript Enhancement (Phase 3) - Fix type safety and linting issues  
> 📋 **Next Phase**: Advanced Features - Modern Instagram capabilities

## Project Overview

Full-stack Instagram clone with cutting-edge React 18 + TypeScript frontend and Flask 3.1 backend. Uses PostgreSQL for data persistence and AWS S3 for image storage. Completely modernized from 2020 legacy code to 2025 standards with Vite build system, universal API middleware, and zero security vulnerabilities.

## Architecture

### Backend (Flask 3.1 + SQLAlchemy)

- **Entry Point**: `app/__init__.py` - Flask app initialization with blueprint registration
- **API Routes**: Each feature has its own blueprint in `app/api/` (auth, posts, users, etc.)
- **Models**: SQLAlchemy models in `app/models/` with relationships for social media features
- **Database**: PostgreSQL with Alembic migrations in `migrations/`
- **Security**: Updated to Flask 3.1.1 with modern secure dependencies, 0 vulnerabilities
- **API Format**: Serves snake_case but automatically converts to camelCase for frontend

**Key Blueprint Pattern**:

```python
# app/api/post_routes.py
post_routes = Blueprint("posts", __name__)
@post_routes.route("/<id>/scroll/<length>")  # Pagination pattern
```

### Frontend (React 18 + TypeScript + Vite + Modern Tooling)

- **Entry Point**: `src/App.tsx` with multiple context providers (TypeScript)
- **Build System**: Vite 7.0.6 (10-100x faster than Create React App)
- **Routing**: React Router v6.30.1 (modern Routes/Route syntax)
- **State Management**: TypeScript Context providers (`UserContext`, `PostsContext`, etc.)
- **Code Quality**: ESLint v9 + TypeScript + Prettier + markdownlint
- **Styling**: Tailwind CSS v4 with custom Instagram design tokens
- **Type Safety**: Complete TypeScript coverage with strict configuration

**Context Pattern**:

```typescript
// All contexts follow this pattern in Contexts/
const { currentUser, setCurrentUser } = useContext(UserContext);
```

**Modern Router Pattern (v6)**:

```typescript
// Updated from React Router v5 to v6 with TypeScript
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
- ~~No TypeScript~~ ✅ **COMPLETED**: Complete TypeScript migration with strict config
- ~~No code standards~~ ✅ **COMPLETED**: ESLint v9 + Prettier configured
- ~~Outdated build system~~ ✅ **COMPLETED**: Migrated to Vite 7.0.6
- ~~styled-components dependency~~ ✅ **COMPLETED**: Migrated to Tailwind CSS v4
- TypeScript type safety improvements (46 errors, 105 warnings identified)
- React Hooks violations (5 conditional hook calls)
- Context API prop drilling - **PLANNED**: Migrate to Redux Toolkit (Phase 2.7)
- Accessibility improvements needed
- API state management - **PLANNED**: RTK Query integration

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
