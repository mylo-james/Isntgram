import { createContext, useState, ReactNode, useContext } from 'react';
import { User, UserContextType } from '../types';

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

interface UserContextProviderProps {
  children: ReactNode;
}

export function UserContextProvider({ children }: UserContextProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const isAuthenticated = Boolean(currentUser?.id);

  const value: UserContextType = {
    currentUser,
    setCurrentUser,
    isAuthenticated,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// Custom hook for using UserContext
export function useUserContext(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserContextProvider');
  }
  return context;
}

// Alias for backward compatibility
export const useUser = useUserContext;
