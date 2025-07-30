// Core Application Types for Isntgram

export interface User {
  id: number;
  username: string;
  email?: string;
  profileImageUrl?: string;
  bio?: string;
  fullName?: string;
  posts?: Post[];
  followers?: Follow[];
  following?: Follow[];
}

export interface Post {
  id: number;
  imageUrl: string;
  caption: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  user?: User;
  comments?: Comment[];
  likes?: Like[];
  likeCount?: number;
  commentCount?: number;
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  postId: number;
  userId: number;
  user: User;
  likes?: Like[];
  likesCount?: number;
}

export interface Like {
  id: number;
  userId: number;
  user: User;
  likeableId: number;
  likeableType: 'post' | 'comment';
  createdAt: string;
}

export interface Follow {
  id: number;
  userId: number;
  userFollowedId: number;
  user: User;
  userFollowed: User;
  createdAt: string;
}

export interface Notification {
  id: number;
  type: 'like' | 'comment' | 'follow';
  read: boolean;
  createdAt: string;
  userId: number;
  user: User;
  relatedId?: number;
  relatedUser?: User;
  post?: Post;
  comment?: Comment;
}

// API Response Types
export interface APIResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  hasMore: boolean;
  nextOffset?: number;
}

// Context Types
export interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (_user: User | null) => void;
  isAuthenticated: boolean;
}

export interface PostsContextType {
  posts: Post[];
  setPosts: (_posts: Post[]) => void;
  addPost: (_post: Post) => void;
  updatePost: (_postId: number, _updatedPost: Partial<Post>) => void;
  deletePost: (_postId: number) => void;
}

export interface LikeContextType {
  likedPosts: Set<number>;
  likedComments: Set<number>;
  togglePostLike: (_postId: number) => void;
  toggleCommentLike: (_commentId: number) => void;
}

export interface ProfileContextType {
  profileUser: User | null;
  setProfileUser: (_user: User | null) => void;
  isLoading: boolean;
  setIsLoading: (_loading: boolean) => void;
}

export interface FollowContextType {
  followingUsers: Set<number>;
  toggleFollow: (_userId: number) => void;
  isFollowing: (_userId: number) => boolean;
}

// Form Types
export interface LoginFormData {
  username: string;
  password: string;
}

export interface SignupFormData {
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export interface PostFormData {
  caption: string;
  image: File;
}

export interface CommentFormData {
  content: string;
}

// Re-export component types for convenience
// export * from './components'; // Removed - unused interfaces
