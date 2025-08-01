import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Comment from '../../../components/Post/Comment';
import { UserContext } from '../../../Contexts/userContext';

// Mock the API calls
jest.mock('../../../utils/apiComposable', () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiDelete: jest.fn(),
}));

const mockComment = {
  id: 1,
  text: 'Test comment text',
  user: {
    id: 1,
    username: 'testuser',
    profile_image_url: 'https://example.com/profile.jpg',
  },
  created_at: '2023-01-01T00:00:00Z',
  likes: [],
};

const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  profile_image_url: 'https://example.com/profile.jpg',
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <UserContext.Provider
      value={{ currentUser: mockUser, setCurrentUser: jest.fn() }}
    >
      {component}
    </UserContext.Provider>
  );
};

describe('Comment Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders comment with all elements', () => {
      renderWithProviders(<Comment comment={mockComment} />);

      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.getByText('Test comment text')).toBeInTheDocument();
    });

    it('renders comment without profile image', () => {
      const commentWithoutImage = {
        ...mockComment,
        user: { ...mockComment.user, profile_image_url: null },
      };
      renderWithProviders(<Comment comment={commentWithoutImage} />);

      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.getByText('Test comment text')).toBeInTheDocument();
    });

    it('renders comment with likes count', () => {
      const commentWithLikes = {
        ...mockComment,
        likes: [{ id: 1 }, { id: 2 }],
      };
      renderWithProviders(<Comment comment={commentWithLikes} />);

      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('renders comment with timestamp', () => {
      renderWithProviders(<Comment comment={mockComment} />);

      expect(screen.getByText(/2023/i)).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('shows like button', () => {
      renderWithProviders(<Comment comment={mockComment} />);

      expect(screen.getByRole('button', { name: /like/i })).toBeInTheDocument();
    });

    it('shows reply button', () => {
      renderWithProviders(<Comment comment={mockComment} />);

      expect(
        screen.getByRole('button', { name: /reply/i })
      ).toBeInTheDocument();
    });

    it('shows delete button for own comment', () => {
      renderWithProviders(<Comment comment={mockComment} />);

      expect(
        screen.getByRole('button', { name: /delete/i })
      ).toBeInTheDocument();
    });

    it('does not show delete button for other user comment', () => {
      const otherUserComment = {
        ...mockComment,
        user: { ...mockComment.user, id: 2, username: 'otheruser' },
      };
      renderWithProviders(<Comment comment={otherUserComment} />);

      expect(
        screen.queryByRole('button', { name: /delete/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('Like Functionality', () => {
    it('handles like button click', async () => {
      const mockApiPost = require('../../../utils/apiComposable').apiPost;
      mockApiPost.mockResolvedValue({ success: true });

      renderWithProviders(<Comment comment={mockComment} />);

      const likeButton = screen.getByRole('button', { name: /like/i });
      fireEvent.click(likeButton);

      await waitFor(() => {
        expect(mockApiPost).toHaveBeenCalled();
      });
    });

    it('handles unlike button click', async () => {
      const mockApiDelete = require('../../../utils/apiComposable').apiDelete;
      mockApiDelete.mockResolvedValue({ success: true });

      const likedComment = {
        ...mockComment,
        likes: [{ id: 1, user_id: 1 }],
      };
      renderWithProviders(<Comment comment={likedComment} />);

      const likeButton = screen.getByRole('button', { name: /like/i });
      fireEvent.click(likeButton);

      await waitFor(() => {
        expect(mockApiDelete).toHaveBeenCalled();
      });
    });
  });

  describe('Delete Functionality', () => {
    it('shows confirmation dialog when delete is clicked', () => {
      renderWithProviders(<Comment comment={mockComment} />);

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    });

    it('calls delete API when confirmed', async () => {
      const mockApiDelete = require('../../../utils/apiComposable').apiDelete;
      mockApiDelete.mockResolvedValue({ success: true });

      renderWithProviders(<Comment comment={mockComment} />);

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockApiDelete).toHaveBeenCalled();
      });
    });

    it('cancels delete when cancel is clicked', () => {
      renderWithProviders(<Comment comment={mockComment} />);

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument();
    });
  });

  describe('Reply Functionality', () => {
    it('shows reply input when reply button is clicked', () => {
      renderWithProviders(<Comment comment={mockComment} />);

      const replyButton = screen.getByRole('button', { name: /reply/i });
      fireEvent.click(replyButton);

      expect(
        screen.getByPlaceholderText(/reply to testuser/i)
      ).toBeInTheDocument();
    });

    it('submits reply when form is submitted', async () => {
      const mockApiPost = require('../../../utils/apiComposable').apiPost;
      mockApiPost.mockResolvedValue({ success: true });

      renderWithProviders(<Comment comment={mockComment} />);

      const replyButton = screen.getByRole('button', { name: /reply/i });
      fireEvent.click(replyButton);

      const replyInput = screen.getByPlaceholderText(/reply to testuser/i);
      const submitButton = screen.getByRole('button', { name: /post/i });

      await userEvent.type(replyInput, 'Test reply');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApiPost).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper alt text for profile images', () => {
      renderWithProviders(<Comment comment={mockComment} />);

      expect(screen.getByAltText(/testuser profile/i)).toBeInTheDocument();
    });

    it('has proper ARIA labels for buttons', () => {
      renderWithProviders(<Comment comment={mockComment} />);

      expect(screen.getByRole('button', { name: /like/i })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /reply/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /delete/i })
      ).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      renderWithProviders(<Comment comment={mockComment} />);

      const likeButton = screen.getByRole('button', { name: /like/i });
      const replyButton = screen.getByRole('button', { name: /reply/i });

      likeButton.focus();
      expect(likeButton).toHaveFocus();

      await userEvent.tab();
      expect(replyButton).toHaveFocus();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing user data gracefully', () => {
      const commentWithoutUser = { ...mockComment, user: null };
      renderWithProviders(<Comment comment={commentWithoutUser} />);

      expect(screen.getByText('Test comment text')).toBeInTheDocument();
    });

    it('handles very long comment text', () => {
      const longText = 'A'.repeat(1000);
      const commentWithLongText = { ...mockComment, text: longText };
      renderWithProviders(<Comment comment={commentWithLongText} />);

      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('handles special characters in comment text', () => {
      const specialText = 'Test comment with @#$%^&*() symbols!';
      const commentWithSpecialChars = { ...mockComment, text: specialText };
      renderWithProviders(<Comment comment={commentWithSpecialChars} />);

      expect(screen.getByText(specialText)).toBeInTheDocument();
    });

    it('handles empty comment text', () => {
      const commentWithEmptyText = { ...mockComment, text: '' };
      renderWithProviders(<Comment comment={commentWithEmptyText} />);

      expect(screen.getByText('testuser')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('renders efficiently with large data', () => {
      const largeComment = {
        ...mockComment,
        likes: Array.from({ length: 1000 }, (_, i) => ({ id: i })),
      };

      const startTime = performance.now();
      renderWithProviders(<Comment comment={largeComment} />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should render in under 100ms
    });
  });
});
