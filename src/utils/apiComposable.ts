import { useCallback, useState } from 'react';
import { apiCall } from './apiMiddleware';
import {
  APIResponse,
  APIError,
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  UserLookupResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  ResetImageResponse,
  PostsResponse,
  CreatePostRequest,
  CreatePostResponse,
  UpdatePostRequest,
  UpdatePostResponse,
  SinglePostResponse,
  HomeFeedResponse,
  CreateCommentRequest,
  CreateCommentResponse,
  UpdateCommentRequest,
  UpdateCommentResponse,
  ToggleLikeRequest,
  ToggleLikeResponse,
  FollowUserRequest,
  FollowResponse,
  UnfollowResponse,
  SearchResponse,
  User,
  Post,
  PostDetail,
  ProfileResponse,
} from '../types';
import { useUser } from '../Contexts/userContext';

export function useApi() {
  const { currentUser, setCurrentUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = (): string | null => {
    return localStorage.getItem('Isntgram_access_token');
  };

  const setAuthToken = (token: string): void => {
    localStorage.setItem('Isntgram_access_token', token);
  };

  const removeAuthToken = (): void => {
    localStorage.removeItem('Isntgram_access_token');
  };

  const getAuthHeaders = (): Record<string, string> => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleApiError = (err: any): APIError => {
    if (err instanceof Error) {
      return { error: err.message };
    }
    return { error: 'An unexpected error occurred' };
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const authenticate = useCallback(async (): Promise<APIResponse<User>> => {
    try {
      setIsLoading(true);
      clearError();

      const response = (await apiCall('/api/auth', {
        headers: getAuthHeaders(),
      })) as { data?: { user: User } };

      if (response.data?.user) {
        setCurrentUser(response.data.user);
        return { data: response.data.user };
      }

      return { error: 'Not authenticated' };
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.error);
      return { error: apiError.error };
    } finally {
      setIsLoading(false);
    }
  }, [clearError, setCurrentUser]);

  const login = useCallback(
    async (data: LoginRequest): Promise<APIResponse<LoginResponse>> => {
      try {
        setIsLoading(true);
        clearError();

        const response = (await apiCall('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify(data),
        })) as { data?: LoginResponse };

        if (response.data?.user) {
          setCurrentUser(response.data.user);
          return { data: response.data };
        }

        return { error: 'Login failed' };
      } catch (err) {
        const apiError = handleApiError(err);
        setError(apiError.error);
        return { error: apiError.error };
      } finally {
        setIsLoading(false);
      }
    },
    [clearError, setCurrentUser]
  );

  const logout = useCallback(async (): Promise<
    APIResponse<{ message: string }>
  > => {
    try {
      setIsLoading(true);
      clearError();

      await apiCall('/api/auth/logout', {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      setCurrentUser(null);
      removeAuthToken();

      return { data: { message: 'Logged out successfully' } };
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.error);
      return { error: apiError.error };
    } finally {
      setIsLoading(false);
    }
  }, [clearError, setCurrentUser]);

  const signup = useCallback(
    async (data: SignupRequest): Promise<APIResponse<SignupResponse>> => {
      try {
        setIsLoading(true);
        clearError();

        const response = (await apiCall('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify(data),
        })) as { data?: SignupResponse };

        if (response.data?.user) {
          setCurrentUser(response.data.user);
          return { data: response.data };
        }

        return { error: 'Signup failed' };
      } catch (err) {
        const apiError = handleApiError(err);
        setError(apiError.error);
        return { error: apiError.error };
      } finally {
        setIsLoading(false);
      }
    },
    [clearError, setCurrentUser]
  );

  const lookupUser = useCallback(
    async (username: string): Promise<APIResponse<UserLookupResponse>> => {
      try {
        setIsLoading(true);
        clearError();

        const response = (await apiCall(`/api/user/lookup/${username}`, {
          headers: getAuthHeaders(),
        })) as { data?: UserLookupResponse };

        return { data: response.data };
      } catch (err) {
        const apiError = handleApiError(err);
        setError(apiError.error);
        return { error: apiError.error };
      } finally {
        setIsLoading(false);
      }
    },
    [clearError]
  );

  const getProfile = useCallback(
    async (username: string): Promise<APIResponse<ProfileResponse>> => {
      try {
        setIsLoading(true);
        clearError();

        const response = (await apiCall(`/api/profile/${username}`, {
          headers: getAuthHeaders(),
        })) as { data?: ProfileResponse };

        if (response.data?.user) {
          return { data: response.data };
        }

        return { error: 'User not found' };
      } catch (err) {
        const apiError = handleApiError(err);
        setError(apiError.error);
        return { error: apiError.error };
      } finally {
        setIsLoading(false);
      }
    },
    [clearError]
  );

  const updateUser = useCallback(
    async (
      data: UpdateUserRequest
    ): Promise<APIResponse<UpdateUserResponse>> => {
      try {
        setIsLoading(true);
        clearError();

        const response = (await apiCall('/api/user/update', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify(data),
        })) as { data?: UpdateUserResponse };

        if (response.data?.user) {
          setCurrentUser(response.data.user);
          if (response.data.accessToken) {
            setAuthToken(response.data.accessToken);
          }
          return { data: response.data };
        }

        return { error: 'Update failed' };
      } catch (err) {
        const apiError = handleApiError(err);
        setError(apiError.error);
        return { error: apiError.error };
      } finally {
        setIsLoading(false);
      }
    },
    [clearError, setCurrentUser]
  );

  const resetUserImage = useCallback(
    async (userId: number): Promise<APIResponse<ResetImageResponse>> => {
      try {
        setIsLoading(true);
        clearError();

        const response = (await apiCall(`/api/user/${userId}/reset-image`, {
          method: 'POST',
          headers: getAuthHeaders(),
        })) as { data?: ResetImageResponse };

        return { data: response.data };
      } catch (err) {
        const apiError = handleApiError(err);
        setError(apiError.error);
        return { error: apiError.error };
      } finally {
        setIsLoading(false);
      }
    },
    [clearError]
  );

  const getPosts = useCallback(
    async (offset: number): Promise<APIResponse<PostsResponse>> => {
      try {
        setIsLoading(true);
        clearError();

        const response = (await apiCall(`/api/post/scroll/${offset}`, {
          headers: getAuthHeaders(),
        })) as { data?: PostsResponse };

        return { data: response.data };
      } catch (err) {
        const apiError = handleApiError(err);
        setError(apiError.error);
        return { error: apiError.error };
      } finally {
        setIsLoading(false);
      }
    },
    [clearError]
  );

  const getExplorePosts = useCallback(
    async (offset: number): Promise<APIResponse<PostsResponse>> => {
      try {
        setIsLoading(true);
        clearError();

        const response = (await apiCall(`/api/post/explore/scroll/${offset}`, {
          headers: getAuthHeaders(),
        })) as { data?: PostsResponse };

        return { data: response.data };
      } catch (err) {
        const apiError = handleApiError(err);
        setError(apiError.error);
        return { error: apiError.error };
      } finally {
        setIsLoading(false);
      }
    },
    [clearError]
  );

  const createPost = useCallback(
    async (
      data: CreatePostRequest
    ): Promise<APIResponse<CreatePostResponse>> => {
      try {
        setIsLoading(true);
        clearError();

        const response = (await apiCall('/api/post/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify(data),
        })) as { data?: CreatePostResponse };

        return { data: response.data };
      } catch (err) {
        const apiError = handleApiError(err);
        setError(apiError.error);
        return { error: apiError.error };
      } finally {
        setIsLoading(false);
      }
    },
    [clearError]
  );

  const updatePost = useCallback(
    async (
      postId: number,
      data: UpdatePostRequest
    ): Promise<APIResponse<UpdatePostResponse>> => {
      try {
        setIsLoading(true);
        clearError();

        const response = (await apiCall(`/api/post/${postId}/update`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify(data),
        })) as { data?: UpdatePostResponse };

        return { data: response.data };
      } catch (err) {
        const apiError = handleApiError(err);
        setError(apiError.error);
        return { error: apiError.error };
      } finally {
        setIsLoading(false);
      }
    },
    [clearError]
  );

  const deletePost = useCallback(
    async (postId: number): Promise<APIResponse<{ message: string }>> => {
      try {
        setIsLoading(true);
        clearError();

        await apiCall(`/api/post/${postId}/delete`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });

        return { data: { message: 'Post deleted successfully' } };
      } catch (err) {
        const apiError = handleApiError(err);
        setError(apiError.error);
        return { error: apiError.error };
      } finally {
        setIsLoading(false);
      }
    },
    [clearError]
  );

  const getHomeFeed = useCallback(
    async (
      userId: number,
      offset: number
    ): Promise<APIResponse<HomeFeedResponse>> => {
      try {
        setIsLoading(true);
        clearError();

        const response = (await apiCall(
          `/api/post/home/${userId}/scroll/${offset}`,
          {
            headers: getAuthHeaders(),
          }
        )) as { data?: HomeFeedResponse };

        return { data: response.data };
      } catch (err) {
        const apiError = handleApiError(err);
        setError(apiError.error);
        return { error: apiError.error };
      } finally {
        setIsLoading(false);
      }
    },
    [clearError]
  );

  const getPost = useCallback(
    async (postId: number): Promise<APIResponse<SinglePostResponse>> => {
      try {
        setIsLoading(true);
        clearError();

        const response = (await apiCall(`/api/post/${postId}`, {
          headers: getAuthHeaders(),
        })) as { data?: SinglePostResponse };

        return { data: response.data };
      } catch (err) {
        const apiError = handleApiError(err);
        setError(apiError.error);
        return { error: apiError.error };
      } finally {
        setIsLoading(false);
      }
    },
    [clearError]
  );

  const createComment = useCallback(
    async (
      data: CreateCommentRequest
    ): Promise<APIResponse<CreateCommentResponse>> => {
      try {
        setIsLoading(true);
        clearError();

        const response = (await apiCall('/api/comment/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify(data),
        })) as { data?: CreateCommentResponse };

        return { data: response.data };
      } catch (err) {
        const apiError = handleApiError(err);
        setError(apiError.error);
        return { error: apiError.error };
      } finally {
        setIsLoading(false);
      }
    },
    [clearError]
  );

  const updateComment = useCallback(
    async (
      commentId: number,
      data: UpdateCommentRequest
    ): Promise<APIResponse<UpdateCommentResponse>> => {
      try {
        setIsLoading(true);
        clearError();

        const response = (await apiCall(`/api/comment/${commentId}/update`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify(data),
        })) as { data?: UpdateCommentResponse };

        return { data: response.data };
      } catch (err) {
        const apiError = handleApiError(err);
        setError(apiError.error);
        return { error: apiError.error };
      } finally {
        setIsLoading(false);
      }
    },
    [clearError]
  );

  const deleteComment = useCallback(
    async (commentId: number): Promise<APIResponse<{ message: string }>> => {
      try {
        setIsLoading(true);
        clearError();

        await apiCall(`/api/comment/${commentId}/delete`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });

        return { data: { message: 'Comment deleted successfully' } };
      } catch (err) {
        const apiError = handleApiError(err);
        setError(apiError.error);
        return { error: apiError.error };
      } finally {
        setIsLoading(false);
      }
    },
    [clearError]
  );

  const toggleLike = useCallback(
    async (
      data: ToggleLikeRequest
    ): Promise<APIResponse<ToggleLikeResponse>> => {
      try {
        setIsLoading(true);
        clearError();

        const response = (await apiCall('/api/like/toggle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify(data),
        })) as { data?: ToggleLikeResponse };

        return { data: response.data };
      } catch (err) {
        const apiError = handleApiError(err);
        setError(apiError.error);
        return { error: apiError.error };
      } finally {
        setIsLoading(false);
      }
    },
    [clearError]
  );

  const followUser = useCallback(
    async (data: FollowUserRequest): Promise<APIResponse<FollowResponse>> => {
      try {
        setIsLoading(true);
        clearError();

        const response = (await apiCall('/api/follow/follow', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify(data),
        })) as { data?: FollowResponse };

        return { data: response.data };
      } catch (err) {
        const apiError = handleApiError(err);
        setError(apiError.error);
        return { error: apiError.error };
      } finally {
        setIsLoading(false);
      }
    },
    [clearError]
  );

  const unfollowUser = useCallback(
    async (data: FollowUserRequest): Promise<APIResponse<UnfollowResponse>> => {
      try {
        setIsLoading(true);
        clearError();

        const response = (await apiCall('/api/follow/unfollow', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify(data),
        })) as { data?: UnfollowResponse };

        return { data: response.data };
      } catch (err) {
        const apiError = handleApiError(err);
        setError(apiError.error);
        return { error: apiError.error };
      } finally {
        setIsLoading(false);
      }
    },
    [clearError]
  );

  const getFollowers = useCallback(
    async (userId: number): Promise<APIResponse<{ follows: any[] }>> => {
      try {
        setIsLoading(true);
        clearError();

        const response = (await apiCall(`/api/follow/followers/${userId}`, {
          headers: getAuthHeaders(),
        })) as { data?: { follows: any[] } };

        return { data: response.data };
      } catch (err) {
        const apiError = handleApiError(err);
        setError(apiError.error);
        return { error: apiError.error };
      } finally {
        setIsLoading(false);
      }
    },
    [clearError]
  );

  const getFollowing = useCallback(
    async (userId: number): Promise<APIResponse<{ follows: any[] }>> => {
      try {
        setIsLoading(true);
        clearError();

        const response = (await apiCall(`/api/follow/following/${userId}`, {
          headers: getAuthHeaders(),
        })) as { data?: { follows: any[] } };

        return { data: response.data };
      } catch (err) {
        const apiError = handleApiError(err);
        setError(apiError.error);
        return { error: apiError.error };
      } finally {
        setIsLoading(false);
      }
    },
    [clearError]
  );

  const search = useCallback(
    async (query: string): Promise<APIResponse<SearchResponse>> => {
      try {
        setIsLoading(true);
        clearError();

        const response = (await apiCall(
          `/api/search?q=${encodeURIComponent(query)}`,
          {
            headers: getAuthHeaders(),
          }
        )) as { data?: SearchResponse };

        return { data: response.data };
      } catch (err) {
        const apiError = handleApiError(err);
        setError(apiError.error);
        return { error: apiError.error };
      } finally {
        setIsLoading(false);
      }
    },
    [clearError]
  );

  return {
    // Auth
    authenticate,
    login,
    logout,
    signup,

    // User
    lookupUser,
    getProfile,
    updateUser,
    resetUserImage,

    // Posts
    getPosts,
    getExplorePosts,
    createPost,
    updatePost,
    deletePost,
    getHomeFeed,
    getPost,

    // Comments
    createComment,
    updateComment,
    deleteComment,

    // Likes
    toggleLike,

    // Follows
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,

    // Search
    search,

    // State
    isLoading,
    error,
    clearError,

    // Utility functions
    getAuthToken,
    setAuthToken,
    removeAuthToken,
    getAuthHeaders,
    handleApiError,
  };
}
