import { createContext, useState } from "react";

export const PostContext = createContext();

export function PostContextProvider({ children }) {
  const [postData, setPostData] = useState(null);
  const value = { postData, setPostData };
  return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
}

