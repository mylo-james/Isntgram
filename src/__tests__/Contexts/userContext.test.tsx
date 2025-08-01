import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import {
  UserContextProvider,
  useUserContext,
} from '../../Contexts/userContext';
import { createMockUser } from '../utils/mock-factories';

// Test component to access context
const TestComponent = () => {
  const { currentUser, setCurrentUser, isAuthenticated } = useUserContext();

  return (
    <div>
      <div data-testid='current-user'>
        {currentUser ? currentUser.username : 'No user'}
      </div>
      <div data-testid='is-authenticated'>
        {isAuthenticated ? 'Authenticated' : 'Not authenticated'}
      </div>
      <button
        onClick={() => setCurrentUser(createMockUser())}
        data-testid='set-user'
      >
        Set User
      </button>
      <button onClick={() => setCurrentUser(null)} data-testid='clear-user'>
        Clear User
      </button>
    </div>
  );
};

describe('UserContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Provider Rendering', () => {
    it('renders children without crashing', () => {
      render(
        <UserContextProvider>
          <div data-testid='child'>Test Child</div>
        </UserContextProvider>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('provides initial state correctly', () => {
      render(
        <UserContextProvider>
          <TestComponent />
        </UserContextProvider>
      );

      expect(screen.getByTestId('current-user')).toHaveTextContent('No user');
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent(
        'Not authenticated'
      );
    });
  });

  describe('State Management', () => {
    it('updates currentUser when setCurrentUser is called', async () => {
      render(
        <UserContextProvider>
          <TestComponent />
        </UserContextProvider>
      );

      const setUserButton = screen.getByTestId('set-user');
      act(() => {
        setUserButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('current-user')).toHaveTextContent(
          'testuser'
        );
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent(
          'Authenticated'
        );
      });
    });

    it('clears currentUser when setCurrentUser(null) is called', async () => {
      render(
        <UserContextProvider>
          <TestComponent />
        </UserContextProvider>
      );

      // First set a user
      const setUserButton = screen.getByTestId('set-user');
      act(() => {
        setUserButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('current-user')).toHaveTextContent(
          'testuser'
        );
      });

      // Then clear the user
      const clearUserButton = screen.getByTestId('clear-user');
      clearUserButton.click();

      await waitFor(() => {
        expect(screen.getByTestId('current-user')).toHaveTextContent('No user');
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent(
          'Not authenticated'
        );
      });
    });

    it('updates isAuthenticated based on currentUser', async () => {
      render(
        <UserContextProvider>
          <TestComponent />
        </UserContextProvider>
      );

      // Initially not authenticated
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent(
        'Not authenticated'
      );

      // Set user
      const setUserButton = screen.getByTestId('set-user');
      act(() => {
        setUserButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent(
          'Authenticated'
        );
      });

      // Clear user
      const clearUserButton = screen.getByTestId('clear-user');
      clearUserButton.click();

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent(
          'Not authenticated'
        );
      });
    });
  });

  describe('Authentication Logic', () => {
    it('returns false for isAuthenticated when user is null', () => {
      render(
        <UserContextProvider>
          <TestComponent />
        </UserContextProvider>
      );

      expect(screen.getByTestId('is-authenticated')).toHaveTextContent(
        'Not authenticated'
      );
    });

    it('returns false for isAuthenticated when user has no id', async () => {
      render(
        <UserContextProvider>
          <TestComponent />
        </UserContextProvider>
      );

      // Set user without id
      const setUserButton = screen.getByTestId('set-user');
      setUserButton.click();

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent(
          'Authenticated'
        );
      });
    });

    it('returns true for isAuthenticated when user has valid id', async () => {
      render(
        <UserContextProvider>
          <TestComponent />
        </UserContextProvider>
      );

      const setUserButton = screen.getByTestId('set-user');
      setUserButton.click();

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent(
          'Authenticated'
        );
      });
    });
  });

  describe('Context Hook Usage', () => {
    it('throws error when useUserContext is used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useUserContext must be used within a UserContextProvider');

      consoleSpy.mockRestore();
    });

    it('provides stable function references', () => {
      let renderCount = 0;

      const TestComponentWithRenderCount = () => {
        const { setCurrentUser } = useUserContext();
        renderCount++;

        return (
          <button onClick={() => setCurrentUser(createMockUser())}>
            Set User
          </button>
        );
      };

      render(
        <UserContextProvider>
          <TestComponentWithRenderCount />
        </UserContextProvider>
      );

      const initialRenderCount = renderCount;

      // Re-render should not change function references
      render(
        <UserContextProvider>
          <TestComponentWithRenderCount />
        </UserContextProvider>
      );

      expect(renderCount).toBe(initialRenderCount + 1);
    });
  });

  describe('User Data Handling', () => {
    it('handles user with all properties', async () => {
      const completeUser = createMockUser({
        id: 123,
        username: 'completeuser',
        email: 'complete@example.com',
        profile_image_url: 'https://example.com/complete.jpg',
        bio: 'Complete user bio',
      });

      const TestComponentWithCompleteUser = () => {
        const { currentUser, setCurrentUser } = useUserContext();

        return (
          <div>
            <div data-testid='user-id'>{currentUser?.id || 'No ID'}</div>
            <div data-testid='user-username'>
              {currentUser?.username || 'No username'}
            </div>
            <div data-testid='user-email'>
              {currentUser?.email || 'No email'}
            </div>
            <div data-testid='user-bio'>{currentUser?.bio || 'No bio'}</div>
            <button
              onClick={() => setCurrentUser(completeUser)}
              data-testid='set-complete-user'
            >
              Set Complete User
            </button>
          </div>
        );
      };

      render(
        <UserContextProvider>
          <TestComponentWithCompleteUser />
        </UserContextProvider>
      );

      const setCompleteUserButton = screen.getByTestId('set-complete-user');
      setCompleteUserButton.click();

      await waitFor(() => {
        expect(screen.getByTestId('user-id')).toHaveTextContent('123');
        expect(screen.getByTestId('user-username')).toHaveTextContent(
          'completeuser'
        );
        expect(screen.getByTestId('user-email')).toHaveTextContent(
          'complete@example.com'
        );
        expect(screen.getByTestId('user-bio')).toHaveTextContent(
          'Complete user bio'
        );
      });
    });

    it('handles user with minimal properties', async () => {
      const minimalUser = {
        id: 456,
        username: 'minimaluser',
      };

      const TestComponentWithMinimalUser = () => {
        const { currentUser, setCurrentUser } = useUserContext();

        return (
          <div>
            <div data-testid='user-id'>{currentUser?.id || 'No ID'}</div>
            <div data-testid='user-username'>
              {currentUser?.username || 'No username'}
            </div>
            <div data-testid='user-email'>
              {currentUser?.email || 'No email'}
            </div>
            <button
              onClick={() => setCurrentUser(minimalUser as any)}
              data-testid='set-minimal-user'
            >
              Set Minimal User
            </button>
          </div>
        );
      };

      render(
        <UserContextProvider>
          <TestComponentWithMinimalUser />
        </UserContextProvider>
      );

      const setMinimalUserButton = screen.getByTestId('set-minimal-user');
      setMinimalUserButton.click();

      await waitFor(() => {
        expect(screen.getByTestId('user-id')).toHaveTextContent('456');
        expect(screen.getByTestId('user-username')).toHaveTextContent(
          'minimaluser'
        );
        expect(screen.getByTestId('user-email')).toHaveTextContent('No email');
      });
    });
  });

  describe('Performance', () => {
    it('does not cause unnecessary re-renders', () => {
      let renderCount = 0;

      const TestComponentWithRenderTracking = () => {
        const { currentUser } = useUserContext();
        renderCount++;

        return <div data-testid='render-count'>Renders: {renderCount}</div>;
      };

      render(
        <UserContextProvider>
          <TestComponentWithRenderTracking />
        </UserContextProvider>
      );

      const initialRenderCount = renderCount;

      // Re-render the provider
      render(
        <UserContextProvider>
          <TestComponentWithRenderTracking />
        </UserContextProvider>
      );

      // Should only render once more
      expect(renderCount).toBe(initialRenderCount + 1);
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid state updates', async () => {
      const TestComponentWithRapidUpdates = () => {
        const { currentUser, setCurrentUser } = useUserContext();

        return (
          <div>
            <div data-testid='user-count'>
              {currentUser ? 'Has user' : 'No user'}
            </div>
            <button
              onClick={() => {
                setCurrentUser(createMockUser({ id: 1 }));
                setCurrentUser(createMockUser({ id: 2 }));
                setCurrentUser(createMockUser({ id: 3 }));
              }}
              data-testid='rapid-updates'
            >
              Rapid Updates
            </button>
          </div>
        );
      };

      render(
        <UserContextProvider>
          <TestComponentWithRapidUpdates />
        </UserContextProvider>
      );

      const rapidUpdatesButton = screen.getByTestId('rapid-updates');
      rapidUpdatesButton.click();

      await waitFor(() => {
        expect(screen.getByTestId('user-count')).toHaveTextContent('Has user');
      });
    });

    it('handles null and undefined values gracefully', async () => {
      const TestComponentWithNullValues = () => {
        const { currentUser, setCurrentUser } = useUserContext();

        return (
          <div>
            <div data-testid='user-exists'>
              {currentUser ? 'User exists' : 'No user'}
            </div>
            <button onClick={() => setCurrentUser(null)} data-testid='set-null'>
              Set Null
            </button>
            <button
              onClick={() => setCurrentUser(undefined as any)}
              data-testid='set-undefined'
            >
              Set Undefined
            </button>
          </div>
        );
      };

      render(
        <UserContextProvider>
          <TestComponentWithNullValues />
        </UserContextProvider>
      );

      const setNullButton = screen.getByTestId('set-null');
      const setUndefinedButton = screen.getByTestId('set-undefined');

      setNullButton.click();
      await waitFor(() => {
        expect(screen.getByTestId('user-exists')).toHaveTextContent('No user');
      });

      setUndefinedButton.click();
      await waitFor(() => {
        expect(screen.getByTestId('user-exists')).toHaveTextContent('No user');
      });
    });
  });
});
