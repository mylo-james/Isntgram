import { createContext, useState } from "react";

export const UserContext = createContext();

export function UserContextProvider({ children }) {
  const [id, setId] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [followingCount, setFollowingCount] = useState(null);
  const [followerCount, setFollowerCount] = useState(null);

  const value = {
    id,
    setId,
    profilePic,
    setProfilePic,
    followerCount,
    setFollowerCount,
    followingCount,
    setFollowingCount,
  };
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
