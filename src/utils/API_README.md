# API Integration Guide

This document explains how to use the new API composable system that aligns with the backend API structure.

## Overview

The new API system provides:
- **Type-safe API calls** with full TypeScript support
- **Centralized error handling** and loading states
- **Authentication management** with automatic token handling
- **Consistent response formatting** that matches the backend
- **Easy-to-use composable** that can be used in any component

## Quick Start

### 1. Import the API Composable

```typescript
import { useApi } from '../utils/apiComposable';
```

### 2. Use in Your Component

```typescript
const MyComponent = () => {
  const { 
    login, 
    getPosts, 
    isLoading, 
    error, 
    clearError 
  } = useApi();

  const handleLogin = async () => {
    const response = await login({
      email: 'user@example.com',
      password: 'password123'
    });

    if (response.error) {
      console.error('Login failed:', response.error);
    } else {
      console.log('Login successful:', response.data);
    }
  };

  return (
    <div>
      {error && <div className="error">{error}</div>}
      <button onClick={handleLogin} disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </div>
  );
};
```

## Available API Methods

### Authentication
- `authenticate()` - Check if user is authenticated
- `login(data: LoginRequest)` - Log in user
- `logout()` - Log out user
- `signup(data: SignupRequest)` - Create new account

### User Management
- `lookupUser(username: string)` - Get user by username
- `updateUser(data: UpdateUserRequest)` - Update user profile
- `resetUserImage(userId: number)` - Reset profile image

### Posts
- `getPosts(offset: number)` - Get paginated posts
- `getExplorePosts(offset: number)` - Get explore page posts
- `createPost(data: CreatePostRequest)` - Create new post
- `updatePost(postId: number, data: UpdatePostRequest)` - Update post
- `deletePost(postId: number)` - Delete post
- `getHomeFeed(userId: number, offset: number)` - Get user's home feed
- `getPost(postId: number)` - Get single post with details

### Comments
- `createComment(data: CreateCommentRequest)` - Add comment
- `updateComment(commentId: number, data: UpdateCommentRequest)` - Edit comment
- `deleteComment(commentId: number)` - Delete comment

### Likes
- `toggleLike(data: ToggleLikeRequest)` - Like/unlike post or comment

### Follows
- `followUser(data: FollowUserRequest)` - Follow user
- `unfollowUser(data: FollowUserRequest)` - Unfollow user
- `getFollowers(userId: number)` - Get user's followers
- `getFollowing(userId: number)` - Get users being followed

### Search
- `search(query: string)` - Search users and posts

## State Management

The composable provides these reactive states:

```typescript
const {
  isLoading,      // boolean - true when any API call is in progress
  error,          // string | null - current error message
  currentUser,    // User | null - currently authenticated user
  isAuthenticated // boolean - computed from currentUser
} = useApi();
```

## Error Handling

All API methods return a consistent response format:

```typescript
interface APIResponse<T> {
  data?: T;           // Success data
  error?: string;     // Error message
  message?: string;   // Success message
  success?: boolean;  // Success flag
}
```

Example usage:

```typescript
const handleCreatePost = async () => {
  const response = await createPost({
    image_url: 'https://example.com/image.jpg',
    caption: 'My new post!'
  });

  if (response.error) {
    // Handle error
    console.error('Failed to create post:', response.error);
  } else {
    // Handle success
    console.log('Post created:', response.data);
  }
};
```

## TypeScript Types

All API types are available from the types module:

```typescript
import type {
  LoginRequest,
  LoginResponse,
  Post,
  User,
  APIResponse,
  // ... and many more
} from '../types/api';
```

## Migration Guide

### From Old API Calls

**Before:**
```typescript
import { apiCall } from '../utils/apiMiddleware';

const handleLogin = async () => {
  try {
    await apiCall('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'user', password: 'pass' })
    });
    window.location.reload();
  } catch (error) {
    console.error('Login failed');
  }
};
```

**After:**
```typescript
import { useApi } from '../utils/apiComposable';

const MyComponent = () => {
  const { login, isLoading, error } = useApi();

  const handleLogin = async () => {
    const response = await login({
      email: 'user@example.com',
      password: 'pass'
    });

    if (response.error) {
      console.error('Login failed:', response.error);
    } else {
      window.location.reload();
    }
  };

  return (
    <button onClick={handleLogin} disabled={isLoading}>
      {isLoading ? 'Logging in...' : 'Login'}
    </button>
  );
};
```

### From Direct Fetch Calls

**Before:**
```typescript
const getPosts = async () => {
  const response = await fetch('/api/post/scroll/0');
  const data = await response.json();
  return data.posts;
};
```

**After:**
```typescript
const MyComponent = () => {
  const { getPosts, isLoading } = useApi();

  const loadPosts = async () => {
    const response = await getPosts(0);
    if (response.data) {
      console.log('Posts loaded:', response.data.posts);
    }
  };
};
```

## Authentication Flow

The composable automatically handles authentication:

1. **Login/Signup** - Sets current user and stores token
2. **API Calls** - Automatically includes auth headers
3. **Logout** - Clears user state and removes token
4. **Token Management** - Handles token storage and retrieval

## Best Practices

### 1. Always Check for Errors

```typescript
const response = await someApiCall();
if (response.error) {
  // Handle error appropriately
  showError(response.error);
  return;
}
// Handle success
```

### 2. Use Loading States

```typescript
return (
  <div>
    {isLoading && <LoadingSpinner />}
    <button disabled={isLoading}>
      {isLoading ? 'Processing...' : 'Submit'}
    </button>
  </div>
);
```

### 3. Clear Errors When Starting New Operations

```typescript
const handleSubmit = async () => {
  clearError(); // Clear previous errors
  const response = await submitData();
  // Handle response...
};
```

### 4. Use TypeScript for Type Safety

```typescript
import type { CreatePostRequest, CreatePostResponse } from '../types/api';

const createPost = async (data: CreatePostRequest): Promise<CreatePostResponse> => {
  const response = await api.createPost(data);
  return response;
};
```

## Backend API Alignment

The new API system is designed to match the backend API exactly:

- **Request formats** match backend schemas
- **Response formats** match backend responses
- **Error handling** follows backend error patterns
- **Authentication** uses the same token system
- **URLs and methods** match backend routes

## Troubleshooting

### Common Issues

1. **Type Mismatches** - Ensure you're using the correct types from `../types/api`
2. **Authentication Errors** - Check that tokens are being stored/retrieved correctly
3. **Loading States** - Make sure to handle `isLoading` state in your UI
4. **Error Display** - Always check for `response.error` before accessing `response.data`

### Debug Tips

```typescript
// Enable detailed logging
const { login } = useApi();

const handleLogin = async () => {
  console.log('Starting login...');
  const response = await login(credentials);
  console.log('Login response:', response);
  
  if (response.error) {
    console.error('Login error:', response.error);
  } else {
    console.log('Login success:', response.data);
  }
};
```

## Examples

### Complete Login Component

```typescript
import React, { useState } from 'react';
import { useApi } from '../utils/apiComposable';
import type { LoginRequest } from '../types/api';

const LoginComponent = () => {
  const { login, isLoading, error, clearError } = useApi();
  const [credentials, setCredentials] = useState<LoginRequest>({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const response = await login(credentials);
    
    if (response.error) {
      // Error is automatically set in the composable
      return;
    }

    // Success - redirect or update UI
    window.location.href = '/dashboard';
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      
      <input
        type="email"
        value={credentials.email}
        onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
        disabled={isLoading}
      />
      
      <input
        type="password"
        value={credentials.password}
        onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
        disabled={isLoading}
      />
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};
```

### Posts List Component

```typescript
import React, { useEffect, useState } from 'react';
import { useApi } from '../utils/apiComposable';
import type { Post } from '../types/api';

const PostsList = () => {
  const { getPosts, isLoading, error } = useApi();
  const [posts, setPosts] = useState<Post[]>([]);
  const [offset, setOffset] = useState(0);

  const loadPosts = async () => {
    const response = await getPosts(offset);
    
    if (response.data) {
      setPosts(prev => [...prev, ...response.data.posts]);
      setOffset(prev => prev + response.data.posts.length);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <div>
      {error && <div className="error">{error}</div>}
      
      <div className="posts-grid">
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      
      {isLoading && <div className="loading">Loading more posts...</div>}
      
      <button onClick={loadPosts} disabled={isLoading}>
        Load More
      </button>
    </div>
  );
};
```

This new API system provides a robust, type-safe, and easy-to-use interface for all backend communication while maintaining consistency with the backend API structure. 