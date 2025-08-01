import React, { useContext, useState, useEffect, CSSProperties } from 'react';
import { ProfileContext } from '../../Contexts';
import { useUser } from '../../hooks/useContexts';
import { useApi } from '../../utils/apiComposable';
import { Post, Follow } from '../../types';
import type { FollowUserRequest } from '../../types/api';

interface FollowNotificationProps {
  style?: CSSProperties;
  user: {
    id: number;
    username: string;
    fullName: string;
    profileImageUrl: string;
  };
  post?: Post;
}

const FollowNotification: React.FC<FollowNotificationProps> = ({
  style,
  user,
}) => {
  const { currentUser } = useUser();
  const profileContext = useContext(ProfileContext);
  const [followingList, setFollowingList] = useState<number[]>([]);
  const { followUser, unfollowUser, isLoading, error, clearError } = useApi();

  // All hooks must be called before any conditional returns
  useEffect(() => {
    if (!profileContext?.profileData) {
      return;
    }
    const resFollowingList =
      profileContext.profileData.following?.map((followingEntry: Follow) => {
        return followingEntry.userFollowedId;
      }) ?? [];
    setFollowingList(resFollowingList);
  }, [profileContext?.profileData]);

  // Handle undefined context after all hooks are called
  if (!profileContext) {
    return null;
  }

  const { profileData, setProfileData } = profileContext;

  const handleFollowUser = async () => {
    if (!currentUser?.id) return;

    clearError();

    const followRequest: FollowUserRequest = {
      userId: currentUser.id,
      userFollowedId: user.id,
    };

    try {
      const response = await followUser(followRequest);

      if (response.error) {
        console.error('Failed to follow user:', response.error);
        return;
      }

      if (response.data?.follow) {
        const updatesList = [
          ...(profileData?.following ?? []),
          response.data.follow,
        ];
        if (profileData) {
          setProfileData({
            ...profileData,
            following: updatesList,
          });
        }
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleUnfollowUser = async () => {
    if (!currentUser?.id) return;

    clearError();

    const unfollowRequest: FollowUserRequest = {
      userId: currentUser.id,
      userFollowedId: user.id,
    };

    try {
      const response = await unfollowUser(unfollowRequest);

      if (response.error) {
        console.error('Failed to unfollow user:', response.error);
        return;
      }

      const filteredList = (profileData?.following ?? []).filter(
        (user: Follow) => user.userFollowedId !== user.id
      );
      if (profileData) {
        setProfileData({
          ...profileData,
          following: filteredList,
        });
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  if (!followingList) {
    return null;
  }

  return (
    <div
      className='flex justify-between items-center p-1.5 border-b border-gray-300 h-12 w-full object-cover animate-fadeIn'
      style={style}
    >
      {error && (
        <div className='absolute top-0 left-0 right-0 bg-red-50 border border-red-200 text-red-700 px-2 py-1 rounded text-xs'>
          {error}
        </div>
      )}
      <>
        <a href={`/profile/${user.id}`}>
          <img
            className='avatar w-8 h-8 rounded-full'
            src={user.profileImageUrl}
            alt={user.fullName}
          />
        </a>
        <p className='flex-1 px-3 text-sm'>
          <a
            href={`/profile/${user.id}`}
            className='font-semibold hover:underline'
          >
            {user.username}{' '}
          </a>
          started following you!
        </p>
        {followingList.includes(user.id) ? (
          <div>
            <button
              className='h-6 bg-transparent px-2 py-1 border border-gray-300 rounded-sm text-xs font-bold w-[85px] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              onClick={handleUnfollowUser}
              disabled={isLoading}
            >
              {isLoading ? 'Unfollowing...' : 'Following'}
            </button>
          </div>
        ) : (
          <div>
            <button
              className='h-6 bg-blue-500 text-white px-2 py-1 border-none rounded-sm text-xs font-bold w-[85px] outline-none hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              onClick={handleFollowUser}
              disabled={isLoading}
            >
              {isLoading ? 'Following...' : 'Follow'}
            </button>
          </div>
        )}
      </>
    </div>
  );
};

export default FollowNotification;
