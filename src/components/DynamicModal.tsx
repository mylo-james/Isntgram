import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../hooks/useContexts';
import { ProfileContext } from '../Contexts/profileContext';
import { useApi } from '../utils/apiComposable';
import { Follow } from '../types';
import type { FollowUserRequest } from '../types/api';

interface User {
  id: number;
  username: string;
  fullName: string;
  profileImageUrl: string;
}

interface DynamicModalProps {
  title: string;
  closeModal: () => void;
  type?: 'post' | 'comment';
}

const DynamicModal: React.FC<DynamicModalProps> = (props) => {
  const { title, closeModal, type } = props;
  const [userArray, setUserArray] = useState<User[]>([]);
  const [currentUserFollows, setCurrentUserFollows] = useState<number[]>([]);
  const [endpoint, setEndpoint] = useState<string>('');

  const { currentUser } = useUser();
  const profileContext = useContext(ProfileContext);
  const {
    followUser,
    unfollowUser,
    getFollowing,
    isLoading,
    error,
    clearError,
  } = useApi();

  if (!profileContext) {
    throw new Error(
      'DynamicModal must be used within a ProfileContextProvider'
    );
  }

  const { profileData, setProfileData } = profileContext;
  const id = profileData?.id ?? 0;

  useEffect(() => {
    if (!currentUser?.id) {
      return;
    }

    const loadFollowing = async () => {
      try {
        const response = await getFollowing(currentUser.id);

        if (response.error) {
          console.error('Failed to load following:', response.error);
          return;
        }

        if (response.data?.follows) {
          const userIds = response.data.follows.map(
            (follow: Follow) => follow.userFollowedId
          );
          setCurrentUserFollows(userIds);
        }
      } catch (error) {
        console.error('Error loading following:', error);
      }
    };

    loadFollowing();
  }, [currentUser?.id, getFollowing]);

  useEffect(() => {
    let url;
    if (title === 'Likes' && type === 'post') {
      url = `post/${id}`;
    } else if (title === 'Likes' && type === 'comment') {
      url = `comment/${id}`;
    } else if (title === 'Followers') {
      url = `follow/${id}`;
    } else {
      url = `follow/${id}/following`;
    }
    setEndpoint(url);
  }, [id, title, type]);

  useEffect(() => {
    if (!endpoint) {
      return;
    }

    const loadUsers = async () => {
      try {
        // Note: This endpoint might need to be added to the composable
        // For now, we'll use a direct fetch with better error handling
        const response = await fetch(`/api/${endpoint}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch users: ${response.status}`);
        }

        const responseData = (await response.json()) as { users: User[] };
        setUserArray(responseData.users);
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };

    loadUsers();
  }, [currentUserFollows, endpoint]);

  const handleFollowUser = async (
    e: React.MouseEvent<HTMLButtonElement>,
    userFollowedId: number
  ) => {
    e.preventDefault();
    if (!currentUser?.id) return;

    clearError();

    const followRequest: FollowUserRequest = {
      userId: currentUser.id,
      userFollowedId: userFollowedId,
    };

    try {
      const response = await followUser(followRequest);

      if (response.error) {
        console.error('Failed to follow user:', response.error);
        return;
      }

      if (response.data?.follow) {
        setCurrentUserFollows([...currentUserFollows, userFollowedId]);

        if (profileData?.id === currentUser?.id) {
          const updatedFollowingList = [
            ...(profileData.following ?? []),
            response.data.follow,
          ];
          setProfileData({
            ...profileData,
            following: updatedFollowingList,
          });
        }
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleUnfollowUser = async (
    e: React.MouseEvent<HTMLButtonElement>,
    userFollowedId: number
  ) => {
    e.preventDefault();
    if (!currentUser?.id) return;

    clearError();

    const unfollowRequest: FollowUserRequest = {
      userId: currentUser.id,
      userFollowedId: userFollowedId,
    };

    try {
      const response = await unfollowUser(unfollowRequest);

      if (response.error) {
        console.error('Failed to unfollow user:', response.error);
        return;
      }

      const currentUserFollowsCopy = [...currentUserFollows];
      const index = currentUserFollowsCopy.indexOf(userFollowedId);
      if (index > -1) {
        currentUserFollowsCopy.splice(index, 1);
      }

      setCurrentUserFollows(currentUserFollowsCopy);

      if (profileData?.id === currentUser?.id) {
        const updatedFollowingList = (profileData.following ?? []).filter(
          (user: Follow) => user.userFollowedId !== userFollowedId
        );
        setProfileData({
          ...profileData,
          following: updatedFollowingList,
        });
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  if (!profileData) {
    return null;
  }

  return (
    <div className='flex flex-col bg-white h-[362px] max-h-[362px] w-[260px] sm:w-[400px] rounded-xl'>
      {error && (
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4'>
          {error}
        </div>
      )}

      <h1 className='px-8 pt-8 pb-4 border-b border-gray-300 m-0 text-gray-800 text-base font-bold text-center'>
        {title}
      </h1>
      {userArray.map((user) => {
        const { username, fullName, id, profileImageUrl: profileImg } = user;
        return (
          <div
            key={`userRow ${id}`}
            className='px-4 py-2 flex flex-row items-center justify-between'
          >
            <div className='flex flex-row items-center'>
              <Link onClick={() => closeModal()} to={`/profile/${id}`}>
                <img
                  className='h-8 w-8 rounded-full mr-3'
                  src={profileImg}
                  alt='user profile'
                />
              </Link>

              <div>
                <Link onClick={() => closeModal()} to={`/profile/${id}`}>
                  <div className='w-24 whitespace-nowrap overflow-hidden text-ellipsis text-sm font-bold text-gray-800'>
                    {username}
                  </div>
                </Link>
                <div className='w-24 whitespace-nowrap overflow-hidden text-ellipsis text-sm text-gray-500'>
                  {fullName}
                </div>
              </div>
            </div>
            {currentUser?.id === id ? (
              ''
            ) : currentUserFollows.includes(id) ? (
              <button
                onClick={(e) => handleUnfollowUser(e, id)}
                className='px-4 py-1.5 bg-white text-gray-800 font-bold border border-gray-300 rounded cursor-pointer text-sm hover:bg-gray-50 transition-colors outline-none disabled:opacity-50 disabled:cursor-not-allowed'
                disabled={isLoading}
              >
                {isLoading ? 'Unfollowing...' : 'Following'}
              </button>
            ) : (
              <button
                onClick={(e) => handleFollowUser(e, id)}
                className='px-4 py-1.5 bg-blue-500 text-white font-bold border-none rounded cursor-pointer text-sm hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                disabled={isLoading}
              >
                {isLoading ? 'Following...' : 'Follow'}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DynamicModal;
