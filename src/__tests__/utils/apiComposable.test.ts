import { renderHook, act } from '@testing-library/react';
import { useApi } from '../../utils/apiComposable';

// Mock the useUser hook
jest.mock('../../Contexts/userContext', () => ({
  useUser: () => ({
    currentUser: null,
    setCurrentUser: jest.fn(),
  }),
}));

// Mock the apiMiddleware
jest.mock('../../utils/apiMiddleware', () => ({
  apiCall: jest.fn(),
}));

const { apiCall } = require('../../utils/apiMiddleware');

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('API Composable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  describe('Authentication Functions', () => {
    it('authenticate - successful authentication', async () => {
      const mockUser = { id: 1, username: 'testuser' };
      (apiCall as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });

      const { result } = renderHook(() => useApi());

      let response;
      await act(async () => {
        response = await result.current.authenticate();
      });

      expect(apiCall).toHaveBeenCalledWith('/api/auth', {
        headers: undefined,
      });
      expect(response).toEqual({ data: mockUser });
      expect(result.current.currentUser).toBe(mockUser);
    });

    it('authenticate - not authenticated', async () => {
      (apiCall as jest.Mock).mockResolvedValue({
        data: {},
      });

      const { result } = renderHook(() => useApi());

      let response;
      await act(async () => {
        response = await result.current.authenticate();
      });

      expect(response).toEqual({ error: 'Not authenticated' });
      expect(result.current.currentUser).toBe(null);
    });

    it('authenticate - API error', async () => {
      const error = new Error('Network error');
      (apiCall as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useApi());

      let response;
      await act(async () => {
        response = await result.current.authenticate();
      });

      expect(response).toEqual({ error: 'Network error' });
      expect(result.current.error).toBe('Network error');
    });

    it('login - successful login', async () => {
      const mockUser = { id: 1, username: 'testuser' };
      const loginData = { username: 'testuser', password: 'password' };
      (apiCall as jest.Mock).mockResolvedValue({
        data: { user: mockUser, token: 'test-token' },
      });

      const { result } = renderHook(() => useApi());

      let response;
      await act(async () => {
        response = await result.current.login(loginData);
      });

      expect(apiCall).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer null',
        },
        body: JSON.stringify(loginData),
      });
      expect(response).toEqual({
        data: { user: mockUser, token: 'test-token' },
      });
      expect(result.current.currentUser).toBe(mockUser);
    });

    it('login - failed login', async () => {
      const loginData = { username: 'testuser', password: 'password' };
      (apiCall as jest.Mock).mockResolvedValue({
        data: {},
      });

      const { result } = renderHook(() => useApi());

      let response;
      await act(async () => {
        response = await result.current.login(loginData);
      });

      expect(response).toEqual({ error: 'Login failed' });
    });

    it('login - API error', async () => {
      const loginData = { username: 'testuser', password: 'password' };
      const error = new Error('Invalid credentials');
      (apiCall as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useApi());

      let response;
      await act(async () => {
        response = await result.current.login(loginData);
      });

      expect(response).toEqual({ error: 'Invalid credentials' });
      expect(result.current.error).toBe('Invalid credentials');
    });

    it('logout - successful logout', async () => {
      (apiCall as jest.Mock).mockResolvedValue({
        data: { message: 'Logged out successfully' },
      });

      const { result } = renderHook(() => useApi());

      // Set initial user
      act(() => {
        result.current.currentUser = { id: 1, username: 'testuser' };
      });

      let response;
      await act(async () => {
        response = await result.current.logout();
      });

      expect(apiCall).toHaveBeenCalledWith('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: 'Bearer null' },
      });
      expect(response).toEqual({
        data: { message: 'Logged out successfully' },
      });
      expect(result.current.currentUser).toBe(null);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        'Isntgram_access_token'
      );
    });

    it('logout - API error', async () => {
      const error = new Error('Logout failed');
      (apiCall as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useApi());

      let response;
      await act(async () => {
        response = await result.current.logout();
      });

      expect(response).toEqual({ error: 'Logout failed' });
      expect(result.current.error).toBe('Logout failed');
    });

    it('signup - successful signup', async () => {
      const mockUser = { id: 1, username: 'newuser' };
      const signupData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password',
      };
      (apiCall as jest.Mock).mockResolvedValue({
        data: { user: mockUser, token: 'test-token' },
      });

      const { result } = renderHook(() => useApi());

      let response;
      await act(async () => {
        response = await result.current.signup(signupData);
      });

      expect(apiCall).toHaveBeenCalledWith('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer null',
        },
        body: JSON.stringify(signupData),
      });
      expect(response).toEqual({
        data: { user: mockUser, token: 'test-token' },
      });
      expect(result.current.currentUser).toBe(mockUser);
    });

    it('signup - failed signup', async () => {
      const signupData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password',
      };
      (apiCall as jest.Mock).mockResolvedValue({
        data: {},
      });

      const { result } = renderHook(() => useApi());

      let response;
      await act(async () => {
        response = await result.current.signup(signupData);
      });

      expect(response).toEqual({ error: 'Signup failed' });
    });
  });

  describe('User Functions', () => {
    it('lookupUser - successful lookup', async () => {
      const mockUser = { id: 1, username: 'testuser' };
      (apiCall as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });

      const { result } = renderHook(() => useApi());

      let response;
      await act(async () => {
        response = await result.current.lookupUser('testuser');
      });

      expect(apiCall).toHaveBeenCalledWith('/api/user/testuser', {
        headers: { Authorization: 'Bearer null' },
      });
      expect(response).toEqual({ data: { user: mockUser } });
    });

    it('lookupUser - user not found', async () => {
      (apiCall as jest.Mock).mockResolvedValue({
        data: {},
      });

      const { result } = renderHook(() => useApi());

      let response;
      await act(async () => {
        response = await result.current.lookupUser('nonexistent');
      });

      expect(response).toEqual({ error: 'User not found' });
    });

    it('updateUser - successful update', async () => {
      const mockUser = { id: 1, username: 'updateduser' };
      const updateData = { username: 'updateduser' };
      (apiCall as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });

      const { result } = renderHook(() => useApi());

      let response;
      await act(async () => {
        response = await result.current.updateUser(updateData);
      });

      expect(apiCall).toHaveBeenCalledWith('/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer null',
        },
        body: JSON.stringify(updateData),
      });
      expect(response).toEqual({ data: { user: mockUser } });
    });

    it('resetImage - successful reset', async () => {
      const mockUser = { id: 1, username: 'testuser', profileImageUrl: null };
      (apiCall as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });

      const { result } = renderHook(() => useApi());

      let response;
      await act(async () => {
        response = await result.current.resetImage();
      });

      expect(apiCall).toHaveBeenCalledWith('/api/user/reset-image', {
        method: 'DELETE',
        headers: { Authorization: 'Bearer null' },
      });
      expect(response).toEqual({ data: { user: mockUser } });
    });
  });

  describe('Post Functions', () => {
    it('getPosts - successful fetch', async () => {
      const mockPosts = [
        { id: 1, caption: 'Post 1' },
        { id: 2, caption: 'Post 2' },
      ];
      (apiCall as jest.Mock).mockResolvedValue({
        data: { posts: mockPosts },
      });

      const { result } = renderHook(() => useApi());

      let response;
      await act(async () => {
        response = await result.current.getPosts();
      });

      expect(apiCall).toHaveBeenCalledWith('/api/post/scroll/0', {
        headers: { Authorization: 'Bearer null' },
      });
      expect(response).toEqual({ data: { posts: mockPosts } });
    });

    it('getSinglePost - successful fetch', async () => {
      const mockPost = { id: 1, caption: 'Single post' };
      (apiCall as jest.Mock).mockResolvedValue({
        data: { post: mockPost },
      });

      const { result } = renderHook(() => useApi());

      let response;
      await act(async () => {
        response = await result.current.getSinglePost(1);
      });

      expect(apiCall).toHaveBeenCalledWith('/api/post/1', {
        headers: { Authorization: 'Bearer null' },
      });
      expect(response).toEqual({ data: { post: mockPost } });
    });

    it('createPost - successful creation', async () => {
      const mockPost = { id: 1, caption: 'New post' };
      const postData = {
        caption: 'New post',
        image: new File([''], 'test.jpg'),
      };
      (apiCall as jest.Mock).mockResolvedValue({
        data: { post: mockPost },
      });

      const { result } = renderHook(() => useApi());

      let response;
      await act(async () => {
        response = await result.current.createPost(postData);
      });

      expect(apiCall).toHaveBeenCalledWith('/api/aws/post/1/New post', {
        method: 'POST',
        body: expect.any(FormData),
      });
      expect(response).toEqual({ data: { post: mockPost } });
    });

    it('updatePost - successful update', async () => {
      const mockPost = { id: 1, caption: 'Updated post' };
      const updateData = { caption: 'Updated post' };
      (apiCall as jest.Mock).mockResolvedValue({
        data: { post: mockPost },
      });

      const { result } = renderHook(() => useApi());

      let response;
      await act(async () => {
        response = await result.current.updatePost(1, updateData);
      });

      expect(apiCall).toHaveBeenCalledWith('/api/post/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer null',
        },
        body: JSON.stringify(updateData),
      });
      expect(response).toEqual({ data: { post: mockPost } });
    });

    it('deletePost - successful deletion', async () => {
      (apiCall as jest.Mock).mockResolvedValue({
        data: { message: 'Post deleted successfully' },
      });

      const { result } = renderHook(() => useApi());

      let response;
      await act(async () => {
        response = await result.current.deletePost(1);
      });

      expect(apiCall).toHaveBeenCalledWith('/api/post/1', {
        method: 'DELETE',
        headers: { Authorization: 'Bearer null' },
      });
      expect(response).toEqual({
        data: { message: 'Post deleted successfully' },
      });
    });
  });

  describe('Comment Functions', () => {
    it('createComment - successful creation', async () => {
      const mockComment = { id: 1, text: 'New comment' };
      const commentData = { text: 'New comment' };
      (apiCall as jest.Mock).mockResolvedValue({
        data: { comment: mockComment },
      });

      const { result } = renderHook(() => useApi());

      let response;
      await act(async () => {
        response = await result.current.createComment(1, commentData);
      });

      expect(apiCall).toHaveBeenCalledWith('/api/comment/post/1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer null',
        },
        body: JSON.stringify(commentData),
      });
      expect(response).toEqual({ data: { comment: mockComment } });
    });

    it('updateComment - successful update', async () => {
      const mockComment = { id: 1, text: 'Updated comment' };
      const updateData = { text: 'Updated comment' };
      (apiCall as jest.Mock).mockResolvedValue({
        data: { comment: mockComment },
      });

      const { result } = renderHook(() => useApi());

      let response;
      await act(async () => {
        response = await result.current.updateComment(1, updateData);
      });

      expect(apiCall).toHaveBeenCalledWith('/api/comment/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer null',
        },
        body: JSON.stringify(updateData),
      });
      expect(response).toEqual({ data: { comment: mockComment } });
    });

    it('deleteComment - successful deletion', async () => {
      (apiCall as jest.Mock).mockResolvedValue({
        data: { message: 'Comment deleted successfully' },
      });

      const { result } = renderHook(() => useApi());

      let response;
      await act(async () => {
        response = await result.current.deleteComment(1);
      });

      expect(apiCall).toHaveBeenCalledWith('/api/comment/1', {
        method: 'DELETE',
        headers: { Authorization: 'Bearer null' },
      });
      expect(response).toEqual({
        data: { message: 'Comment deleted successfully' },
      });
    });
  });

  describe('Like Functions', () => {
    it('toggleLike - successful like', async () => {
      const mockLike = { id: 1, userId: 1, postId: 1 };
      const likeData = { likeableType: 'post', likeableId: 1 };
      (apiCall as jest.Mock).mockResolvedValue({
        data: { like: mockLike },
      });

      const { result } = renderHook(() => useApi());

      let response;
      await act(async () => {
        response = await result.current.toggleLike(likeData);
      });

      expect(apiCall).toHaveBeenCalledWith('/api/like/post/1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer null',
        },
        body: JSON.stringify(likeData),
      });
      expect(response).toEqual({ data: { like: mockLike } });
    });
  });

  describe('Follow Functions', () => {
    it('followUser - successful follow', async () => {
      const mockFollow = { id: 1, followerId: 1, followedId: 2 };
      const followData = { userId: 2 };
      (apiCall as jest.Mock).mockResolvedValue({
        data: { follow: mockFollow },
      });

      const { result } = renderHook(() => useApi());

      let response;
      await act(async () => {
        response = await result.current.followUser(followData);
      });

      expect(apiCall).toHaveBeenCalledWith('/api/follow/2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer null',
        },
        body: JSON.stringify(followData),
      });
      expect(response).toEqual({ data: { follow: mockFollow } });
    });

    it('unfollowUser - successful unfollow', async () => {
      (apiCall as jest.Mock).mockResolvedValue({
        data: { message: 'Unfollowed successfully' },
      });

      const { result } = renderHook(() => useApi());

      let response;
      await act(async () => {
        response = await result.current.unfollowUser(2);
      });

      expect(apiCall).toHaveBeenCalledWith('/api/follow/2', {
        method: 'DELETE',
        headers: { Authorization: 'Bearer null' },
      });
      expect(response).toEqual({
        data: { message: 'Unfollowed successfully' },
      });
    });
  });

  describe('Search Functions', () => {
    it('search - successful search', async () => {
      const mockResults = [
        { id: 1, username: 'testuser' },
        { id: 2, username: 'testuser2' },
      ];
      (apiCall as jest.Mock).mockResolvedValue({
        data: { users: mockResults },
      });

      const { result } = renderHook(() => useApi());

      let response;
      await act(async () => {
        response = await result.current.search('test');
      });

      expect(apiCall).toHaveBeenCalledWith('/api/search/test', {
        headers: { Authorization: 'Bearer null' },
      });
      expect(response).toEqual({ data: { users: mockResults } });
    });
  });

  describe('Utility Functions', () => {
    it('getAuthToken - returns token from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('test-token');

      const { result } = renderHook(() => useApi());

      expect(result.current.getAuthToken()).toBe('test-token');
      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        'Isntgram_access_token'
      );
    });

    it('setAuthToken - sets token in localStorage', () => {
      const { result } = renderHook(() => useApi());

      result.current.setAuthToken('new-token');

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'Isntgram_access_token',
        'new-token'
      );
    });

    it('removeAuthToken - removes token from localStorage', () => {
      const { result } = renderHook(() => useApi());

      result.current.removeAuthToken();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        'Isntgram_access_token'
      );
    });

    it('getAuthHeaders - returns headers with token', () => {
      localStorageMock.getItem.mockReturnValue('test-token');

      const { result } = renderHook(() => useApi());

      const headers = result.current.getAuthHeaders();

      expect(headers).toEqual({ Authorization: 'Bearer test-token' });
    });

    it('getAuthHeaders - returns undefined when no token', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useApi());

      const headers = result.current.getAuthHeaders();

      expect(headers).toBeUndefined();
    });

    it('clearError - clears error state', () => {
      const { result } = renderHook(() => useApi());

      // Set error first
      act(() => {
        result.current.error = 'Test error';
      });

      expect(result.current.error).toBe('Test error');

      // Clear error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
    });

    it('handleApiError - handles Error objects', () => {
      const { result } = renderHook(() => useApi());

      const error = new Error('Test error');
      const apiError = result.current.handleApiError(error);

      expect(apiError).toEqual({
        error: 'Test error',
        statusCode: 500,
      });
    });

    it('handleApiError - handles objects with message property', () => {
      const { result } = renderHook(() => useApi());

      const error = { message: 'Custom error', status: 400 };
      const apiError = result.current.handleApiError(error);

      expect(apiError).toEqual({
        error: 'Custom error',
        statusCode: 400,
      });
    });

    it('handleApiError - handles objects without message', () => {
      const { result } = renderHook(() => useApi());

      const error = { status: 500 };
      const apiError = result.current.handleApiError(error);

      expect(apiError).toEqual({
        error: 'An unexpected error occurred',
        statusCode: 500,
      });
    });
  });

  describe('State Management', () => {
    it('manages loading state correctly', async () => {
      (apiCall as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const { result } = renderHook(() => useApi());

      expect(result.current.isLoading).toBe(false);

      act(() => {
        result.current.authenticate();
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 150));
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('manages error state correctly', async () => {
      const error = new Error('Test error');
      (apiCall as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useApi());

      expect(result.current.error).toBe(null);

      await act(async () => {
        await result.current.authenticate();
      });

      expect(result.current.error).toBe('Test error');
    });
  });

  describe('Edge Cases', () => {
    it('handles API responses without data property', async () => {
      (apiCall as jest.Mock).mockResolvedValue({});

      const { result } = renderHook(() => useApi());

      let response;
      await act(async () => {
        response = await result.current.authenticate();
      });

      expect(response).toEqual({ error: 'Not authenticated' });
    });

    it('handles API responses with null data', async () => {
      (apiCall as jest.Mock).mockResolvedValue({ data: null });

      const { result } = renderHook(() => useApi());

      let response;
      await act(async () => {
        response = await result.current.authenticate();
      });

      expect(response).toEqual({ error: 'Not authenticated' });
    });

    it('handles API responses with undefined data', async () => {
      (apiCall as jest.Mock).mockResolvedValue({ data: undefined });

      const { result } = renderHook(() => useApi());

      let response;
      await act(async () => {
        response = await result.current.authenticate();
      });

      expect(response).toEqual({ error: 'Not authenticated' });
    });
  });
});
