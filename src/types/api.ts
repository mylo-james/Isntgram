// API Types for Isntgram Backend Integration
// These types match the frontend expectations AFTER middleware conversion (camelCase)
// Backend serves snake_case, middleware converts to camelCase

// ============================================================================
// BASE TYPES
// ============================================================================

export interface APIResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  hasMore: boolean;
  nextOffset?: number;
}

// ============================================================================
// USER TYPES
// ============================================================================

export interface User {
  id: number;
  email: string;
  fullName: string; // Backend: full_name
  username: string;
  profileImageUrl?: string; // Backend: profile_image_url
  bio?: string;
  createdAt: string; // Backend: created_at
  updatedAt: string; // Backend: updated_at
  // Profile endpoint includes these related arrays
  posts?: Post[];
  followers?: Follow[];
  following?: Follow[];
}

export interface UserPublic {
  id: number;
  username: string;
  fullName: string; // Backend: full_name
  profileImageUrl?: string; // Backend: profile_image_url
}

export interface UserStats {
  postsCount: number; // Backend: posts_count
  followersCount: number; // Backend: followers_count
  followingCount: number; // Backend: following_count
}

// User API Request Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  fullName: string; // Backend: full_name
  password: string;
  confirmPassword: string; // Backend: confirm_password
  bio?: string;
}

export interface UpdateUserRequest {
  id: number;
  username: string;
  email: string;
  fullName: string; // Backend: full_name
  bio?: string;
}

// User API Response Types
export interface LoginResponse {
  user: User;
  message?: string;
}

export interface SignupResponse {
  user: User;
  message?: string;
}

export interface UserLookupResponse {
  user: User;
}

// Profile endpoint returns this structure
export interface ProfileResponse {
  user: User;
  numPosts: number; // Backend: num_posts
  posts: Post[];
  followersList: Follow[]; // Backend: followersList
  followingList: Follow[]; // Backend: followingList
}

export interface UpdateUserResponse {
  accessToken: string; // Backend: access_token
  user: User;
}

export interface ResetImageResponse {
  id: number;
  email: string;
  fullName: string; // Backend: full_name
  username: string;
  profileImageUrl: string; // Backend: profile_image_url
  bio?: string;
  createdAt: string; // Backend: created_at
  updatedAt: string; // Backend: updated_at
}

// ============================================================================
// POST TYPES
// ============================================================================

export interface Post {
  id: number;
  imageUrl: string; // Backend: image_url
  caption?: string; // Made optional to match backend schema
  userId: number; // Backend: user_id
  createdAt: string; // Backend: created_at
  updatedAt: string; // Backend: updated_at
  user?: UserPublic;
  likeCount?: number; // Backend: like_count
  commentCount?: number; // Backend: comment_count
  // Profile endpoint includes these related arrays
  comments?: Comment[];
  likes?: Like[];
}

export interface PostWithUser extends Post {
  user: UserPublic;
}

export interface PostDetail extends PostWithUser {
  comments: Comment[];
  likes: Like[];
}

// Post API Request Types
export interface CreatePostRequest {
  imageUrl: string; // Backend: image_url
  caption?: string;
}

export interface UpdatePostRequest {
  caption: string;
}

// Post API Response Types
export interface PostsResponse {
  posts: Post[];
}

export interface CreatePostResponse {
  post: PostWithUser;
  message?: string;
}

export interface UpdatePostResponse {
  post: PostWithUser;
  message?: string;
}

export interface SinglePostResponse {
  post: PostDetail;
}

export interface HomeFeedResponse {
  posts: PostDetail[];
}

// ============================================================================
// COMMENT TYPES
// ============================================================================

export interface Comment {
  id: number;
  content: string;
  createdAt: string; // Backend: created_at
  updatedAt: string; // Backend: updated_at
  postId: number; // Backend: post_id
  userId: number; // Backend: user_id
  user: UserPublic;
  likes?: Like[];
  likesCount?: number; // Backend: likes_count
}

// Comment API Request Types
export interface CreateCommentRequest {
  content: string;
  postId: number; // Backend: post_id
}

export interface UpdateCommentRequest {
  content: string;
}

// Comment API Response Types
export interface CreateCommentResponse {
  comment: Comment;
  message?: string;
}

export interface UpdateCommentResponse {
  comment: Comment;
  message?: string;
}

// ============================================================================
// LIKE TYPES
// ============================================================================

export interface Like {
  id: number;
  userId: number; // Backend: user_id
  user: UserPublic;
  likeableId: number; // Backend: likeable_id
  likeableType: 'post' | 'comment'; // Backend: likeable_type
  createdAt: string; // Backend: created_at
}

export interface ToggleLikeRequest {
  likeableId: number; // Backend: likeable_id
  likeableType: 'post' | 'comment'; // Backend: likeable_type
}

export interface ToggleLikeResponse {
  liked: boolean;
  message?: string;
}

// ============================================================================
// FOLLOW TYPES
// ============================================================================

export interface Follow {
  id: number;
  userId: number; // Backend: user_id
  userFollowedId: number; // Backend: user_followed_id
  user: UserPublic;
  userFollowed: UserPublic; // Backend: user_followed
  createdAt: string; // Backend: created_at
}

export interface FollowUserRequest {
  userId: number; // Backend: user_id
  userFollowedId: number; // Backend: user_followed_id
}

export interface FollowResponse {
  follow: Follow;
  message?: string;
}

export interface UnfollowResponse {
  message: string;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface Notification {
  id: number;
  type: 'like' | 'comment' | 'follow';
  read: boolean;
  createdAt: string; // Backend: created_at
  userId: number; // Backend: user_id
  user: UserPublic;
  relatedId?: number; // Backend: related_id
  relatedUser?: UserPublic; // Backend: related_user
  post?: Post;
  comment?: Comment;
}

export interface NotificationsResponse {
  notifications: Notification[];
}

// ============================================================================
// SEARCH TYPES
// ============================================================================

export interface SearchResult {
  users: UserPublic[];
  posts: Post[];
}

export interface SearchResponse {
  results: SearchResult;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface APIError {
  error: string;
  details?: string[];
  statusCode?: number; // Backend: status_code
}

// ============================================================================
// AUTH TYPES
// ============================================================================

export interface AuthToken {
  accessToken: string; // Backend: access_token
}

// ============================================================================
// PAGINATION TYPES
// ============================================================================

export interface PaginationParams {
  offset?: number;
  limit?: number;
}

// ============================================================================
// API ENDPOINTS INTERFACE
// ============================================================================

export interface APIEndpoints {
  // Auth endpoints
  auth: {
    authenticate: () => Promise<APIResponse<User>>;
    login: (data: LoginRequest) => Promise<APIResponse<LoginResponse>>;
    logout: () => Promise<APIResponse<{ message: string }>>;
    signup: (data: SignupRequest) => Promise<APIResponse<SignupResponse>>;
    unauthorized: () => Promise<APIResponse<{ error: string }>>;
  };

  // User endpoints
  user: {
    lookup: (username: string) => Promise<APIResponse<UserLookupResponse>>;
    update: (
      data: UpdateUserRequest
    ) => Promise<APIResponse<UpdateUserResponse>>;
    resetImage: (userId: number) => Promise<APIResponse<ResetImageResponse>>;
  };

  // Post endpoints
  post: {
    getPosts: (offset: number) => Promise<APIResponse<PostsResponse>>;
    getExplorePosts: (offset: number) => Promise<APIResponse<PostsResponse>>;
    createPost: (
      data: CreatePostRequest
    ) => Promise<APIResponse<CreatePostResponse>>;
    updatePost: (
      postId: number,
      data: UpdatePostRequest
    ) => Promise<APIResponse<UpdatePostResponse>>;
    deletePost: (postId: number) => Promise<APIResponse<{ message: string }>>;
    getHomeFeed: (
      userId: number,
      offset: number
    ) => Promise<APIResponse<HomeFeedResponse>>;
    getPost: (postId: number) => Promise<APIResponse<SinglePostResponse>>;
  };

  // Comment endpoints
  comment: {
    createComment: (
      data: CreateCommentRequest
    ) => Promise<APIResponse<CreateCommentResponse>>;
    updateComment: (
      commentId: number,
      data: UpdateCommentRequest
    ) => Promise<APIResponse<UpdateCommentResponse>>;
    deleteComment: (
      commentId: number
    ) => Promise<APIResponse<{ message: string }>>;
  };

  // Like endpoints
  like: {
    toggleLike: (
      data: ToggleLikeRequest
    ) => Promise<APIResponse<ToggleLikeResponse>>;
  };

  // Follow endpoints
  follow: {
    followUser: (
      data: FollowUserRequest
    ) => Promise<APIResponse<FollowResponse>>;
    unfollowUser: (
      data: FollowUserRequest
    ) => Promise<APIResponse<UnfollowResponse>>;
    getFollowers: (
      userId: number
    ) => Promise<APIResponse<{ follows: Follow[] }>>;
    getFollowing: (
      userId: number
    ) => Promise<APIResponse<{ follows: Follow[] }>>;
  };

  // Search endpoints
  search: {
    search: (query: string) => Promise<APIResponse<SearchResponse>>;
  };
}
