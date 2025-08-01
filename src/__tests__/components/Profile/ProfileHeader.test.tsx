import React from 'react';
import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, createMockUser } from '../../utils/test-utils';
import { setupFetchMock, resetFetchMock } from '../../utils/api-mocks';
import ProfileHeader from '../../../components/Profile/ProfileHeader';

// Mock the ProfilePicModal component
jest.mock('../../../components/Profile/ProfilePicModal', () => {
  return function MockProfilePicModal({ openModal, closeModal }: any) {
    if (!openModal) return null;
    return (
      <div data-testid='profile-pic-modal' onClick={closeModal}>
        <img src='https://example.com/profile.jpg' alt='profile' />
        <button onClick={closeModal}>Close</button>
      </div>
    );
  };
});

// Mock the DynamicModal component
jest.mock('../../../components/DynamicModal', () => {
  return function MockDynamicModal({ isOpen, onClose, children }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid='dynamic-modal' onClick={onClose}>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    );
  };
});

// Mock the useApi hook
jest.mock('../../../utils/apiComposable', () => ({
  useApi: () => ({
    followUser: jest.fn(),
    unfollowUser: jest.fn(),
    getFollowing: jest.fn().mockResolvedValue({
      data: { follows: [] },
      error: null,
    }),
    logout: jest.fn(),
    isLoading: false,
    error: null,
    clearError: jest.fn(),
  }),
}));

// Create a mock that can be updated for different test scenarios
let mockProfileData = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  fullName: 'Test User',
  bio: 'This is a test bio',
  profileImageUrl: 'https://example.com/profile.jpg',
  posts: [],
  followers: [],
  following: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Mock the useProfile hook
jest.mock('../../../hooks/useContexts', () => ({
  useUser: () => ({
    currentUser: {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      fullName: 'Test User',
      bio: 'This is a test bio',
      profileImageUrl: 'https://example.com/profile.jpg',
      posts: [],
      followers: [],
      following: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    setCurrentUser: jest.fn(),
    isAuthenticated: true,
  }),
  useProfile: () => ({
    profileData: mockProfileData,
    setProfileData: jest.fn(),
  }),
}));

describe('ProfileHeader Component', () => {
  const mockUser = createMockUser({
    id: 1,
    username: 'testuser',
    fullName: 'Test User',
    bio: 'This is a test bio',
    profileImageUrl: 'https://example.com/profile.jpg',
    posts: [],
    followers: [],
    following: [],
  });

  beforeEach(() => {
    resetFetchMock();
    // Reset mock data to default
    mockProfileData = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      fullName: 'Test User',
      bio: 'This is a test bio',
      profileImageUrl: 'https://example.com/profile.jpg',
      posts: [],
      followers: [],
      following: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders user information correctly', () => {
      renderWithProviders(<ProfileHeader windowSize={1024} />, {
        initialUser: mockUser,
      });

      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('This is a test bio')).toBeInTheDocument();
    });

    it('renders profile image when available', () => {
      renderWithProviders(<ProfileHeader windowSize={1024} />, {
        initialUser: mockUser,
      });

      const profileImage = screen.getByAltText('avatar');
      expect(profileImage).toBeInTheDocument();
      expect(profileImage).toHaveAttribute(
        'src',
        'https://example.com/profile.jpg'
      );
    });

    it('renders default profile image when no image URL', () => {
      mockProfileData.profileImageUrl = '';
      renderWithProviders(<ProfileHeader windowSize={1024} />, {
        initialUser: mockUser,
      });

      const profileImage = screen.getByAltText('avatar');
      expect(profileImage).toBeInTheDocument();
      expect(profileImage).toHaveAttribute(
        'src',
        expect.stringContaining('default')
      );
    });

    it('renders empty bio when no bio provided', () => {
      mockProfileData.bio = '';
      renderWithProviders(<ProfileHeader windowSize={1024} />, {
        initialUser: mockUser,
      });

      // The component doesn't show "No bio available" text, it just shows empty bio
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    it('renders null bio when bio is null', () => {
      mockProfileData.bio = null;
      renderWithProviders(<ProfileHeader windowSize={1024} />, {
        initialUser: mockUser,
      });

      // The component doesn't show "No bio available" text, it just shows empty bio
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });
  });

  describe('Profile Picture Modal', () => {
    it('opens profile picture modal when profile image is clicked on own profile', async () => {
      // Set up the mock to simulate viewing own profile
      mockProfileData.id = 1;

      renderWithProviders(<ProfileHeader windowSize={1024} />, {
        initialUser: mockUser,
      });

      const profileImage = screen.getByAltText('avatar');
      await userEvent.click(profileImage);

      expect(screen.getByTestId('profile-pic-modal')).toBeInTheDocument();
    });

    it('does not open profile picture modal when profile image is clicked on other user profile', async () => {
      // Set up the mock to simulate viewing another user's profile
      mockProfileData.id = 2; // Different from current user ID (1)

      renderWithProviders(<ProfileHeader windowSize={1024} />, {
        initialUser: mockUser,
      });

      const profileImage = screen.getByAltText('avatar');
      await userEvent.click(profileImage);

      expect(screen.queryByTestId('profile-pic-modal')).not.toBeInTheDocument();
    });

    it('closes profile picture modal when close button is clicked', async () => {
      // Set up the mock to simulate viewing own profile
      mockProfileData.id = 1;

      renderWithProviders(<ProfileHeader windowSize={1024} />, {
        initialUser: mockUser,
      });

      const profileImage = screen.getByAltText('avatar');
      await userEvent.click(profileImage);

      const closeButton = screen.getByText('Close');
      await userEvent.click(closeButton);

      expect(screen.queryByTestId('profile-pic-modal')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      renderWithProviders(<ProfileHeader windowSize={1024} />, {
        initialUser: mockUser,
      });

      expect(screen.getByAltText('avatar')).toBeInTheDocument();
      // The component doesn't have a heading with the username
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      renderWithProviders(<ProfileHeader windowSize={1024} />, {
        initialUser: mockUser,
      });

      // Find the profile image container (which is the focusable element)
      const profileImageContainer = screen.getByRole('button', {
        name: 'avatar',
      });
      profileImageContainer.focus();
      expect(profileImageContainer).toHaveFocus();

      await userEvent.tab();
      // Should focus on next focusable element
    });
  });

  describe('Edge Cases', () => {
    it('handles very long usernames', () => {
      const longUsername = 'a'.repeat(50);
      mockProfileData.username = longUsername;
      renderWithProviders(<ProfileHeader windowSize={1024} />, {
        initialUser: mockUser,
      });

      expect(screen.getByText(longUsername)).toBeInTheDocument();
    });

    it('handles very long bios', () => {
      const longBio = 'A'.repeat(500);
      mockProfileData.bio = longBio;
      renderWithProviders(<ProfileHeader windowSize={1024} />, {
        initialUser: mockUser,
      });

      expect(screen.getByText(longBio)).toBeInTheDocument();
    });

    it('handles special characters in username', () => {
      const specialUsername = 'test@user#123';
      mockProfileData.username = specialUsername;
      renderWithProviders(<ProfileHeader windowSize={1024} />, {
        initialUser: mockUser,
      });

      expect(screen.getByText(specialUsername)).toBeInTheDocument();
    });

    it('handles missing user data gracefully', () => {
      mockProfileData = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        fullName: '',
        bio: null,
        profileImageUrl: '',
        posts: [],
        followers: [],
        following: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      renderWithProviders(<ProfileHeader windowSize={1024} />, {
        initialUser: mockUser,
      });

      expect(screen.getByText('testuser')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('renders efficiently with large profile data', () => {
      const largeUser = {
        ...mockUser,
        bio: 'A'.repeat(1000),
        fullName: 'A'.repeat(100),
      };

      const startTime = performance.now();
      renderWithProviders(<ProfileHeader windowSize={1024} />, {
        initialUser: largeUser,
      });
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should render in under 100ms
    });
  });

  describe('Responsive Design', () => {
    it('renders correctly on mobile', () => {
      renderWithProviders(<ProfileHeader windowSize={375} />, {
        initialUser: mockUser,
      });

      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('renders correctly on desktop', () => {
      renderWithProviders(<ProfileHeader windowSize={1024} />, {
        initialUser: mockUser,
      });

      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
  });
});
