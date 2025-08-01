import {
  createMockUser,
  createMockPost,
  createMockComment,
  createMockLike,
} from './mock-factories';

describe('Mock Factories', () => {
  describe('createMockUser', () => {
    it('should create a user with default values', () => {
      const user = createMockUser();

      expect(user.id).toBe(1);
      expect(user.email).toBe('test@example.com');
      expect(user.fullName).toBe('Test User');
      expect(user.username).toBe('testuser');
      expect(user.profileImageUrl).toBe('https://example.com/profile.jpg');
      expect(user.bio).toBe('Test bio');
      expect(user.createdAt).toBe('2024-01-01T00:00:00Z');
      expect(user.updatedAt).toBe('2024-01-01T00:00:00Z');
    });

    it('should allow overriding default values', () => {
      const user = createMockUser({
        id: 2,
        username: 'customuser',
        email: 'custom@example.com',
      });

      expect(user.id).toBe(2);
      expect(user.username).toBe('customuser');
      expect(user.email).toBe('custom@example.com');
      expect(user.fullName).toBe('Test User'); // default value
    });
  });

  describe('createMockPost', () => {
    it('should create a post with default values', () => {
      const post = createMockPost();

      expect(post.id).toBe(1);
      expect(post.imageUrl).toBe('https://example.com/post.jpg');
      expect(post.caption).toBe('Test caption');
      expect(post.userId).toBe(1);
      expect(post.createdAt).toBe('2024-01-01T00:00:00Z');
      expect(post.updatedAt).toBe('2024-01-01T00:00:00Z');
      expect(post.user).toBeDefined();
      expect(post.likeCount).toBe(0);
      expect(post.commentCount).toBe(0);
    });

    it('should allow overriding default values', () => {
      const post = createMockPost({
        id: 3,
        imageUrl: 'https://custom.com/image.jpg',
        caption: 'Custom caption',
      });

      expect(post.id).toBe(3);
      expect(post.imageUrl).toBe('https://custom.com/image.jpg');
      expect(post.caption).toBe('Custom caption');
      expect(post.userId).toBe(1); // default value
    });
  });

  describe('createMockComment', () => {
    it('should create a comment with default values', () => {
      const comment = createMockComment();

      expect(comment.id).toBe(1);
      expect(comment.content).toBe('Test comment');
      expect(comment.postId).toBe(1);
      expect(comment.userId).toBe(1);
      expect(comment.createdAt).toBe('2024-01-01T00:00:00Z');
      expect(comment.updatedAt).toBe('2024-01-01T00:00:00Z');
      expect(comment.user).toBeDefined();
      expect(comment.likes).toEqual([]);
      expect(comment.likesCount).toBe(0);
    });

    it('should allow overriding default values', () => {
      const comment = createMockComment({
        id: 3,
        content: 'Custom comment',
        postId: 5,
      });

      expect(comment.id).toBe(3);
      expect(comment.content).toBe('Custom comment');
      expect(comment.postId).toBe(5);
      expect(comment.userId).toBe(1); // default value
    });
  });

  describe('createMockLike', () => {
    it('should create a like with default values', () => {
      const like = createMockLike();

      expect(like.id).toBe(1);
      expect(like.userId).toBe(1);
      expect(like.likeableId).toBe(1);
      expect(like.likeableType).toBe('post');
      expect(like.createdAt).toBe('2024-01-01T00:00:00Z');
      expect(like.user).toBeDefined();
    });

    it('should allow overriding default values', () => {
      const like = createMockLike({
        id: 3,
        likeableId: 5,
        likeableType: 'comment',
      });

      expect(like.id).toBe(3);
      expect(like.likeableId).toBe(5);
      expect(like.likeableType).toBe('comment');
      expect(like.userId).toBe(1); // default value
    });
  });
});
