import React, { useContext, useState, useEffect, CSSProperties } from 'react';
import { ProfileContext } from '../../Contexts';
import { useUser } from '../../hooks/useContexts';
import { apiCall } from '../../utils/apiMiddleware';
import { Post, Follow } from '../../types';

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

  const followUser = async () => {
    if (!currentUser?.id) return;

    const body = { userId: currentUser.id, userFollowedId: user.id };
    try {
      const response = (await apiCall('/api/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })) as Follow;

      const updatesList = [...(profileData?.following ?? []), response];
      if (profileData) {
        setProfileData({
          ...profileData,
          following: updatesList,
        });
      }
    } catch {
      // console.error(e);
    }
  };

  const unfollowUser = async () => {
    if (!currentUser?.id) return;

    const body = { userId: currentUser.id, userFollowedId: user.id };
    try {
      const response = (await apiCall('/api/follow', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })) as { userFollowedId: number };

      const { userFollowedId: deletedId } = response;

      const filteredList = (profileData?.following ?? []).filter(
        (user: Follow) => user.userFollowedId !== deletedId
      );
      if (profileData) {
        setProfileData({
          ...profileData,
          following: filteredList,
        });
      }
    } catch {
      // console.error(e);
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
              className='h-6 bg-transparent px-2 py-1 border border-gray-300 rounded-sm text-xs font-bold w-[85px] hover:bg-gray-50 transition-colors'
              onClick={unfollowUser}
            >
              Following{' '}
            </button>
          </div>
        ) : (
          <div>
            <button
              className='h-6 bg-blue-500 text-white px-2 py-1 border-none rounded-sm text-xs font-bold w-[85px] outline-none hover:bg-blue-600 transition-colors'
              onClick={followUser}
            >
              Follow
            </button>
          </div>
        )}
      </>
    </div>
  );
};

export default FollowNotification;
