import React, { createContext, useState, ReactNode } from 'react';

interface FollowContextValue {
  follows: Set<number>;
  setFollows: React.Dispatch<React.SetStateAction<Set<number>>>;
}

interface FollowContextProviderProps {
  children: ReactNode;
}

export const FollowContext = createContext<FollowContextValue | undefined>(
  undefined
);

export function FollowContextProvider({
  children,
}: FollowContextProviderProps) {
  const [follows, setFollows] = useState<Set<number>>(new Set());

  const value: FollowContextValue = {
    follows,
    setFollows,
  };

  return (
    <FollowContext.Provider value={value}>{children}</FollowContext.Provider>
  );
}
