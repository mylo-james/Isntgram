import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../hooks/useContexts';
import { ProfileContext } from '../Contexts/profileContext';
import { apiCall } from '../utils/apiMiddleware';
import { Follow } from '../types';

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
    (async () => {
      try {
        const { users } = (await apiCall(
          `/api/follow/${currentUser.id}/following`
        )) as { users: User[] };

        const userIds = users.map((user: User) => user.id);
        setCurrentUserFollows(userIds);
      } catch {
        // console.error(e);
      }
    })();
  }, [currentUser?.id]);

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
    (async () => {
      try {
        const { users } = (await apiCall(`/api/${endpoint}`)) as {
          users: User[];
        };

        setUserArray(users);
      } catch {
        // console.error(e);
      }
    })();
  }, [currentUserFollows, endpoint]);

  const followUser = async (
    e: React.MouseEvent<HTMLButtonElement>,
    userFollowedId: number
  ) => {
    e.preventDefault();
    if (!currentUser?.id) return;

    const body = { userId: currentUser.id, userFollowedId };
    try {
      const followResponse = (await apiCall('/api/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })) as Follow;

      setCurrentUserFollows([...currentUserFollows, userFollowedId]);

      if (profileData?.id === currentUser?.id) {
        const updatedFollowingList = [
          ...(profileData.following ?? []),
          followResponse,
        ];
        setProfileData({
          ...profileData,
          following: updatedFollowingList,
        });
      }
    } catch {
      // console.error(e);
    }
  };

  const unfollowUser = async (
    e: React.MouseEvent<HTMLButtonElement>,
    userFollowedId: number
  ) => {
    e.preventDefault();
    if (!currentUser?.id) return;

    const body = { userId: currentUser.id, userFollowedId };
    try {
      const { userFollowedId: id } = (await apiCall('/api/follow', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })) as { userFollowedId: number };

      const currentUserFollowsCopy = [...currentUserFollows];
      const index = currentUserFollowsCopy.indexOf(id);
      currentUserFollowsCopy.splice(index, 1);

      setCurrentUserFollows(currentUserFollowsCopy);

      if (profileData?.id === currentUser?.id) {
        const updatedFollowingList = (profileData.following ?? []).filter(
          (user: Follow) => user.userFollowedId !== id
        );
        setProfileData({
          ...profileData,
          following: updatedFollowingList,
        });
      }
    } catch {
      // console.error(e);
    }
  };
  if (!profileData) {
    return null;
  }
  return (
    <div className='flex flex-col bg-white h-[362px] max-h-[362px] w-[260px] sm:w-[400px] rounded-xl'>
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
                onClick={(e) => unfollowUser(e, id)}
                className='px-4 py-1.5 bg-white text-gray-800 font-bold border border-gray-300 rounded cursor-pointer text-sm hover:bg-gray-50 transition-colors outline-none'
              >
                Following
              </button>
            ) : (
              <button
                onClick={(e) => followUser(e, id)}
                className='px-4 py-1.5 bg-blue-500 text-white font-bold border-none rounded cursor-pointer text-sm hover:bg-blue-600 transition-colors'
              >
                Follow
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DynamicModal;
