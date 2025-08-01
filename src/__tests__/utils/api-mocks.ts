import {
  createMockUser,
  createMockPost,
  createMockComment,
  createMockLike,
} from './test-utils';

// API Response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  status?: number;
}

// Mock fetch responses
export const mockApiResponse = <T>(data: T, status = 200): Response => {
  return new Response(JSON.stringify({ data }), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const mockApiError = (error: string, status = 400): Response => {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// API endpoint mocks
export const mockAuthEndpoints = {
  login: () => mockApiResponse({ user: createMockUser() }),
  register: () => mockApiResponse({ user: createMockUser() }),
  logout: () => mockApiResponse({ message: 'Logged out successfully' }),
  authenticate: () => mockApiResponse({ user: createMockUser() }),
};

export const mockPostEndpoints = {
  getPosts: (count = 3) =>
    mockApiResponse({
      posts: Array.from({ length: count }, (_, i) =>
        createMockPost({ id: i + 1, caption: `Post ${i + 1}` })
      ),
    }),
  getPost: (id = 1) =>
    mockApiResponse({
      post: createMockPost({ id }),
    }),
  createPost: () =>
    mockApiResponse({
      post: createMockPost(),
    }),
  deletePost: () =>
    mockApiResponse({
      message: 'Post deleted successfully',
    }),
};

export const mockUserEndpoints = {
  getUsers: (count = 3) =>
    mockApiResponse({
      users: Array.from({ length: count }, (_, i) =>
        createMockUser({ id: i + 1, username: `user${i + 1}` })
      ),
    }),
  getUser: (id = 1) =>
    mockApiResponse({
      user: createMockUser({ id }),
    }),
  updateUser: () =>
    mockApiResponse({
      user: createMockUser(),
    }),
};

export const mockLikeEndpoints = {
  getLikes: (count = 3) =>
    mockApiResponse({
      likes: Array.from({ length: count }, (_, i) =>
        createMockLike({ id: i + 1 })
      ),
    }),
  likePost: () =>
    mockApiResponse({
      like: createMockLike(),
    }),
  unlikePost: () =>
    mockApiResponse({
      message: 'Post unliked successfully',
    }),
};

export const mockCommentEndpoints = {
  getComments: (count = 3) =>
    mockApiResponse({
      comments: Array.from({ length: count }, (_, i) =>
        createMockComment({ id: i + 1, content: `Comment ${i + 1}` })
      ),
    }),
  createComment: () =>
    mockApiResponse({
      comment: createMockComment(),
    }),
  deleteComment: () =>
    mockApiResponse({
      message: 'Comment deleted successfully',
    }),
};

export const mockFollowEndpoints = {
  getFollows: (count = 3) =>
    mockApiResponse({
      follows: Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        user_id: 1,
        user_followed_id: i + 2,
        created_at: '2024-01-01T00:00:00Z',
      })),
    }),
  followUser: () =>
    mockApiResponse({
      follow: { id: 1, user_id: 1, user_followed_id: 2 },
    }),
  unfollowUser: () =>
    mockApiResponse({
      message: 'User unfollowed successfully',
    }),
};

// Setup fetch mock
export const setupFetchMock = (endpoints: Record<string, () => Response>) => {
  (global.fetch as jest.Mock).mockImplementation((url: string) => {
    const endpoint = Object.keys(endpoints).find((key) => url.includes(key));
    if (endpoint && endpoints[endpoint]) {
      return Promise.resolve(endpoints[endpoint]());
    }
    return Promise.resolve(mockApiError('Endpoint not found', 404));
  });
};

// Reset fetch mock
export const resetFetchMock = () => {
  (global.fetch as jest.Mock).mockReset();
};

// Mock localStorage
export const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock sessionStorage
export const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
