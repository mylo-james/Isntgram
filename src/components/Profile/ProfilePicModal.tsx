import React, { ChangeEvent } from 'react';
import Modal from 'react-modal';
import { useUser, useProfile } from '../../hooks/useContexts';
import { toast } from 'react-toastify';
import { useApi } from '../../utils/apiComposable';

Modal.setAppElement('#root');

interface ProfilePicModalProps {
  openModal: boolean;
  closeModal: () => void;
}

const ProfilePicModal: React.FC<ProfilePicModalProps> = ({
  openModal,
  closeModal,
}) => {
  const { profileData, setProfileData } = useProfile();
  const { currentUser, setCurrentUser } = useUser();
  const { resetUserImage, isLoading, error, clearError } = useApi();

  const changePhoto = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    let formData;

    if (file) {
      formData = new FormData();
      formData.append('file', file);
    }
    postImage(formData);
  };

  const postImage = async (formData: FormData | undefined) => {
    if (!formData || !currentUser?.id) {
      return;
    }

    clearError();

    try {
      // Note: This endpoint might need to be added to the composable
      // For now, we'll use a direct fetch with better error handling
      const response = await fetch(`/api/aws/${currentUser.id}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const responseData = (await response.json()) as { img: string };
      const { img } = responseData;

      if (profileData) {
        const newProfileData = { ...profileData, profileImageUrl: img };
        setProfileData(newProfileData);
      }
      toast.info('Photo upload Success!');
      closeModal();
      setCurrentUser(
        currentUser ? { ...currentUser, profileImageUrl: img } : null
      );
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo. Please try again.');
    }
  };

  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      padding: '0',
      borderRadius: '10px',
      transform: 'translate(-50%, -50%)',
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      zIndex: '500',
    },
  };

  const removeProfilePic = async () => {
    if (!currentUser?.id) return;

    clearError();

    try {
      const response = await resetUserImage(currentUser.id);

      if (response.error) {
        console.error('Failed to remove profile picture:', response.error);
        toast.error('Failed to remove profile picture. Please try again.');
        return;
      }

      toast.info('Image Removed!');
      setProfileData(
        profileData ? { ...profileData, profileImageUrl: undefined } : null
      );
      closeModal();
    } catch (error) {
      console.error('Error removing profile picture:', error);
      toast.error('Failed to remove profile picture. Please try again.');
    }
  };

  return (
    <Modal
      isOpen={openModal}
      onRequestClose={closeModal}
      style={customStyles}
      contentLabel='Edit Profile Picture'
    >
      <div className='flex flex-col justify-center items-center w-[260px] sm:w-[400px]'>
        {error && (
          <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4 w-full'>
            {error}
          </div>
        )}

        <div className='w-full flex justify-center items-center h-[78px] border-none text-lg font-bold cursor-default'>
          Change Profile Photo
        </div>
        <div className='w-full flex justify-center items-center h-12 border-t border-gray-300 text-[15px] cursor-pointer'>
          <label
            htmlFor='photoUploadButton'
            className='w-full h-full flex justify-center items-center cursor-pointer font-bold text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <input
              accept='image/*'
              type='file'
              onChange={changePhoto}
              id='photoUploadButton'
              className='hidden'
              disabled={isLoading}
            />
            {isLoading ? 'Uploading...' : 'Upload Photo'}
          </label>
        </div>
        <div
          onClick={removeProfilePic}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              removeProfilePic();
            }
          }}
          role='button'
          tabIndex={0}
          className='w-full flex justify-center items-center h-12 border-t border-gray-300 text-[15px] cursor-pointer font-bold text-red-500 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          style={{ opacity: isLoading ? 0.5 : 1 }}
        >
          {isLoading ? 'Removing...' : 'Remove Current Photo'}
        </div>
        <div
          className='w-full flex justify-center items-center h-12 border-t border-gray-300 text-[15px] cursor-pointer hover:bg-gray-50 transition-colors'
          onClick={() => closeModal()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              closeModal();
            }
          }}
          role='button'
          tabIndex={0}
        >
          Cancel
        </div>
      </div>
    </Modal>
  );
};

export default ProfilePicModal;
