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
  setCurrentUser: (user: User | null) => void;
  isAuthenticated: boolean;
}

export interface PostsContextType {
  posts: Post[];
  setPosts: (posts: Post[]) => void;
  addPost: (post: Post) => void;
  updatePost: (postId: number, updatedPost: Partial<Post>) => void;
  deletePost: (postId: number) => void;
}

export interface LikeContextType {
  likedPosts: Set<number>;
  likedComments: Set<number>;
  togglePostLike: (postId: number) => void;
  toggleCommentLike: (commentId: number) => void;
}

export interface ProfileContextType {
  profileUser: User | null;
  setProfileUser: (user: User | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export interface FollowContextType {
  followingUsers: Set<number>;
  toggleFollow: (userId: number) => void;
  isFollowing: (userId: number) => boolean;
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

// Component Props Types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export interface InfiniteScrollProps {
  hasMore: boolean;
  loadMore: () => void;
  children: React.ReactNode;
}

// Re-export component types for convenience
export * from './components';
