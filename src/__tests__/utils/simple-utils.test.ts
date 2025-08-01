describe('Simple Utils', () => {
  it('should create a mock user object', () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      profile_image_url: 'https://example.com/profile.jpg',
      bio: 'Test bio',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    expect(mockUser.id).toBe(1);
    expect(mockUser.username).toBe('testuser');
    expect(mockUser.email).toBe('test@example.com');
  });

  it('should create a mock post object', () => {
    const mockPost = {
      id: 1,
      caption: 'Test post caption',
      image_url: 'https://example.com/post.jpg',
      user_id: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    expect(mockPost.id).toBe(1);
    expect(mockPost.caption).toBe('Test post caption');
    expect(mockPost.image_url).toBe('https://example.com/post.jpg');
  });

  it('should handle object spreading', () => {
    const baseUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
    };

    const extendedUser = {
      ...baseUser,
      bio: 'Test bio',
      profile_image_url: 'https://example.com/profile.jpg',
    };

    expect(extendedUser.id).toBe(1);
    expect(extendedUser.username).toBe('testuser');
    expect(extendedUser.email).toBe('test@example.com');
    expect(extendedUser.bio).toBe('Test bio');
    expect(extendedUser.profile_image_url).toBe(
      'https://example.com/profile.jpg'
    );
  });
});
