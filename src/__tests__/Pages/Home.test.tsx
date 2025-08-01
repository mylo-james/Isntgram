import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  renderWithProviders,
  createMockPost,
  createMockUser,
} from '../utils/test-utils';
import {
  setupFetchMock,
  resetFetchMock,
  mockApiResponse,
} from '../utils/api-mocks';
import Home from '../../Pages/Home';

describe('Home Page', () => {
  const mockUser = createMockUser({ id: 1, username: 'testuser' });
  const mockPosts = [
    createMockPost({ id: 1, caption: 'First post' }),
    createMockPost({ id: 2, caption: 'Second post' }),
    createMockPost({ id: 3, caption: 'Third post' }),
  ];

  beforeEach(() => {
    resetFetchMock();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Debug test to see what's being rendered
  it('debug: shows what is actually rendered', async () => {
    setupFetchMock({
      '/api/post/home/1/scroll/0': () => mockApiResponse({ posts: mockPosts }),
    });

    const { container } = renderWithProviders(<Home />, {
      initialUser: mockUser,
      initialFollows: new Set([2, 3, 4]),
    });

    // Wait a bit and then log what's rendered
    await new Promise((resolve) => setTimeout(resolve, 100));

    console.log('Container HTML:', container.innerHTML);
    console.log(
      'Screen text:',
      screen.getByRole('main', { hidden: true })?.textContent ||
        'No main element found'
    );
  });

  describe('Rendering', () => {
    it('renders home page with posts', async () => {
      setupFetchMock({
        '/api/post/home/1/scroll/0': () =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ posts: mockPosts }),
          }),
      });

      renderWithProviders(<Home />, {
        initialUser: mockUser,
        initialFollows: new Set([2, 3, 4]), // Add some follows so the component loads posts
      });

      await waitFor(() => {
        expect(screen.getByText('First post')).toBeInTheDocument();
        expect(screen.getByText('Second post')).toBeInTheDocument();
        expect(screen.getByText('Third post')).toBeInTheDocument();
      });
    });

    it('renders loading state initially', () => {
      renderWithProviders(<Home />);

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('renders empty state when no posts', async () => {
      setupFetchMock({
        '/api/post/home/1/scroll/0': () =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ posts: [] }),
          }),
      });

      renderWithProviders(<Home />, {
        initialUser: mockUser,
        initialFollows: new Set([2, 3, 4]), // Add some follows so the component loads posts
      });

      await waitFor(() => {
        expect(screen.getByText(/no posts yet/i)).toBeInTheDocument();
      });
    });

    it('renders posts in correct order', async () => {
      setupFetchMock({
        '/api/post/home/1/scroll/0': () =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ posts: mockPosts }),
          }),
      });

      renderWithProviders(<Home />, {
        initialUser: mockUser,
        initialFollows: new Set([2, 3, 4]), // Add some follows so the component loads posts
      });

      await waitFor(() => {
        const posts = screen.getAllByText(/post/i);
        expect(posts[0]).toHaveTextContent('First post');
        expect(posts[1]).toHaveTextContent('Second post');
        expect(posts[2]).toHaveTextContent('Third post');
      });
    });
  });

  describe('Infinite Scroll', () => {
    it('loads more posts when scrolling to bottom', async () => {
      const additionalPosts = [
        createMockPost({ id: 4, caption: 'Fourth post' }),
        createMockPost({ id: 5, caption: 'Fifth post' }),
      ];

      setupFetchMock({
        '/api/post/home/1/scroll/0': () =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ posts: mockPosts }),
          }),
        '/api/post/home/1/scroll/3': () =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ posts: additionalPosts }),
          }),
      });

      renderWithProviders(<Home />, {
        initialUser: mockUser,
        initialFollows: new Set([2, 3, 4]), // Add some follows so the component loads posts
      });

      await waitFor(() => {
        expect(screen.getByText('First post')).toBeInTheDocument();
      });

      // Simulate scroll to bottom
      fireEvent.scroll(window, { target: { scrollY: 1000 } });

      await waitFor(() => {
        expect(screen.getByText('Fourth post')).toBeInTheDocument();
        expect(screen.getByText('Fifth post')).toBeInTheDocument();
      });
    });

    it('stops loading when no more posts', async () => {
      setupFetchMock({
        '/api/post/home/1/scroll/0': () =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ posts: mockPosts }),
          }),
        '/api/post/home/1/scroll/3': () =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ posts: [] }),
          }),
      });

      renderWithProviders(<Home />, {
        initialUser: mockUser,
        initialFollows: new Set([2, 3, 4]), // Add some follows so the component loads posts
      });

      await waitFor(() => {
        expect(screen.getByText('First post')).toBeInTheDocument();
      });

      // Simulate scroll to bottom
      fireEvent.scroll(window, { target: { scrollY: 1000 } });

      await waitFor(() => {
        expect(screen.getByText(/no more posts/i)).toBeInTheDocument();
      });
    });

    it('handles scroll API errors gracefully', async () => {
      setupFetchMock({
        '/api/post/home/1/scroll/0': () =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ posts: mockPosts }),
          }),
        '/api/post/home/1/scroll/3': () =>
          Promise.resolve({
            ok: false,
            status: 500,
            json: () => Promise.resolve({ error: 'Failed to load posts' }),
          }),
      });

      renderWithProviders(<Home />, {
        initialUser: mockUser,
        initialFollows: new Set([2, 3, 4]), // Add some follows so the component loads posts
      });

      await waitFor(() => {
        expect(screen.getByText('First post')).toBeInTheDocument();
      });

      // Simulate scroll to bottom
      fireEvent.scroll(window, { target: { scrollY: 1000 } });

      await waitFor(() => {
        expect(screen.getByText(/failed to load posts/i)).toBeInTheDocument();
      });
    });
  });

  describe('Post Interactions', () => {
    it('allows liking posts', async () => {
      setupFetchMock({
        '/api/post/home/1/scroll/0': () =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ posts: mockPosts }),
          }),
        '/api/like/post/1': () =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ message: 'Post liked' }),
          }),
      });

      renderWithProviders(<Home />, {
        initialUser: mockUser,
        initialFollows: new Set([2, 3, 4]), // Add some follows so the component loads posts
      });

      await waitFor(() => {
        expect(screen.getByText('First post')).toBeInTheDocument();
      });

      const likeButton = screen.getAllByRole('button', { name: /like/i })[0];
      await userEvent.click(likeButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/like/post/1',
          expect.any(Object)
        );
      });
    });

    it('allows commenting on posts', async () => {
      setupFetchMock({
        '/api/post/home/1/scroll/0': () =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ posts: mockPosts }),
          }),
        '/api/comment/post/1': () =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ message: 'Comment added' }),
          }),
      });

      renderWithProviders(<Home />, {
        initialUser: mockUser,
        initialFollows: new Set([2, 3, 4]), // Add some follows so the component loads posts
      });

      await waitFor(() => {
        expect(screen.getByText('First post')).toBeInTheDocument();
      });

      const commentButton = screen.getAllByRole('button', {
        name: /comment/i,
      })[0];
      await userEvent.click(commentButton);

      const commentInput = screen.getByPlaceholderText(/add a comment/i);
      await userEvent.type(commentInput, 'Test comment');

      const submitButton = screen.getByRole('button', { name: /post/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/comment/post/1',
          expect.any(Object)
        );
      });
    });

    it('opens post modal when post image is clicked', async () => {
      setupFetchMock({
        '/api/post/home/1/scroll/0': () =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ posts: mockPosts }),
          }),
      });

      renderWithProviders(<Home />, {
        initialUser: mockUser,
        initialFollows: new Set([2, 3, 4]), // Add some follows so the component loads posts
      });

      await waitFor(() => {
        expect(screen.getByText('First post')).toBeInTheDocument();
      });

      const postImage = screen.getAllByAltText(/post image/i)[0];
      await userEvent.click(postImage);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Authentication', () => {
    it('redirects to login when user is not authenticated', () => {
      const mockNavigate = jest.fn();
      jest.doMock('react-router-dom', () => ({
        ...jest.requireActual('react-router-dom'),
        useNavigate: () => mockNavigate,
      }));

      renderWithProviders(<Home />);

      expect(mockNavigate).toHaveBeenCalledWith('/auth/login');
    });

    it('shows posts when user is authenticated', async () => {
      setupFetchMock({
        '/api/post/home/1/scroll/0': () =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ posts: mockPosts }),
          }),
      });

      renderWithProviders(<Home />, {
        initialUser: mockUser,
        initialFollows: new Set([2, 3, 4]), // Add some follows so the component loads posts
      });

      await waitFor(() => {
        expect(screen.getByText('First post')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles initial load error', async () => {
      setupFetchMock({
        '/api/post/home/1/scroll/0': () =>
          Promise.resolve({
            ok: false,
            status: 500,
            json: () => Promise.resolve({ error: 'Failed to load posts' }),
          }),
      });

      renderWithProviders(<Home />, {
        initialUser: mockUser,
        initialFollows: new Set([2, 3, 4]), // Add some follows so the component loads posts
      });

      await waitFor(() => {
        expect(screen.getByText(/failed to load posts/i)).toBeInTheDocument();
      });
    });

    it('handles network errors', async () => {
      setupFetchMock({
        '/api/post/home/1/scroll/0': () =>
          Promise.reject(new Error('Network error')),
      });

      renderWithProviders(<Home />, {
        initialUser: mockUser,
        initialFollows: new Set([2, 3, 4]), // Add some follows so the component loads posts
      });

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    it('shows retry button on error', async () => {
      setupFetchMock({
        '/api/post/home/1/scroll/0': () =>
          Promise.resolve({
            ok: false,
            status: 500,
            json: () => Promise.resolve({ error: 'Failed to load posts' }),
          }),
      });

      renderWithProviders(<Home />, {
        initialUser: mockUser,
        initialFollows: new Set([2, 3, 4]), // Add some follows so the component loads posts
      });

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /retry/i })
        ).toBeInTheDocument();
      });
    });

    it('retries loading posts when retry button is clicked', async () => {
      setupFetchMock({
        '/api/post/home/1/scroll/0': () =>
          Promise.resolve({
            ok: false,
            status: 500,
            json: () => Promise.resolve({ error: 'Failed to load posts' }),
          }),
      });

      renderWithProviders(<Home />, {
        initialUser: mockUser,
        initialFollows: new Set([2, 3, 4]), // Add some follows so the component loads posts
      });

      await waitFor(() => {
        expect(screen.getByText(/failed to load posts/i)).toBeInTheDocument();
      });

      // Mock successful retry
      setupFetchMock({
        '/api/post/home/1/scroll/0': () =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ posts: mockPosts }),
          }),
      });

      const retryButton = screen.getByRole('button', { name: /retry/i });
      await userEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('First post')).toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    it('renders efficiently with many posts', async () => {
      const manyPosts = Array.from({ length: 100 }, (_, i) =>
        createMockPost({ id: i + 1, caption: `Post ${i + 1}` })
      );

      setupFetchMock({
        '/api/post/home/1/scroll/0': () =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ posts: manyPosts }),
          }),
      });

      const startTime = performance.now();
      renderWithProviders(<Home />, {
        initialUser: mockUser,
        initialFollows: new Set([2, 3, 4]), // Add some follows so the component loads posts
      });
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should render in under 1 second
    });

    it('handles rapid scroll events efficiently', async () => {
      setupFetchMock({
        '/api/post/home/1/scroll/0': () =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ posts: mockPosts }),
          }),
      });

      renderWithProviders(<Home />, {
        initialUser: mockUser,
        initialFollows: new Set([2, 3, 4]), // Add some follows so the component loads posts
      });

      await waitFor(() => {
        expect(screen.getByText('First post')).toBeInTheDocument();
      });

      const startTime = performance.now();

      // Simulate rapid scroll events
      for (let i = 0; i < 10; i++) {
        fireEvent.scroll(window, { target: { scrollY: 1000 } });
      }

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should handle rapid scroll in under 100ms
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', async () => {
      setupFetchMock({
        '/api/post/home/1/scroll/0': () =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ posts: mockPosts }),
          }),
      });

      renderWithProviders(<Home />, {
        initialUser: mockUser,
        initialFollows: new Set([2, 3, 4]), // Add some follows so the component loads posts
      });

      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
        expect(screen.getByRole('feed')).toBeInTheDocument();
      });
    });

    it('supports keyboard navigation', async () => {
      setupFetchMock({
        '/api/post/home/1/scroll/0': () =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ posts: mockPosts }),
          }),
      });

      renderWithProviders(<Home />, {
        initialUser: mockUser,
        initialFollows: new Set([2, 3, 4]), // Add some follows so the component loads posts
      });

      await waitFor(() => {
        expect(screen.getByText('First post')).toBeInTheDocument();
      });

      const likeButton = screen.getAllByRole('button', { name: /like/i })[0];
      likeButton.focus();
      expect(likeButton).toHaveFocus();

      await userEvent.tab();
      // Should focus on next focusable element
    });
  });

  describe('Edge Cases', () => {
    it('handles posts with missing data gracefully', async () => {
      const incompletePosts = [
        { ...mockPosts[0], caption: null, user: null },
        {
          ...mockPosts[1],
          image_url: '',
          user: { ...mockUser, profile_image_url: '' },
        },
      ];

      setupFetchMock({
        '/api/post/home/1/scroll/0': () =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ posts: incompletePosts }),
          }),
      });

      renderWithProviders(<Home />, {
        initialUser: mockUser,
        initialFollows: new Set([2, 3, 4]), // Add some follows so the component loads posts
      });

      await waitFor(() => {
        expect(screen.getByText(/no caption/i)).toBeInTheDocument();
        expect(screen.getByText(/unknown user/i)).toBeInTheDocument();
      });
    });

    it('handles very long post captions', async () => {
      const longCaption = 'A'.repeat(1000);
      const postWithLongCaption = { ...mockPosts[0], caption: longCaption };

      setupFetchMock({
        '/api/post/home/1/scroll/0': () =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ posts: [postWithLongCaption] }),
          }),
      });

      renderWithProviders(<Home />, {
        initialUser: mockUser,
        initialFollows: new Set([2, 3, 4]), // Add some follows so the component loads posts
      });

      await waitFor(() => {
        expect(screen.getByText(longCaption)).toBeInTheDocument();
      });
    });

    it('handles posts with special characters', async () => {
      const specialCaption = 'Post with @#$%^&*() symbols!';
      const postWithSpecialChars = { ...mockPosts[0], caption: specialCaption };

      setupFetchMock({
        '/api/post/home/1/scroll/0': () =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ posts: [postWithSpecialChars] }),
          }),
      });

      renderWithProviders(<Home />, {
        initialUser: mockUser,
        initialFollows: new Set([2, 3, 4]), // Add some follows so the component loads posts
      });

      await waitFor(() => {
        expect(screen.getByText(specialCaption)).toBeInTheDocument();
      });
    });
  });
});
