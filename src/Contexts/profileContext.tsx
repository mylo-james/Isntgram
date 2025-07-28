import React, { createContext, useState, ReactNode } from 'react';
import { User } from '../types';

interface ProfileContextValue {
  profileData: User | null;
  setProfileData: React.Dispatch<React.SetStateAction<User | null>>;
}

interface ProfileContextProviderProps {
  children: ReactNode;
}

export const ProfileContext = createContext<ProfileContextValue | undefined>(
  undefined
);

export function ProfileContextProvider({
  children,
}: ProfileContextProviderProps) {
  const [profileData, setProfileData] = useState<User | null>(null);

  const value: ProfileContextValue = {
    profileData,
    setProfileData,
  };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}
