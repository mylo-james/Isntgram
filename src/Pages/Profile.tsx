import { useState, useEffect } from 'react';
import ProfileHeader from '../components/Profile/ProfileHeader';
import ProfileMiddle from '../components/Profile/ProfileMiddle';
import ProfilePosts from '../components/Profile/ProfilePosts';
import { useProfile, useUser } from '../hooks/useContexts';
import LoadingPage from '../components/Loading/LoadingPage';
import { useParams } from 'react-router-dom';
import { useApi } from '../utils/apiComposable';
import { User, Post, ProfileResponse } from '../types';

const Profile: React.FC = () => {
  const [windowSize, setWindowSize] = useState<number>(window.innerWidth);
  const { profileData, setProfileData } = useProfile();
  const { currentUser } = useUser();
  const { username } = useParams<{ username?: string }>();
  const { getProfile, error } = useApi();

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
        // Use the API composable to fetch profile data with proper middleware conversion
        const profileResponse = await getProfile(username);

        if (profileResponse.error) {
          console.error('Failed to fetch profile:', profileResponse.error);
          return;
        }

        if (!profileResponse.data) {
          console.error('No profile data found');
          return;
        }

        // The API middleware converts snake_case to camelCase
        // So we expect camelCase properties in the response
        const profileUser: User = {
          ...profileResponse.data.user,
          posts: profileResponse.data.posts ?? [],
          followers: profileResponse.data.followersList ?? [],
          following: profileResponse.data.followingList ?? [],
        };

        setProfileData(profileUser);
      } catch (error) {
        console.error(
          `Failed to load profile for user "${username}":`,
          error instanceof Error ? error.message : 'Unknown error'
        );
        // Could also set an error state here for user feedback
      }
    };

    loadProfile();
  }, [username, setProfileData, getProfile]);

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
        {error && (
          <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4'>
            {error}
          </div>
        )}
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
