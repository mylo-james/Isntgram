import React, { useState } from 'react';
import DynamicModal from '../DynamicModal';
import Modal from 'react-modal';
import { useProfile } from '../../hooks/useContexts';

const ProfileMiddle: React.FC = () => {
  const { profileData } = useProfile();

  if (!profileData) {
    return null;
  }

  const numPosts = profileData.posts?.length || 0;

  const [isFollowersOpen, setIsFollowersOpen] = useState<boolean>(false);
  const [isFollowingOpen, setIsFollowingOpen] = useState<boolean>(false);

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

  return (
    <>
      <section className='flex justify-around items-center h-[61px] py-3 border-t border-b border-gray-300 sm:border-t-0 sm:h-0 sm:p-0'>
        <div className='flex flex-col items-center sm:hidden'>
          <div className='font-bold text-sm'>{numPosts}</div>
          <div className='text-sm text-gray-400'>posts</div>
        </div>
        <div
          className='flex flex-col items-center cursor-pointer sm:hidden'
          onClick={() => setIsFollowersOpen(true)}
        >
          <div className='font-bold text-sm'>
            {profileData.followers?.length || 0}
          </div>
          <div className='text-sm text-gray-400'>followers</div>
        </div>
        <div
          className='flex flex-col items-center cursor-pointer sm:hidden'
          onClick={() => setIsFollowingOpen(true)}
        >
          <div className='font-bold text-sm'>
            {profileData.following?.length || 0}
          </div>
          <div className='text-sm text-gray-400'>following</div>
        </div>
      </section>
      <Modal
        isOpen={isFollowersOpen}
        onRequestClose={closeFollowersModal}
        style={customStyles}
        contentLabel='Example Modal'
      >
        <DynamicModal closeModal={closeFollowersModal} title={'Followers'} />
      </Modal>
      <Modal
        isOpen={isFollowingOpen}
        onRequestClose={closeFollowingModal}
        style={customStyles}
        contentLabel='Example Modal'
      >
        <DynamicModal closeModal={closeFollowingModal} title={'Following'} />
      </Modal>
    </>
  );
};

export default ProfileMiddle;
