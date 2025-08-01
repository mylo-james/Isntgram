import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { UserContext } from '../../Contexts/userContext';
import { PostsContext } from '../../Contexts/postContext';
import { LikeContext } from '../../Contexts/likeContext';
import { FollowContext } from '../../Contexts/followContext';
import { ProfileContext } from '../../Contexts/profileContext';
import { User, Post, LikeObject } from '../../types';

interface TestWrapperProps {
  children: React.ReactNode;
  initialUser?: User | null;
  initialPosts?: Record<number, Post>;
  initialLikes?: Record<string, LikeObject> | null;
  initialFollows?: Set<number>;
}

export const TestWrapper: React.FC<TestWrapperProps> = ({
  children,
  initialUser = null,
  initialPosts = {},
  initialLikes = null,
  initialFollows = new Set(),
}) => {
  const [currentUser, setCurrentUser] = React.useState<User | null>(
    initialUser
  );
  const [posts, setPosts] = React.useState<Record<number, Post>>(initialPosts);
  const [likes, setLikes] = React.useState<Record<string, LikeObject> | null>(
    initialLikes
  );
  const [follows, setFollows] = React.useState<Set<number>>(initialFollows);
  const [profileData, setProfileData] = React.useState<User | null>(null);

  return (
    <BrowserRouter>
      <UserContext.Provider
        value={{ currentUser, setCurrentUser, isAuthenticated: !!currentUser }}
      >
        <PostsContext.Provider
          value={{
            posts,
            setPosts,
            postOrder: new Set(),
            setPostOrder: jest.fn(),
          }}
        >
          <LikeContext.Provider
            value={{
              likes,
              setLikes,
            }}
          >
            <FollowContext.Provider
              value={{
                follows,
                setFollows,
              }}
            >
              <ProfileContext.Provider value={{ profileData, setProfileData }}>
                {children}
              </ProfileContext.Provider>
            </FollowContext.Provider>
          </LikeContext.Provider>
        </PostsContext.Provider>
      </UserContext.Provider>
    </BrowserRouter>
  );
};

export const renderWithProviders = (
  ui: React.ReactElement,
  options?: {
    initialUser?: User | null;
    initialPosts?: Record<number, Post>;
    initialLikes?: Record<string, LikeObject> | null;
    initialFollows?: Set<number>;
  }
) => {
  return render(ui, {
    wrapper: ({ children }) => (
      <TestWrapper
        initialUser={options?.initialUser}
        initialPosts={options?.initialPosts}
        initialLikes={options?.initialLikes}
        initialFollows={options?.initialFollows}
      >
        {children}
      </TestWrapper>
    ),
  });
};

// Mock data creation utilities
export const createMockUser = (overrides: Partial<User> = {}): User => ({
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
  ...overrides,
});

export const createMockPost = (overrides: Partial<Post> = {}): Post => ({
  id: 1,
  caption: 'Test post caption',
  imageUrl: 'https://example.com/post.jpg',
  userId: 1,
  user: createMockUser(),
  comments: [],
  likes: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockComment = (overrides: any = {}) => ({
  id: 1,
  text: 'Test comment',
  userId: 1,
  postId: 1,
  user: createMockUser(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockLike = (overrides: any = {}) => ({
  id: 1,
  userId: 1,
  likeableId: 1,
  likeableType: 'post',
  user: createMockUser(),
  createdAt: new Date().toISOString(),
  ...overrides,
});
