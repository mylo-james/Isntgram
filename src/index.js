import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ToastContainer } from 'react-toastify';
import App from './App';
import {
  PostsContextProvider,
  ProfileContextProvider,
  UserContextProvider,
  LikeContextProvider,
  FollowContextProvider,
} from './Contexts';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <StrictMode>
    <UserContextProvider>
      <ProfileContextProvider>
        <PostsContextProvider>
          <LikeContextProvider>
            <FollowContextProvider>
              <ToastContainer autoClose={3000} limit={3} />
              <App />
            </FollowContextProvider>
          </LikeContextProvider>
        </PostsContextProvider>
      </ProfileContextProvider>
    </UserContextProvider>
  </StrictMode>
);
