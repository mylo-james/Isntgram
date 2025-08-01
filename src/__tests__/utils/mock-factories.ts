import { User, Post, Comment, Like } from '../../types';

export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 1,
  email: 'test@example.com',
  fullName: 'Test User',
  username: 'testuser',
  profileImageUrl: 'https://example.com/profile.jpg',
  bio: 'Test bio',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockPost = (overrides: Partial<Post> = {}): Post => ({
  id: 1,
  imageUrl: 'https://example.com/post.jpg',
  caption: 'Test caption',
  userId: 1,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  user: createMockUser(),
  likeCount: 0,
  commentCount: 0,
  ...overrides,
});

export const createMockComment = (
  overrides: Partial<Comment> = {}
): Comment => ({
  id: 1,
  content: 'Test comment',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  postId: 1,
  userId: 1,
  user: createMockUser(),
  likes: [],
  likesCount: 0,
  ...overrides,
});

export const createMockLike = (overrides: Partial<Like> = {}): Like => ({
  id: 1,
  userId: 1,
  user: createMockUser(),
  likeableId: 1,
  likeableType: 'post',
  createdAt: '2024-01-01T00:00:00Z',
  ...overrides,
});
