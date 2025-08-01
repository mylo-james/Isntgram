// Core Application Types for Isntgram
// Backend-aligned types that match the API schemas after middleware conversion

// ============================================================================
// API TYPES (Backend-aligned)
// ============================================================================

// Re-export all types from api.ts for easy access
export * from './api';

// ============================================================================
// CONTEXT TYPES
// ============================================================================

import type { User, Post } from './api';

export interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (_user: User | null) => void;
  isAuthenticated: boolean;
}

// Posts context expects Record<number, Post> (object with post IDs as keys)
export interface PostsContextType {
  posts: Record<number, Post>;
  setPosts: React.Dispatch<React.SetStateAction<Record<number, Post>>>;
  postOrder: Set<number>;
  setPostOrder: React.Dispatch<React.SetStateAction<Set<number>>>;
}

// Like context expects Record<string, LikeObject> | null
export interface LikeObject {
  id: number;
  userId: number;
  postId?: number;
  commentId?: number;
}

export interface LikeContextType {
  likes: Record<string, LikeObject> | null;
  setLikes: React.Dispatch<
    React.SetStateAction<Record<string, LikeObject> | null>
  >;
}

// Follow context expects Set<number>
export interface FollowContextType {
  follows: Set<number>;
  setFollows: React.Dispatch<React.SetStateAction<Set<number>>>;
}

// Profile context expects User | null
export interface ProfileContextType {
  profileData: User | null;
  setProfileData: React.Dispatch<React.SetStateAction<User | null>>;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  username: string;
  email: string;
  fullName: string;
  password: string;
  passwordConfirm: string;
  bio?: string;
}

export interface PostFormData {
  caption: string;
  image: File;
}

export interface CommentFormData {
  content: string;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) {
    return 'Just now';
  } else if (diffHours < 24) {
    return `${diffHours}h`;
  } else if (diffDays < 7) {
    return `${diffDays}d`;
  } else {
    return date.toLocaleDateString();
  }
};

export const isValidImageFile = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  return validTypes.includes(file.type) && file.size <= maxSize;
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('Isntgram_access_token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('Isntgram_access_token', token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('Isntgram_access_token');
};
