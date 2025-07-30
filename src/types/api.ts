import { apiCall } from '../utils/apiMiddleware';
import { User, Post, APIResponse } from './index';

// API utility functions with proper typing
export const api = {
  // User endpoints
  async getCurrentUser(): Promise<APIResponse<User>> {
    try {
      const data = (await apiCall('/api/auth/me')) as User;
      return { data };
    } catch {
      return { error: 'Failed to fetch current user' };
    }
  },

  async login(username: string, password: string): Promise<APIResponse<User>> {
    try {
      const data = (await apiCall('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })) as User;
      return { data };
    } catch {
      return { error: 'Network error during login' };
    }
  },

  // Post endpoints
  async getPosts(offset = 0): Promise<APIResponse<Post[]>> {
    try {
      const data = (await apiCall(`/api/post/scroll/${offset}`)) as {
        posts: Post[];
      };
      return { data: data.posts ?? [] };
    } catch {
      return { error: 'Failed to fetch posts' };
    }
  },

  async createPost(formData: FormData): Promise<APIResponse<Post>> {
    try {
      const data = (await apiCall('/api/post/', {
        method: 'POST',
        body: formData,
      })) as Post;
      return { data };
    } catch {
      return { error: 'Network error during post creation' };
    }
  },

  // Like endpoints
  async toggleLike(
    likeableId: number,
    likeableType: 'post' | 'comment'
  ): Promise<APIResponse<{ liked: boolean }>> {
    try {
      const data = (await apiCall('/api/like/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          likeableId: likeableId,
          likeableType: likeableType,
        }),
      })) as { liked: boolean };
      return { data: { liked: data.liked } };
    } catch {
      return { error: 'Network error during like toggle' };
    }
  },
};

// Utility functions
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
