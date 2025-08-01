import React, { useState, useEffect } from 'react';
import { useApi } from '../../utils/apiComposable';
import type {
  LoginRequest,
  SignupRequest,
  CreatePostRequest,
  CreateCommentRequest,
  ToggleLikeRequest,
  FollowUserRequest,
  Post,
  User,
} from '../../types/api';

/**
 * Example component demonstrating the new API composable usage
 * This shows how to use all the different API endpoints with proper error handling
 */
const ApiExample: React.FC = () => {
  const {
    // Auth methods
    login,
    signup,
    logout,
    authenticate,

    // User methods
    lookupUser,
    updateUser,
    resetUserImage,

    // Post methods
    getPosts,
    createPost,
    updatePost,
    deletePost,
    getPost,

    // Comment methods
    createComment,
    updateComment,
    deleteComment,

    // Like methods
    toggleLike,

    // Follow methods
    followUser,
    unfollowUser,

    // Search methods
    search,

    // State
    isLoading,
    error,
    currentUser,
    isAuthenticated,
    clearError,
  } = useApi();

  // Local state for examples
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [exampleData, setExampleData] = useState({
    loginEmail: 'demo@example.com',
    loginPassword: 'password123',
    signupData: {
      username: 'newuser',
      email: 'newuser@example.com',
      full_name: 'New User',
      password: 'Password123',
      confirm_password: 'Password123',
      bio: 'This is a demo user',
    },
    postData: {
      image_url: 'https://example.com/image.jpg',
      caption: 'This is a test post',
    },
    commentData: {
      content: 'This is a test comment',
      post_id: 1,
    },
  });

  // Example: Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated) {
        console.log('User is authenticated:', currentUser);
      } else {
        console.log('User is not authenticated');
      }
    };

    checkAuth();
  }, [isAuthenticated, currentUser]);

  // Example: Login
  const handleLogin = async () => {
    clearError();

    const loginRequest: LoginRequest = {
      email: exampleData.loginEmail,
      password: exampleData.loginPassword,
    };

    const response = await login(loginRequest);

    if (response.error) {
      console.error('Login failed:', response.error);
    } else {
      console.log('Login successful:', response.data);
    }
  };

  // Example: Signup
  const handleSignup = async () => {
    clearError();

    const signupRequest: SignupRequest = exampleData.signupData;

    const response = await signup(signupRequest);

    if (response.error) {
      console.error('Signup failed:', response.error);
    } else {
      console.log('Signup successful:', response.data);
    }
  };

  // Example: Get Posts
  const handleGetPosts = async () => {
    clearError();

    const response = await getPosts(0);

    if (response.error) {
      console.error('Failed to get posts:', response.error);
    } else {
      setPosts(response.data?.posts || []);
      console.log('Posts loaded:', response.data);
    }
  };

  // Example: Create Post
  const handleCreatePost = async () => {
    clearError();

    const postRequest: CreatePostRequest = exampleData.postData;

    const response = await createPost(postRequest);

    if (response.error) {
      console.error('Failed to create post:', response.error);
    } else {
      console.log('Post created:', response.data);
      // Refresh posts list
      handleGetPosts();
    }
  };

  // Example: Create Comment
  const handleCreateComment = async () => {
    clearError();

    const commentRequest: CreateCommentRequest = exampleData.commentData;

    const response = await createComment(commentRequest);

    if (response.error) {
      console.error('Failed to create comment:', response.error);
    } else {
      console.log('Comment created:', response.data);
    }
  };

  // Example: Toggle Like
  const handleToggleLike = async (postId: number) => {
    clearError();

    const likeRequest: ToggleLikeRequest = {
      likeable_id: postId,
      likeable_type: 'post',
    };

    const response = await toggleLike(likeRequest);

    if (response.error) {
      console.error('Failed to toggle like:', response.error);
    } else {
      console.log('Like toggled:', response.data);
    }
  };

  // Example: Follow User
  const handleFollowUser = async (userId: number) => {
    clearError();

    const followRequest: FollowUserRequest = {
      user_id: currentUser?.id || 0,
      user_followed_id: userId,
    };

    const response = await followUser(followRequest);

    if (response.error) {
      console.error('Failed to follow user:', response.error);
    } else {
      console.log('User followed:', response.data);
    }
  };

  // Example: Search
  const handleSearch = async (query: string) => {
    clearError();

    const response = await search(query);

    if (response.error) {
      console.error('Search failed:', response.error);
    } else {
      setSearchResults(response.data);
      console.log('Search results:', response.data);
    }
  };

  // Example: Lookup User
  const handleLookupUser = async (username: string) => {
    clearError();

    const response = await lookupUser(username);

    if (response.error) {
      console.error('User lookup failed:', response.error);
    } else {
      console.log('User found:', response.data);
    }
  };

  return (
    <div className='p-6 max-w-4xl mx-auto space-y-6'>
      <h1 className='text-3xl font-bold text-gray-900'>
        API Composable Examples
      </h1>

      {/* Status Display */}
      <div className='bg-gray-50 p-4 rounded-lg'>
        <h2 className='text-lg font-semibold mb-2'>Current Status</h2>
        <div className='space-y-1 text-sm'>
          <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
          <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
          <div>Current User: {currentUser?.username || 'None'}</div>
          {error && <div className='text-red-600'>Error: {error}</div>}
        </div>
      </div>

      {/* Authentication Examples */}
      <div className='bg-white p-6 rounded-lg shadow'>
        <h2 className='text-xl font-semibold mb-4'>Authentication</h2>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <h3 className='font-medium mb-2'>Login</h3>
            <input
              type='email'
              placeholder='Email'
              value={exampleData.loginEmail}
              onChange={(e) =>
                setExampleData((prev) => ({
                  ...prev,
                  loginEmail: e.target.value,
                }))
              }
              className='w-full p-2 border rounded mb-2'
            />
            <input
              type='password'
              placeholder='Password'
              value={exampleData.loginPassword}
              onChange={(e) =>
                setExampleData((prev) => ({
                  ...prev,
                  loginPassword: e.target.value,
                }))
              }
              className='w-full p-2 border rounded mb-2'
            />
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className='w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50'
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>

          <div>
            <h3 className='font-medium mb-2'>Signup</h3>
            <button
              onClick={handleSignup}
              disabled={isLoading}
              className='w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:opacity-50'
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>
        </div>

        <button
          onClick={logout}
          disabled={isLoading}
          className='mt-4 bg-red-500 text-white p-2 rounded hover:bg-red-600 disabled:opacity-50'
        >
          Logout
        </button>
      </div>

      {/* Posts Examples */}
      <div className='bg-white p-6 rounded-lg shadow'>
        <h2 className='text-xl font-semibold mb-4'>Posts</h2>

        <div className='space-y-4'>
          <button
            onClick={handleGetPosts}
            disabled={isLoading}
            className='bg-purple-500 text-white p-2 rounded hover:bg-purple-600 disabled:opacity-50'
          >
            {isLoading ? 'Loading...' : 'Get Posts'}
          </button>

          <button
            onClick={handleCreatePost}
            disabled={isLoading}
            className='bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:opacity-50'
          >
            {isLoading ? 'Creating...' : 'Create Post'}
          </button>

          {posts.length > 0 && (
            <div className='mt-4'>
              <h3 className='font-medium mb-2'>Posts ({posts.length})</h3>
              <div className='space-y-2'>
                {posts.slice(0, 3).map((post) => (
                  <div key={post.id} className='border p-3 rounded'>
                    <div className='font-medium'>{post.caption}</div>
                    <div className='text-sm text-gray-600'>
                      by {post.user?.username}
                    </div>
                    <button
                      onClick={() => handleToggleLike(post.id)}
                      className='text-blue-500 text-sm hover:underline'
                    >
                      Like
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Other Examples */}
      <div className='bg-white p-6 rounded-lg shadow'>
        <h2 className='text-xl font-semibold mb-4'>Other Actions</h2>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <h3 className='font-medium mb-2'>Comments</h3>
            <button
              onClick={handleCreateComment}
              disabled={isLoading}
              className='w-full bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 disabled:opacity-50'
            >
              {isLoading ? 'Creating...' : 'Create Comment'}
            </button>
          </div>

          <div>
            <h3 className='font-medium mb-2'>Search</h3>
            <button
              onClick={() => handleSearch('test')}
              disabled={isLoading}
              className='w-full bg-indigo-500 text-white p-2 rounded hover:bg-indigo-600 disabled:opacity-50'
            >
              {isLoading ? 'Searching...' : 'Search "test"'}
            </button>
          </div>

          <div>
            <h3 className='font-medium mb-2'>User Lookup</h3>
            <button
              onClick={() => handleLookupUser('demo')}
              disabled={isLoading}
              className='w-full bg-pink-500 text-white p-2 rounded hover:bg-pink-600 disabled:opacity-50'
            >
              {isLoading ? 'Looking up...' : 'Lookup User "demo"'}
            </button>
          </div>

          <div>
            <h3 className='font-medium mb-2'>Follow User</h3>
            <button
              onClick={() => handleFollowUser(1)}
              disabled={isLoading}
              className='w-full bg-teal-500 text-white p-2 rounded hover:bg-teal-600 disabled:opacity-50'
            >
              {isLoading ? 'Following...' : 'Follow User ID 1'}
            </button>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {searchResults && (
        <div className='bg-white p-6 rounded-lg shadow'>
          <h2 className='text-xl font-semibold mb-4'>Search Results</h2>
          <pre className='bg-gray-100 p-4 rounded text-sm overflow-auto'>
            {JSON.stringify(searchResults, null, 2)}
          </pre>
        </div>
      )}

      {/* Clear Error Button */}
      {error && (
        <div className='bg-white p-6 rounded-lg shadow'>
          <button
            onClick={clearError}
            className='bg-gray-500 text-white p-2 rounded hover:bg-gray-600'
          >
            Clear Error
          </button>
        </div>
      )}
    </div>
  );
};

export default ApiExample;
