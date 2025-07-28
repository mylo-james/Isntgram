import React, { createContext, useState, ReactNode } from 'react';
import { Post } from '../types';

interface PostsContextValue {
  posts: Record<number, Post>;
  setPosts: React.Dispatch<React.SetStateAction<Record<number, Post>>>;
  postOrder: Set<number>;
  setPostOrder: React.Dispatch<React.SetStateAction<Set<number>>>;
}

interface PostsContextProviderProps {
  children: ReactNode;
}

export const PostsContext = createContext<PostsContextValue | undefined>(
  undefined
);

export function PostsContextProvider({ children }: PostsContextProviderProps) {
  const [posts, setPosts] = useState<Record<number, Post>>({});
  const [postOrder, setPostOrder] = useState<Set<number>>(new Set());

  const value: PostsContextValue = {
    posts,
    setPosts,
    postOrder,
    setPostOrder,
  };

  return (
    <PostsContext.Provider value={value}>{children}</PostsContext.Provider>
  );
}
