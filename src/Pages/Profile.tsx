import { useState, useEffect } from 'react';
import ProfileHeader from '../components/Profile/ProfileHeader';
import ProfileMiddle from '../components/Profile/ProfileMiddle';
import ProfilePosts from '../components/Profile/ProfilePosts';
import { useProfile, useUser } from '../hooks/useContexts';
import LoadingPage from '../components/Loading/LoadingPage';
import { useParams } from 'react-router-dom';
import { apiCall } from '../utils/apiMiddleware';
import { User, Post } from '../types';

const Profile: React.FC = () => {
  const [windowSize, setWindowSize] = useState<number>(window.innerWidth);
  const { profileData, setProfileData } = useProfile();
  const { currentUser } = useUser();
  const { username } = useParams<{ username?: string }>();

  useEffect(() => {
    const handleResize = () => {
      setWindowSize(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!username) {
      return;
    }

    const loadProfile = async () => {
      try {
        // First, look up the user by username to get their ID
        const userLookupResponse = (await apiCall(
          `/api/user/lookup/${username}`
        )) as { user: User };

        // Then fetch the profile data using the user ID
        const profileResponse = (await apiCall(
          `/api/profile/${userLookupResponse.user.id}`
        )) as {
          user: User;
          posts: Post[];
          followersList?: User[];
          followingList?: User[];
        };

        // The API returns { user: User, posts: Post[], ... }
        // But ProfileContext expects just the User object
        // Let's merge the user data with posts and other profile info
        const profileUser: User = {
          ...profileResponse.user,
          posts: profileResponse.posts ?? [],
          // Note: followers/following lists come as User[] from API
          // but User interface expects Follow[]. For now, we'll omit them
          // and let the components fetch follow relationships separately
        };

        setProfileData(profileUser);
      } catch {
        // console.error(
        //   `Failed to load profile for user "${username}":`,
        //   error instanceof Error ? error.message : 'Unknown error'
        // );
        // Could also set an error state here for user feedback
      }
    };

    loadProfile();
  }, [username, setProfileData]);

  if (!profileData || !currentUser?.id) {
    return <LoadingPage positioner={{ animationDuration: '1s' }} />;
  }

  // Check if the profile data matches the requested username
  if (profileData.username !== username) {
    return <LoadingPage positioner={{ animationDuration: '1s' }} />;
  }

  return (
    <div className='pt-14 w-full flex flex-col items-center min-h-screen sm:pt-20 sm:px-5'>
      <div className='w-full max-w-[975px] px-4 sm:px-0'>
        <div className='mb-6'>
          <ProfileHeader windowSize={windowSize} />
        </div>
        <div className='mb-6'>
          <ProfileMiddle />
        </div>
        <ProfilePosts posts={profileData.posts ?? []} />
      </div>
    </div>
  );
};

export default Profile;
