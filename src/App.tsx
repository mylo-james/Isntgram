import { useCallback, useEffect, useState } from 'react';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { ProtectedRoute, AuthRoute } from './Routes';
import Home from './Pages/Home';
import Profile from './Pages/Profile';
import Explore from './components/Explore/Explore';
import Login from './components/Login/Login';
import Notifications from './components/Notifications/Notifications';
import EditProfile from './components/Profile/EditProfile';
import SinglePost from './Pages/SinglePost';
import Upload from './components/Upload/Upload';
import { useUser, useFollows, useLikes } from './hooks/useContexts';
import { apiCall } from './utils/apiMiddleware';
import { User } from './types';

function App() {
  const { currentUser, setCurrentUser } = useUser();
  const { setFollows } = useFollows();
  const { setLikes } = useLikes();
  const [loaded, setLoaded] = useState<boolean>(false);

  const getFollows = useCallback(async (): Promise<void> => {
    if (!currentUser?.id) {
      return;
    }

    try {
      const response = (await apiCall(
        `/api/follow/${currentUser.id}/following`
      )) as { follows: Array<{ userFollowedId: number }> };

      const followsSet = new Set<number>(
        response.follows.map(
          (follow: { userFollowedId: number }) => follow.userFollowedId
        )
      );
      setFollows(followsSet);
    } catch {
      // console.error('Error fetching follows:', error);
    }
  }, [currentUser?.id, setFollows]);

  const getLikes = useCallback(async (): Promise<void> => {
    if (!currentUser?.id) {
      return;
    }

    try {
      const likesResponse = (await apiCall(
        `/api/like/user/${currentUser.id}`
      )) as {
        likes: Array<{
          likeableType: string;
          likeableId: number;
          id: number;
          userId: number;
        }>;
      };

      const likesRecord: Record<
        string,
        {
          id: number;
          userId: number;
          postId?: number;
          commentId?: number;
        }
      > = {};
      likesResponse.likes.forEach(
        (like: {
          likeableType: string;
          likeableId: number;
          id: number;
          userId: number;
        }) => {
          const key = `${like.likeableType}_${like.likeableId}`;
          likesRecord[key] = {
            id: like.id,
            userId: like.userId,
            postId: like.likeableType === 'post' ? like.likeableId : undefined,
            commentId:
              like.likeableType === 'comment' ? like.likeableId : undefined,
          };
        }
      );
      setLikes(likesRecord);
    } catch {
      // console.error('Error fetching likes:', error);
    }
  }, [currentUser?.id, setLikes]);

  const authenticateUser = useCallback(async (): Promise<void> => {
    try {
      const user = await apiCall('/api/auth/');
      setCurrentUser(user as User);
    } catch {
      // Error means user is not authenticated, which is fine
    } finally {
      setLoaded(true);
    }
  }, [setCurrentUser]);

  useEffect(() => {
    authenticateUser();
  }, [authenticateUser]);

  useEffect(() => {
    if (currentUser?.id && loaded) {
      getFollows();
      getLikes();
    }
  }, [currentUser?.id, loaded, getFollows, getLikes]);

  if (!loaded) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <div className='App'>
        <div id='background' />
        <Routes>
          <Route
            path='/auth/*'
            element={
              <AuthRoute>
                <Routes>
                  <Route index element={<Login />} />
                  <Route path='login' element={<Login />} />
                  <Route path='signup' element={<Login />} />
                </Routes>
              </AuthRoute>
            }
          />

          <Route
            path='/*'
            element={
              <ProtectedRoute>
                <Routes>
                  <Route index element={<Home />} />
                  <Route path='profile/:username' element={<Profile />} />
                  <Route path='explore' element={<Explore />} />
                  <Route path='notifications' element={<Notifications />} />
                  <Route path='accounts/edit' element={<EditProfile />} />
                  <Route path='post/:postId' element={<SinglePost />} />
                  <Route path='upload' element={<Upload />} />
                </Routes>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
