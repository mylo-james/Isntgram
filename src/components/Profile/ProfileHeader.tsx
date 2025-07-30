import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import DynamicModal from '../DynamicModal';
import { useUser, useProfile } from '../../hooks/useContexts';
import ProfilePicModal from './ProfilePicModal';
import { RiLogoutBoxRLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { apiCall } from '../../utils/apiMiddleware';
import { Follow } from '../../types';

Modal.setAppElement('#root');

interface ProfileHeaderProps {
  windowSize: number;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ windowSize }) => {
  const { currentUser } = useUser();

  // modals
  const [isFollowersOpen, setIsFollowersOpen] = useState<boolean>(false);
  const [isFollowingOpen, setIsFollowingOpen] = useState<boolean>(false);
  const [isEditProfilePicOpen, setIsEditProfilePicOpen] =
    useState<boolean>(false);

  const [currentUserFollowingList, setCurrentUserFollowingList] = useState<
    number[]
  >([]);

  const { profileData, setProfileData } = useProfile();

  // All hooks must be called before conditional returns
  useEffect(() => {
    if (!currentUser?.id || !profileData) return;

    (async () => {
      try {
        const { follows: currentUserFollowing } = (await apiCall(
          `/api/follow/${currentUser.id}/following`
        )) as { follows: Follow[] };

        const followingList: number[] = [];
        currentUserFollowing.forEach((follow: Follow) => {
          followingList.push(follow.userFollowedId);
        });
        setCurrentUserFollowingList(followingList);
      } catch {
        // console.error(e);
      }
    })();
  }, [profileData, currentUser?.id]);

  if (!profileData) {
    return null;
  }

  const {
    id: profileId,
    bio,
    profileImageUrl: profileImg,
    username,
    posts: userPosts,
  } = profileData;

  const numPosts = userPosts?.length ?? 0;
  const fullName = profileData.fullName ?? profileData.username;

  const closeEditPicModal = () => {
    setIsEditProfilePicOpen(false);
  };
  const closeFollowersModal = () => {
    setIsFollowersOpen(false);
  };

  const closeFollowingModal = () => {
    setIsFollowingOpen(false);
  };

  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      padding: '0',
      borderRadius: '5px',
      transform: 'translate(-50%, -50%)',
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      zIndex: '500',
    },
  };

  const changeProfImg = () => {
    setIsEditProfilePicOpen(true);
  };

  const logOut = async () => {
    await apiCall('/api/auth/logout');
    window.location.reload();
  };

  const followUser = async (e: React.MouseEvent) => {
    e.preventDefault();
    const body = { userId: currentUser?.id, userFollowedId: profileId };
    try {
      const response = (await apiCall('/api/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })) as Follow;

      const updatesList = [...(profileData.followers ?? []), response];
      setProfileData({
        ...profileData,
        followers: updatesList,
      });
    } catch {
      // console.error(e);
    }
  };

  const unfollowUser = async (e: React.MouseEvent) => {
    e.preventDefault();
    const body = { userId: currentUser?.id, userFollowedId: profileId };
    try {
      const response = (await apiCall('/api/follow', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })) as { userId: number };
      const { userId: deletedId } = response;

      const filteredList = (profileData.followers ?? []).filter(
        (user: Follow) => user.userId !== deletedId
      );
      setProfileData({
        ...profileData,
        followers: filteredList,
      });
    } catch {
      // console.error(e);
    }
  };

  if (!profileData) {
    return null;
  }

  return (
    <>
      {windowSize < 640 ? (
        <div className='flex h-[82px] mx-4 my-7'>
          <div
            className='h-[82px] w-[77px] mr-7 flex-shrink-0 rounded-full overflow-hidden border border-gray-300 cursor-pointer'
            onClick={currentUser?.id === profileId ? changeProfImg : undefined}
            onKeyDown={
              currentUser?.id === profileId
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      changeProfImg();
                    }
                  }
                : undefined
            }
            role={currentUser?.id === profileId ? 'button' : undefined}
            tabIndex={currentUser?.id === profileId ? 0 : undefined}
          >
            <img
              className='w-full h-full object-cover'
              src={profileImg}
              alt='avatar'
            />
            {isEditProfilePicOpen ? (
              <ProfilePicModal
                openModal={isEditProfilePicOpen}
                closeModal={closeEditPicModal}
              />
            ) : (
              ''
            )}
          </div>
          <section className='flex flex-col justify-between h-[82px] w-full max-[640px]:w-full'>
            <div className='flex justify-between items-center text-[28px]'>
              <div className='w-[50vw] text-[28px] overflow-hidden text-ellipsis whitespace-nowrap'>
                {username}
              </div>
              {currentUser?.id === profileId ? (
                <RiLogoutBoxRLine onClick={logOut} className='cursor-pointer' />
              ) : (
                ''
              )}
            </div>
            {currentUser?.id === profileId ? (
              <Link to='/accounts/edit'>
                <button className='h-7.5 bg-transparent px-2 py-1 border border-gray-300 rounded-sm text-sm font-bold hover:bg-gray-50 transition-colors'>
                  Edit Profile
                </button>
              </Link>
            ) : currentUserFollowingList.includes(profileId) ? (
              <button
                className='w-[85px] h-7.5 bg-transparent px-2 py-1 border border-gray-300 rounded-sm text-sm font-bold hover:bg-gray-50 transition-colors'
                onClick={unfollowUser}
              >
                Following{' '}
              </button>
            ) : (
              <button
                className='w-[85px] h-7.5 bg-blue-500 text-white px-2 py-1 border-none rounded-sm text-sm font-bold outline-none hover:bg-blue-600 transition-colors'
                onClick={followUser}
              >
                Follow
              </button>
            )}
          </section>
        </div>
      ) : (
        <div className='flex items-start justify-center sm:justify-start gap-6 sm:gap-12 px-4 sm:px-0'>
          <div
            className='flex-shrink-0 cursor-pointer rounded-full overflow-hidden border border-gray-300'
            onClick={currentUser?.id === profileId ? changeProfImg : undefined}
            onKeyDown={
              currentUser?.id === profileId
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      changeProfImg();
                    }
                  }
                : undefined
            }
            role={currentUser?.id === profileId ? 'button' : undefined}
            tabIndex={currentUser?.id === profileId ? 0 : undefined}
          >
            <img
              className='w-20 h-20 sm:w-32 sm:h-32 lg:w-40 lg:h-40 object-cover'
              src={profileImg}
              alt='avatar'
            />
          </div>
          {isEditProfilePicOpen ? (
            <ProfilePicModal
              openModal={isEditProfilePicOpen}
              closeModal={closeEditPicModal}
            />
          ) : (
            ''
          )}
          <div className='flex-1 min-w-0'>
            <div className='flex flex-col sm:flex-row sm:items-center gap-4 mb-4'>
              <div className='text-xl sm:text-2xl font-light'>{username}</div>
              {currentUser?.id === profileId ? (
                <Link to='/accounts/edit'>
                  <button className='px-4 py-1.5 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50'>
                    Edit Profile
                  </button>
                </Link>
              ) : currentUserFollowingList.includes(profileId) ? (
                <button
                  className='px-4 py-1.5 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50'
                  onClick={unfollowUser}
                >
                  Following
                </button>
              ) : (
                <button
                  className='px-4 py-1.5 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600'
                  onClick={followUser}
                >
                  Follow
                </button>
              )}
              {currentUser?.id === profileId ? (
                <RiLogoutBoxRLine
                  className='text-xl cursor-pointer hover:text-gray-600'
                  onClick={logOut}
                />
              ) : (
                ''
              )}
            </div>
            <div className='flex gap-6 mb-4'>
              <div className='text-sm'>
                <span className='font-semibold'>{numPosts}</span> posts
              </div>
              <div
                className='text-sm cursor-pointer hover:text-gray-600'
                onClick={() => setIsFollowersOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsFollowersOpen(true);
                  }
                }}
                role='button'
                tabIndex={0}
              >
                <span className='font-semibold'>
                  {profileData.followers?.length ?? 0}
                </span>{' '}
                followers
              </div>
              <div
                className='text-sm cursor-pointer hover:text-gray-600'
                onClick={() => setIsFollowingOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsFollowingOpen(true);
                  }
                }}
                role='button'
                tabIndex={0}
              >
                <span className='font-semibold'>
                  {profileData.following?.length ?? 0}
                </span>{' '}
                following
              </div>
            </div>
            <div className='font-semibold text-sm'>{fullName}</div>
            <div className='text-sm pt-1'>{bio}</div>
          </div>
        </div>
      )}
      {windowSize < 640 ? (
        <>
          <div className='px-4 pb-3 font-bold'>{fullName}</div>
          <div className='px-4 pb-5'>{bio}</div>
        </>
      ) : (
        ''
      )}
      <Modal
        isOpen={isFollowersOpen}
        onRequestClose={closeFollowersModal}
        style={customStyles}
        contentLabel='Example Modal'
      >
        <DynamicModal
          closeModal={closeFollowersModal}
          title={'Followers'}
          type={'post'}
        />
      </Modal>
      <Modal
        isOpen={isFollowingOpen}
        onRequestClose={closeFollowingModal}
        style={customStyles}
        contentLabel='Example Modal'
      >
        <DynamicModal
          closeModal={closeFollowingModal}
          title={'Following'}
          type={'post'}
        />
      </Modal>
    </>
  );
};

export default ProfileHeader;
