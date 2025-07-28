import { useContext } from 'react';
import { UserContext } from '../Contexts/userContext';
import { PostsContext } from '../Contexts/postContext';
import { LikeContext } from '../Contexts/likeContext';
import { FollowContext } from '../Contexts/followContext';
import { ProfileContext } from '../Contexts/profileContext';

// Custom hooks for type-safe context usage
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserContextProvider');
  }
  return context;
}

export function usePosts() {
  const context = useContext(PostsContext);
  if (context === undefined) {
    throw new Error('usePosts must be used within a PostsContextProvider');
  }
  return context;
}

export function useLikes() {
  const context = useContext(LikeContext);
  if (context === undefined) {
    throw new Error('useLikes must be used within a LikeContextProvider');
  }
  return context;
}

export function useFollows() {
  const context = useContext(FollowContext);
  if (context === undefined) {
    throw new Error('useFollows must be used within a FollowContextProvider');
  }
  return context;
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileContextProvider');
  }
  return context;
}
