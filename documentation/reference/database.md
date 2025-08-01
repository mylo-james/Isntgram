# Database Design & Schema

Complete guide to the Isntgram database architecture, models, relationships, and optimization strategies.

## Table of Contents

- [Database Overview](#database-overview)
- [Schema Design](#schema-design)
- [Model Relationships](#model-relationships)
- [Data Types & Constraints](#data-types--constraints)
- [Indexing Strategy](#indexing-strategy)
- [Performance Optimization](#performance-optimization)
- [Migration Management](#migration-management)

## Database Overview

Isntgram uses **PostgreSQL 14+** as the primary database with **SQLAlchemy 2.0** ORM for modern, type-safe database operations. The schema is designed for social media scalability with optimized relationships and indexes.

### Technology Stack

- **Database**: PostgreSQL 14+ with JSONB support
- **ORM**: SQLAlchemy 2.0 with modern async patterns
- **Migrations**: Alembic for version control
- **Connection Pooling**: PostgreSQL connection pooling
- **Caching**: Redis for query result caching

### Database Configuration

```python
# config.py
SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
    'postgresql://username:password@localhost/isntgram'
SQLALCHEMY_TRACK_MODIFICATIONS = False
SQLALCHEMY_ENGINE_OPTIONS = {
    'pool_size': 20,
    'pool_recycle': 3600,
    'pool_pre_ping': True,
    'echo': False  # Set to True for SQL debugging
}
```

## Schema Design

### Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Post : "creates"
    User ||--o{ Comment : "writes"
    User ||--o{ Like : "gives"
    User ||--o{ Follow : "follows/followed_by"
    Post ||--o{ Comment : "has"
    Post ||--o{ Like : "receives"
    Comment ||--o{ Like : "receives"
    
    User {
        int id PK
        string username UK
        string email UK
        string hashed_password
        string full_name
        string profile_image_url
        text bio
        datetime created_at
        datetime updated_at
    }
    
    Post {
        int id PK
        int user_id FK
        string image_url
        text caption
        datetime created_at
        datetime updated_at
    }
    
    Comment {
        int id PK
        int user_id FK
        int post_id FK
        text content
        datetime created_at
        datetime updated_at
    }
    
    Like {
        int id PK
        int user_id FK
        string likeable_type
        int likeable_id
        datetime created_at
    }
    
    Follow {
        int id PK
        int user_id FK
        int user_followed_id FK
        datetime created_at
    }
```

### Core Tables

#### Users Table

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(128) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    profile_image_url VARCHAR(255),
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Constraints and checks
ALTER TABLE users ADD CONSTRAINT username_format 
    CHECK (username ~ '^[a-zA-Z0-9_]{3,30}$');
ALTER TABLE users ADD CONSTRAINT email_format 
    CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
```

#### Posts Table

```sql
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    image_url VARCHAR(2000) NOT NULL,
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Constraints
ALTER TABLE posts ADD CONSTRAINT caption_length 
    CHECK (LENGTH(caption) <= 2000);
```

#### Comments Table

```sql
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Constraints
ALTER TABLE comments ADD CONSTRAINT content_not_empty 
    CHECK (LENGTH(TRIM(content)) > 0);
ALTER TABLE comments ADD CONSTRAINT content_length 
    CHECK (LENGTH(content) <= 1000);
```

#### Likes Table (Polymorphic)

```sql
CREATE TABLE likes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    likeable_type VARCHAR(50) NOT NULL,
    likeable_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, likeable_type, likeable_id)
);

-- Constraints
ALTER TABLE likes ADD CONSTRAINT valid_likeable_type 
    CHECK (likeable_type IN ('post', 'comment'));
```

#### Follows Table

```sql
CREATE TABLE follows (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_followed_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, user_followed_id),
    CHECK (user_id != user_followed_id)
);
```

## Model Relationships

### SQLAlchemy 2.0 Models

#### User Model

```python
# app/models/user.py
from __future__ import annotations
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime

from ..models import db
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import func, String, Integer, DateTime, Text
from sqlalchemy.orm import validates, Mapped, mapped_column, relationship
from flask_login import UserMixin

if TYPE_CHECKING:
    from .post import Post
    from .follow import Follow
    from .like import Like
    from .comment import Comment

class User(db.Model, UserMixin):
    __tablename__ = 'users'

    # Modern SQLAlchemy 2.0 mapped columns with type annotations
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    username: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    hashed_password: Mapped[str] = mapped_column(String(128), nullable=False)
    profile_image_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(), 
        onupdate=func.now(),
        nullable=False
    )

    # Modern SQLAlchemy 2.0 relationships with type annotations
    posts: Mapped[List[Post]] = relationship("Post", back_populates="user", lazy="select")
    follows: Mapped[List[Follow]] = relationship("Follow", back_populates="user", lazy="select")
    likes: Mapped[List[Like]] = relationship("Like", back_populates="user", lazy="select")
    comments: Mapped[List[Comment]] = relationship("Comment", back_populates="user", lazy="select")

    @validates('username', 'email')
    def validate_username(self, key: str, value: str) -> str:
        if key == 'username':
            if not value:
                raise AssertionError('Must provide a username!')
            if User.query.filter(User.username == value).first():
                raise AssertionError('Username already exists!')
        if key == 'email':
            if not value:
                raise AssertionError('Must provide an email!')
            if User.query.filter(User.email == value).first():
                raise AssertionError('Email already exists!')

        return value

    @property
    def password(self) -> str:
        return self.hashed_password

    @password.setter
    def password(self, password: str) -> None:
        self.hashed_password = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.hashed_password, password)

    def to_dict(self) -> dict[str, any]:
        """Convert user instance to dictionary for API responses."""
        return {
            "id": self.id, 
            "email": self.email, 
            "full_name": self.full_name, 
            "username": self.username,
            "profile_image_url": self.profile_image_url,
            "bio": self.bio,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
```

#### Post Model

```python
# app/models/post.py
from __future__ import annotations
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime

from ..models import db
from sqlalchemy import func, String, Integer, DateTime, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from .user import User
    from .comment import Comment

class Post(db.Model):
    __tablename__ = "posts"

    # Modern SQLAlchemy 2.0 mapped columns with type annotations
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        Integer, 
        ForeignKey("users.id", ondelete="CASCADE"), 
        nullable=False,
        index=True  # Performance: FK index
    )
    image_url: Mapped[str] = mapped_column(String(2000), nullable=False)
    caption: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        nullable=False,
        index=True  # Performance: Common query field
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Modern SQLAlchemy 2.0 relationships with optimized loading
    user: Mapped[User] = relationship("User", back_populates="posts", lazy="joined")
    comments: Mapped[List[Comment]] = relationship(
        "Comment", 
        back_populates="post", 
        lazy="select",
        cascade="all, delete-orphan"
    )

    def to_dict(self) -> dict[str, any]:
        """Convert post instance to dictionary for API responses."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "image_url": self.image_url,
            "caption": self.caption,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def to_dict_with_user(self) -> dict[str, any]:
        """Convert post with user data for API responses (optimized with joined loading)."""
        base_dict = self.to_dict()
        if self.user:
            base_dict["user"] = self.user.to_dict()
        return base_dict
```

### Relationship Patterns

#### One-to-Many Relationships

```python
# User -> Posts (One user has many posts)
user = db.session.get(User, 1)
user_posts = user.posts  # Access all posts by this user

# Post -> Comments (One post has many comments)
post = db.session.get(Post, 1)
post_comments = post.comments  # Access all comments on this post
```

#### Many-to-Many Relationships

```python
# User follows (Many users can follow many users)
# Implemented via Follow model for additional metadata

def get_user_followers(user_id):
    follows = db.session.query(Follow).filter(Follow.user_followed_id == user_id).all()
    return [follow.follower for follow in follows]

def get_user_following(user_id):
    follows = db.session.query(Follow).filter(Follow.user_id == user_id).all()
    return [follow.followed for follow in follows]
```

#### Polymorphic Relationships

```python
# Likes can be on Posts or Comments (Polymorphic association)
def get_post_likes(post_id):
    return db.session.query(Like).filter(
        Like.likeable_type == 'post',
        Like.likeable_id == post_id
    ).all()

def get_comment_likes(comment_id):
    return db.session.query(Like).filter(
        Like.likeable_type == 'comment',
        Like.likeable_id == comment_id
    ).all()
```

## Data Types & Constraints

### Data Type Strategy

| Purpose | PostgreSQL Type | SQLAlchemy Type | Rationale |
|---------|----------------|-----------------|-----------|
| Primary Keys | SERIAL | Integer | Auto-incrementing, indexed |
| Usernames | VARCHAR(255) | String(255) | Limited length, indexed |
| Emails | VARCHAR(255) | String(255) | Standard email length |
| Text Content | TEXT | Text | Variable length content |
| URLs | VARCHAR(2000) | String(2000) | Can be very long (S3 URLs) |
| Timestamps | TIMESTAMPTZ | DateTime | Timezone-aware |
| Booleans | BOOLEAN | Boolean | Native boolean type |

### Constraint Examples

#### Check Constraints

```sql
-- Username format validation
ALTER TABLE users ADD CONSTRAINT username_format 
    CHECK (username ~ '^[a-zA-Z0-9_]{3,30}$');

-- Email format validation  
ALTER TABLE users ADD CONSTRAINT email_format 
    CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Caption length limit
ALTER TABLE posts ADD CONSTRAINT caption_length 
    CHECK (LENGTH(caption) <= 2000);

-- Comment content validation
ALTER TABLE comments ADD CONSTRAINT content_not_empty 
    CHECK (LENGTH(TRIM(content)) > 0);
```

#### Unique Constraints

```sql
-- Prevent duplicate likes
ALTER TABLE likes ADD CONSTRAINT unique_user_like 
    UNIQUE(user_id, likeable_type, likeable_id);

-- Prevent duplicate follows
ALTER TABLE follows ADD CONSTRAINT unique_follow 
    UNIQUE(user_id, user_followed_id);

-- Prevent self-following
ALTER TABLE follows ADD CONSTRAINT no_self_follow 
    CHECK (user_id != user_followed_id);
```

## Indexing Strategy

### Primary Indexes

```sql
-- Core performance indexes
CREATE INDEX idx_posts_user_id_created ON posts(user_id, created_at DESC);
CREATE INDEX idx_comments_post_id_created ON comments(post_id, created_at DESC);
CREATE INDEX idx_likes_user_likeable ON likes(user_id, likeable_type, likeable_id);
CREATE INDEX idx_follows_user_created ON follows(user_id, created_at DESC);
CREATE INDEX idx_follows_followed_created ON follows(user_followed_id, created_at DESC);
```

### Search Indexes

```sql
-- Username search (case-insensitive)
CREATE INDEX idx_users_username_lower ON users(LOWER(username));
CREATE INDEX idx_users_email_lower ON users(LOWER(email));

-- Full-text search for users
CREATE INDEX idx_users_search ON users USING gin(
    to_tsvector('english', username || ' ' || COALESCE(full_name, ''))
);

-- Caption search for posts
CREATE INDEX idx_posts_caption_search ON posts USING gin(
    to_tsvector('english', COALESCE(caption, ''))
);
```

### Composite Indexes

```sql
-- Feed generation (user's posts chronologically)
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at DESC);

-- Polymorphic like queries
CREATE INDEX idx_likes_type_id_created ON likes(likeable_type, likeable_id, created_at DESC);

-- User activity tracking
CREATE INDEX idx_posts_created_user ON posts(created_at DESC, user_id);
```

## Performance Optimization

### Query Optimization Examples

#### Efficient Feed Generation

```python
# Optimized feed query with proper joins
def get_user_feed(user_id, offset=0, limit=20):
    # Get users that current user follows
    following_subquery = db.session.query(Follow.user_followed_id)\
        .filter(Follow.user_id == user_id)\
        .subquery()
    
    # Get posts from followed users with eager loading
    posts = db.session.query(Post)\
        .join(User)\
        .filter(Post.user_id.in_(following_subquery))\
        .options(
            joinedload(Post.user),
            selectinload(Post.comments).joinedload(Comment.user),
            selectinload(Post.likes)
        )\
        .order_by(Post.created_at.desc())\
        .offset(offset)\
        .limit(limit)\
        .all()
    
    return posts
```

#### Efficient Like Counting

```python
# Optimized like counting with database aggregation
def get_posts_with_like_counts(post_ids):
    like_counts = db.session.query(
        Like.likeable_id,
        func.count(Like.id).label('like_count')
    )\
    .filter(Like.likeable_type == 'post')\
    .filter(Like.likeable_id.in_(post_ids))\
    .group_by(Like.likeable_id)\
    .all()
    
    return {like_id: count for like_id, count in like_counts}
```

### Connection Pool Configuration

```python
# app/config.py
import os

class Config:
    # Database connection pooling
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': 20,
        'pool_recycle': 3600,
        'pool_pre_ping': True,
        'pool_timeout': 30,
        'max_overflow': 40
    }
    
    # Query optimization
    SQLALCHEMY_RECORD_QUERIES = True
    SQLALCHEMY_SLOW_QUERY_THRESHOLD = 0.5
```

### N+1 Query Prevention

```python
# BAD: N+1 query pattern
posts = Post.query.all()
for post in posts:
    print(post.user.username)  # Triggers N additional queries

# GOOD: Eager loading
posts = Post.query.options(joinedload(Post.user)).all()
for post in posts:
    print(post.user.username)  # No additional queries
```

## Migration Management

### Alembic Configuration

```python
# migrations/env.py
from alembic import context
from sqlalchemy import engine_from_config, pool
from app import create_app
from app.models import db

config = context.config
app = create_app()

def run_migrations_online():
    """Run migrations in 'online' mode."""
    with app.app_context():
        connectable = db.engine
        
        with connectable.connect() as connection:
            context.configure(
                connection=connection,
                target_metadata=db.metadata,
                compare_type=True,
                compare_server_default=True
            )
            
            with context.begin_transaction():
                context.run_migrations()
```

### Migration Examples

#### Adding a New Column

```python
# Migration file: add_user_verification.py
"""Add email verification to users

Revision ID: abc123
Revises: def456
Create Date: 2025-07-31 18:30:00.000000
"""

from alembic import op
import sqlalchemy as sa

def upgrade():
    op.add_column('users', sa.Column('email_verified', sa.Boolean(), default=False))
    op.add_column('users', sa.Column('verification_token', sa.String(255), nullable=True))
    
    # Add index for verification lookups
    op.create_index('idx_users_verification_token', 'users', ['verification_token'])

def downgrade():
    op.drop_index('idx_users_verification_token', 'users')
    op.drop_column('users', 'verification_token')
    op.drop_column('users', 'email_verified')
```

#### Adding Complex Constraints

```python
# Migration file: add_user_constraints.py
def upgrade():
    # Add check constraint for username format
    op.create_check_constraint(
        'username_format',
        'users',
        "username ~ '^[a-zA-Z0-9_]{3,30}$'"
    )
    
    # Add check constraint for bio length
    op.create_check_constraint(
        'bio_length',
        'users', 
        'LENGTH(bio) <= 2000'
    )

def downgrade():
    op.drop_constraint('bio_length', 'users')
    op.drop_constraint('username_format', 'users')
```

### Migration Best Practices

1. **Always Review Generated Migrations**
```bash
# Generate migration
flask db migrate -m "Add user verification"

# Review the generated file before applying
# Edit if necessary for production safety
```

2. **Use Transactions for Complex Changes**
```python
def upgrade():
    # Wrap complex changes in transaction
    with op.get_bind().begin():
        op.add_column('users', sa.Column('new_field', sa.String(100)))
        op.execute("UPDATE users SET new_field = 'default' WHERE new_field IS NULL")
        op.alter_column('users', 'new_field', nullable=False)
```

3. **Handle Data Migration Safely**
```python
def upgrade():
    # Add column with default
    op.add_column('posts', sa.Column('view_count', sa.Integer(), default=0))
    
    # Populate existing records
    op.execute("UPDATE posts SET view_count = 0 WHERE view_count IS NULL")
    
    # Make NOT NULL after population
    op.alter_column('posts', 'view_count', nullable=False)
```

### Database CLI Commands

```python
# app/cli.py
import click
from flask.cli import with_appcontext
from app.models import db, User, Post, Comment, Like, Follow

@click.command()
@with_appcontext
def init_db():
    """Initialize the database."""
    db.create_all()
    click.echo('Initialized database.')

@click.command()
@with_appcontext
def seed_db():
    """Seed database with test data."""
    # Create test users
    user1 = User(username='testuser1', email='test1@example.com', password_hash='hash1')
    user2 = User(username='testuser2', email='test2@example.com', password_hash='hash2')
    
    db.session.add_all([user1, user2])
    db.session.commit()
    
    # Create test posts
    post1 = Post(user_id=user1.id, image_url='http://example.com/image1.jpg', caption='Test post 1')
    post2 = Post(user_id=user2.id, image_url='http://example.com/image2.jpg', caption='Test post 2')
    
    db.session.add_all([post1, post2])
    db.session.commit()
    
    click.echo('Database seeded with test data.')

@click.command()
@with_appcontext
def analyze_db():
    """Analyze database performance."""
    from sqlalchemy import text
    
    # Table sizes
    result = db.session.execute(text("""
        SELECT schemaname, tablename, 
               pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
    """))
    
    click.echo('Table sizes:')
    for row in result:
        click.echo(f'  {row.tablename}: {row.size}')
```

## Performance Monitoring

### Query Performance Tracking

```python
# app/utils/performance.py
import time
from functools import wraps
from flask import g
import logging

def track_db_queries(f):
    """Decorator to track database query performance."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        start_time = time.time()
        result = f(*args, **kwargs)
        end_time = time.time()
        
        duration = end_time - start_time
        if duration > 0.5:  # Log slow queries
            logging.warning(f'Slow query in {f.__name__}: {duration:.2f}s')
        
        return result
    return decorated_function

# Usage
@track_db_queries
def get_user_feed(user_id, limit=20):
    # Database operations here
    pass
```

---

## Related Documentation

- [System Architecture](../architecture/overview.md) - High-level system design
- [API Documentation](../README.md#api-documentation) - All API endpoints
- [Development Guide](../development/getting-started.md) - Local development setup
- [Performance Guide](../reference/performance.md) - Optimization strategies

---

*Last updated: July 31, 2025 | Part of Isntgram Production Infrastructure*
