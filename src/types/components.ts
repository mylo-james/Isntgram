import React, { CSSProperties } from 'react';
import { User, Post, Comment } from './index';

// =======================
// COMPONENT PROP INTERFACES
// =======================

// Layout & Navigation Components
export interface NavProps {
  currentUser: User | null;
}

export interface MobileNavProps {
  currentUser: User | null;
  isVisible: boolean;
}

export interface SearchProps {
  onUserSelect?: (user: User) => void;
  placeholder?: string;
  className?: string;
}

// Modal Components
export interface DynamicModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  className?: string;
  children: React.ReactNode;
}

export interface ModalBackdropProps {
  onClick: () => void;
  className?: string;
}

// Loading Components
export interface LoadingProps {
  positioner?: CSSProperties;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
}

export interface SpinnerProps {
  size?: number;
  color?: string;
  className?: string;
}

// Post Components
export interface PostCardProps {
  post: Post;
  onLike?: (postId: number) => void;
  onComment?: (postId: number) => void;
  onDelete?: (postId: number) => void;
  showActions?: boolean;
  className?: string;
}

export interface PostImageProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
}

export interface PostHeaderProps {
  user: User;
  createdAt: string;
  onUserClick?: (user: User) => void;
  showOptions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export interface PostActionsProps {
  post: Post;
  isLiked: boolean;
  onLike: () => void;
  onComment: () => void;
  onShare?: () => void;
  className?: string;
}

export interface PostStatsProps {
  likesCount: number;
  commentsCount: number;
  onLikesClick?: () => void;
  onCommentsClick?: () => void;
  className?: string;
}

// Comment Components
export interface CommentProps {
  comment: Comment;
  onLike?: (commentId: number) => void;
  onDelete?: (commentId: number) => void;
  onReply?: (commentId: number) => void;
  showReplyButton?: boolean;
  className?: string;
}

export interface CommentListProps {
  comments: Comment[];
  postId: number;
  onCommentLike?: (commentId: number) => void;
  onCommentDelete?: (commentId: number) => void;
  maxVisible?: number;
  className?: string;
}

export interface CommentFormProps {
  postId: number;
  onSubmit: (content: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

// Profile Components
export interface ProfileHeaderProps {
  user: User;
  isCurrentUser: boolean;
  isFollowing?: boolean;
  onFollow?: () => void;
  onEdit?: () => void;
  className?: string;
}

export interface ProfileStatsProps {
  postsCount: number;
  followersCount: number;
  followingCount: number;
  onPostsClick?: () => void;
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
  className?: string;
}

export interface ProfileGridProps {
  posts: Post[];
  onPostClick?: (post: Post) => void;
  columns?: number;
  className?: string;
}

// Upload Components
export interface UploadProps {
  onUpload: (file: File, caption: string) => void;
  onCancel: () => void;
  maxFileSize?: number;
  acceptedTypes?: string[];
  className?: string;
}

export interface ImagePreviewProps {
  file: File;
  onRemove: () => void;
  className?: string;
}

export interface CaptionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

// Explore Components
export interface ExploreGridProps {
  posts: Post[];
  onPostClick?: (post: Post) => void;
  className?: string;
}

export interface UserSquareProps {
  user: User;
  onClick?: (user: User) => void;
  size?: 'small' | 'medium' | 'large';
  showUsername?: boolean;
  className?: string;
}

// Layout Components (for Explore)
export interface Layout1Props {
  posts: Post[];
  onPostClick?: (post: Post) => void;
  className?: string;
}

export interface Layout2Props {
  posts: Post[];
  onPostClick?: (post: Post) => void;
  className?: string;
}

export interface Layout3Props {
  posts: Post[];
  onPostClick?: (post: Post) => void;
  className?: string;
}

// Notification Components
export interface NotificationProps {
  notification: {
    id: number;
    type: 'like' | 'comment' | 'follow';
    user: User;
    post?: Post;
    comment?: Comment;
    createdAt: string;
    read: boolean;
  };
  onMarkAsRead?: (notificationId: number) => void;
  onClick?: () => void;
  className?: string;
}

export interface LikeNotificationProps {
  user: User;
  post: Post;
  createdAt: string;
  onUserClick?: (user: User) => void;
  onPostClick?: (post: Post) => void;
  className?: string;
}

export interface CommentNotificationProps {
  user: User;
  post: Post;
  comment: Comment;
  createdAt: string;
  onUserClick?: (user: User) => void;
  onPostClick?: (post: Post) => void;
  className?: string;
}

export interface FollowNotificationProps {
  user: User;
  createdAt: string;
  isFollowing: boolean;
  onUserClick?: (user: User) => void;
  onFollowToggle?: () => void;
  className?: string;
}

export interface NoFollowsProps {
  type: 'followers' | 'following';
  currentUser?: User;
  className?: string;
}

// =======================
// EVENT HANDLER TYPES
// =======================

export type UserClickHandler = (user: User) => void;
export type PostClickHandler = (post: Post) => void;
export type CommentClickHandler = (comment: Comment) => void;
export type LikeHandler = (id: number) => void;
export type FollowHandler = (userId: number) => void;
export type FormSubmitHandler<T> = (data: T) => void;
export type FileUploadHandler = (file: File) => void;
export type SearchHandler = (query: string) => void;

// =======================
// UTILITY PROP TYPES
// =======================

export interface BaseComponentProps {
  className?: string;
  id?: string;
  'data-testid'?: string;
}

export interface ClickableProps extends BaseComponentProps {
  onClick?: () => void;
  disabled?: boolean;
  'aria-label'?: string;
}

export interface FormFieldProps extends BaseComponentProps {
  name: string;
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

// =======================
// PAGE COMPONENT TYPES
// =======================

export interface HomePageProps {
  // Props for main home/feed page
}

export interface ProfilePageProps {
  username?: string; // From URL params
}

export interface ExplorePageProps {
  // Props for explore page
}

export interface AuthPageProps {
  mode: 'login' | 'signup';
  redirectTo?: string;
}

export interface MessagesPageProps {
  conversationId?: string; // From URL params
}

// =======================
// RESPONSIVE & THEME TYPES
// =======================

export interface ResponsiveProps {
  mobile?: boolean;
  tablet?: boolean;
  desktop?: boolean;
}

export interface ThemeProps {
  theme?: 'light' | 'dark';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
}

// =======================
// INFINITE SCROLL TYPES
// =======================

export interface InfiniteScrollProps {
  hasMore: boolean;
  loadMore: () => void;
  loading?: boolean;
  threshold?: number;
  className?: string;
  children: React.ReactNode;
}

export interface PaginationState {
  offset: number;
  limit: number;
  hasMore: boolean;
  loading: boolean;
}
