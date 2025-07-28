import React, { createContext, useState, ReactNode } from 'react';

interface LikeObject {
  id: number;
  userId: number;
  postId?: number;
  commentId?: number;
}

interface LikeContextValue {
  likes: Record<string, LikeObject> | null;
  setLikes: React.Dispatch<
    React.SetStateAction<Record<string, LikeObject> | null>
  >;
}

interface LikeContextProviderProps {
  children: ReactNode;
}

export const LikeContext = createContext<LikeContextValue | undefined>(
  undefined
);

export function LikeContextProvider({ children }: LikeContextProviderProps) {
  const [likes, setLikes] = useState<Record<string, LikeObject> | null>(null);

  const value: LikeContextValue = {
    likes,
    setLikes,
  };

  return <LikeContext.Provider value={value}>{children}</LikeContext.Provider>;
}
