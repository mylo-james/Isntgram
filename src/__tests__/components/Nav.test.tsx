import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Nav from '../../components/Nav';
import { UserContext } from '../../Contexts/userContext';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  NavLink: ({
    children,
    to,
    className,
  }: {
    children: React.ReactNode;
    to: string;
    className: any;
  }) => (
    <a
      href={to}
      className={
        typeof className === 'function'
          ? className({ isActive: false })
          : className
      }
    >
      {children}
    </a>
  ),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

// Mock the logo image
jest.mock('../../Images/logo.svg', () => 'mocked-logo.svg');

// Mock MobileNav component
jest.mock('../../components/MobileNav', () => {
  return function MockMobileNav() {
    return <div data-testid='mobile-nav'>Mobile Navigation</div>;
  };
});

const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  profileImageUrl: 'https://example.com/profile.jpg',
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <UserContext.Provider
        value={{ currentUser: mockUser, setCurrentUser: jest.fn() }}
      >
        {component}
      </UserContext.Provider>
    </BrowserRouter>
  );
};

describe('Nav Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders navigation with all elements when user is logged in', () => {
      renderWithProviders(<Nav />);

      // Check for logo
      expect(screen.getByAltText('logo')).toBeInTheDocument();

      // Check for navigation links by href
      const links = screen.getAllByRole('link');
      const hrefs = links.map((link) => link.getAttribute('href'));

      expect(hrefs).toContain('/');
      expect(hrefs).toContain('/explore');
      expect(hrefs).toContain('/upload');
      expect(hrefs).toContain('/notifications');
      expect(hrefs).toContain('/profile/testuser');

      // Check for profile image
      expect(screen.getByAltText('avatar')).toBeInTheDocument();

      // Check for mobile nav
      expect(screen.getByTestId('mobile-nav')).toBeInTheDocument();
    });

    it('renders navigation without user-specific elements when not logged in', () => {
      render(
        <BrowserRouter>
          <UserContext.Provider
            value={{ currentUser: null, setCurrentUser: jest.fn() }}
          >
            <Nav />
          </UserContext.Provider>
        </BrowserRouter>
      );

      // Logo should still be present
      expect(screen.getByAltText('logo')).toBeInTheDocument();

      // Navigation links should still be present
      const links = screen.getAllByRole('link');
      const hrefs = links.map((link) => link.getAttribute('href'));

      expect(hrefs).toContain('/');
      expect(hrefs).toContain('/explore');
      expect(hrefs).toContain('/upload');
      expect(hrefs).toContain('/notifications');

      // Profile image should show default
      expect(screen.getByAltText('avatar')).toBeInTheDocument();
      expect(screen.getByAltText('avatar')).toHaveAttribute(
        'src',
        '/default-avatar.png'
      );
    });

    it('shows user profile image when available', () => {
      renderWithProviders(<Nav />);

      const profileImage = screen.getByAltText('avatar');
      expect(profileImage).toBeInTheDocument();
      expect(profileImage).toHaveAttribute(
        'src',
        'https://example.com/profile.jpg'
      );
    });

    it('shows default profile image when no profile image available', () => {
      const userWithoutImage = { ...mockUser, profileImageUrl: null };
      render(
        <BrowserRouter>
          <UserContext.Provider
            value={{ currentUser: userWithoutImage, setCurrentUser: jest.fn() }}
          >
            <Nav />
          </UserContext.Provider>
        </BrowserRouter>
      );

      const profileImage = screen.getByAltText('avatar');
      expect(profileImage).toBeInTheDocument();
      expect(profileImage).toHaveAttribute('src', '/default-avatar.png');
    });
  });

  describe('Navigation Links', () => {
    it('renders all navigation links with correct hrefs', () => {
      renderWithProviders(<Nav />);

      const links = screen.getAllByRole('link');
      const hrefs = links.map((link) => link.getAttribute('href'));

      expect(hrefs).toContain('/');
      expect(hrefs).toContain('/explore');
      expect(hrefs).toContain('/upload');
      expect(hrefs).toContain('/notifications');
      expect(hrefs).toContain('/profile/testuser');
    });

    it('renders profile link with correct username', () => {
      renderWithProviders(<Nav />);

      const profileLink = screen.getByRole('link', { name: 'avatar' });
      expect(profileLink).toHaveAttribute('href', '/profile/testuser');
    });

    it('renders profile link with user id when username is not available', () => {
      const userWithoutUsername = { ...mockUser, username: null };
      render(
        <BrowserRouter>
          <UserContext.Provider
            value={{
              currentUser: userWithoutUsername,
              setCurrentUser: jest.fn(),
            }}
          >
            <Nav />
          </UserContext.Provider>
        </BrowserRouter>
      );

      const profileLink = screen.getByRole('link', { name: 'avatar' });
      expect(profileLink).toHaveAttribute('href', '/profile/1');
    });
  });

  describe('Logo and Branding', () => {
    it('renders logo with correct link', () => {
      renderWithProviders(<Nav />);

      const logoLink = screen.getByRole('link', { name: 'logo' });
      expect(logoLink).toHaveAttribute('href', '/');
    });

    it('handles logo click', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Nav />);

      const logoLink = screen.getByRole('link', { name: 'logo' });
      await user.click(logoLink);

      // Should navigate to home (this is handled by react-router)
      expect(logoLink).toHaveAttribute('href', '/');
    });
  });

  describe('Accessibility', () => {
    it('has proper alt text for images', () => {
      renderWithProviders(<Nav />);

      expect(screen.getByAltText('logo')).toBeInTheDocument();
      expect(screen.getByAltText('avatar')).toBeInTheDocument();
    });

    it('has proper navigation structure', () => {
      renderWithProviders(<Nav />);

      // Check that nav element exists
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('renders correctly on mobile viewport', () => {
      // Mock window.innerWidth for mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      renderWithProviders(<Nav />);

      // Logo should still be visible
      expect(screen.getByAltText('logo')).toBeInTheDocument();

      // Mobile nav should be rendered
      expect(screen.getByTestId('mobile-nav')).toBeInTheDocument();
    });

    it('renders correctly on desktop viewport', () => {
      // Mock window.innerWidth for desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      renderWithProviders(<Nav />);

      // Logo should be visible
      expect(screen.getByAltText('logo')).toBeInTheDocument();

      // Navigation links should be visible (check by href)
      const links = screen.getAllByRole('link');
      const hrefs = links.map((link) => link.getAttribute('href'));

      expect(hrefs).toContain('/');
      expect(hrefs).toContain('/explore');
      expect(hrefs).toContain('/upload');
      expect(hrefs).toContain('/notifications');
    });
  });

  describe('Edge Cases', () => {
    it('handles missing user data gracefully', () => {
      const userWithoutUsername = { ...mockUser, username: null };
      render(
        <BrowserRouter>
          <UserContext.Provider
            value={{
              currentUser: userWithoutUsername,
              setCurrentUser: jest.fn(),
            }}
          >
            <Nav />
          </UserContext.Provider>
        </BrowserRouter>
      );

      // Should still render without crashing
      expect(screen.getByAltText('logo')).toBeInTheDocument();
      expect(screen.getByAltText('avatar')).toBeInTheDocument();
    });

    it('handles very long usernames', () => {
      const userWithLongName = { ...mockUser, username: 'a'.repeat(100) };
      render(
        <BrowserRouter>
          <UserContext.Provider
            value={{ currentUser: userWithLongName, setCurrentUser: jest.fn() }}
          >
            <Nav />
          </UserContext.Provider>
        </BrowserRouter>
      );

      // Should render without crashing
      expect(screen.getByAltText('logo')).toBeInTheDocument();
      expect(screen.getByAltText('avatar')).toBeInTheDocument();
    });

    it('handles special characters in username', () => {
      const userWithSpecialChars = { ...mockUser, username: 'user@#$%^&*()' };
      render(
        <BrowserRouter>
          <UserContext.Provider
            value={{
              currentUser: userWithSpecialChars,
              setCurrentUser: jest.fn(),
            }}
          >
            <Nav />
          </UserContext.Provider>
        </BrowserRouter>
      );

      // Should render without crashing
      expect(screen.getByAltText('logo')).toBeInTheDocument();
      expect(screen.getByAltText('avatar')).toBeInTheDocument();
    });

    it('handles broken profile image URLs', () => {
      const userWithBrokenImage = {
        ...mockUser,
        profileImageUrl: 'https://broken-url.com/image.jpg',
      };
      render(
        <BrowserRouter>
          <UserContext.Provider
            value={{
              currentUser: userWithBrokenImage,
              setCurrentUser: jest.fn(),
            }}
          >
            <Nav />
          </UserContext.Provider>
        </BrowserRouter>
      );

      // Should still render the image element
      expect(screen.getByAltText('avatar')).toBeInTheDocument();
      expect(screen.getByAltText('avatar')).toHaveAttribute(
        'src',
        'https://broken-url.com/image.jpg'
      );
    });
  });

  describe('Performance', () => {
    it('renders efficiently with all elements', () => {
      const startTime = performance.now();
      renderWithProviders(<Nav />);
      const endTime = performance.now();

      // Should render quickly (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);

      // All elements should be present
      expect(screen.getByAltText('logo')).toBeInTheDocument();
      expect(screen.getByAltText('avatar')).toBeInTheDocument();
      expect(screen.getByTestId('mobile-nav')).toBeInTheDocument();
    });

    it('handles rapid re-renders efficiently', () => {
      const { rerender } = renderWithProviders(<Nav />);

      // Re-render multiple times
      for (let i = 0; i < 10; i++) {
        rerender(
          <BrowserRouter>
            <UserContext.Provider
              value={{ currentUser: mockUser, setCurrentUser: jest.fn() }}
            >
              <Nav />
            </UserContext.Provider>
          </BrowserRouter>
        );
      }

      // Should still render correctly
      expect(screen.getByAltText('logo')).toBeInTheDocument();
      expect(screen.getByAltText('avatar')).toBeInTheDocument();
    });
  });
});
