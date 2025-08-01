import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useUser, useProfile } from '../../hooks/useContexts';
import Nav from '../Nav';
import { toast } from 'react-toastify';
import ProfilePicModal from './ProfilePicModal';
import { useApi } from '../../utils/apiComposable';
import { User } from '../../types';
import type { UpdateUserRequest } from '../../types/api';

const EditProfile: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [isEditProfilePicOpen, setIsEditProfilePicOpen] =
    useState<boolean>(false);

  const { currentUser, setCurrentUser } = useUser();
  const { profileData } = useProfile();
  const navigate = useNavigate();
  const { updateUser, isLoading, error, clearError } = useApi();

  const closeEditPicModal = () => {
    setIsEditProfilePicOpen(false);
  };

  const changeProfilePic = () => {
    setIsEditProfilePicOpen(true);
  };

  useEffect(() => {
    if (!profileData) {
      return;
    }
    setUsername(profileData.username);
    setEmail(profileData.email ?? '');
    setFullName(profileData.fullName ?? '');
    setBio(profileData.bio ?? '');
  }, [profileData]);

  if (!currentUser?.id) {
    return null;
  }

  if (!profileData) {
    return <Navigate to={`/profile/${currentUser.username}`} replace />;
  }

  const updateState = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    switch (e.target.getAttribute('name')) {
      case 'username':
        setUsername(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'full_name':
        setFullName(value);
        break;
      case 'bio':
        setBio(value);
        break;
      // case('birthday'):
      //     setBirthday(value)
      //     break
      default:
        return;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();

    const updateRequest: UpdateUserRequest = {
      username,
      email,
      fullName: fullName,
      bio,
    };

    try {
      const response = await updateUser(updateRequest);

      if (response.error) {
        toast.error(response.error, {
          autoClose: 3000,
          closeOnClick: true,
        });
        return;
      }

      if (response.data?.user) {
        setCurrentUser(response.data.user);
        toast.success('Profile updated!', {
          autoClose: 3000,
          closeOnClick: true,
        });
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update profile';
      toast.error(errorMessage, {
        autoClose: 3000,
        closeOnClick: true,
      });
    }
  };

  const goBack = () => {
    navigate(`/profile/${currentUser?.username}`);
  };

  return (
    <>
      <Nav />
      <div className='flex flex-col items-center justify-center w-full p-5 mt-[54px] mb-[54px] bg-white sm:mt-[74px] sm:mx-auto sm:border sm:border-gray-300 sm:w-[500px] sm:rounded-sm'>
        {error && (
          <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4 w-full'>
            {error}
          </div>
        )}

        <div className='flex w-full'>
          <img
            onClick={changeProfilePic}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                changeProfilePic();
              }
            }}
            role='button'
            tabIndex={0}
            className='w-[45px] h-auto rounded-full cursor-pointer object-cover'
            src={currentUser?.profileImageUrl}
            alt='profile-pic'
          />
          <div className='flex ml-5 flex-col justify-around'>
            <div className='text-xl'>{username}</div>
            <div
              onClick={changeProfilePic}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  changeProfilePic();
                }
              }}
              role='button'
              tabIndex={0}
              className='text-sm font-bold text-blue-500 cursor-pointer hover:text-blue-600 transition-colors'
            >
              Change Profile Photo
            </div>
          </div>
        </div>
        <form
          onSubmit={handleSubmit}
          className='pt-2.5 w-full flex flex-col items-center justify-around'
        >
          <label
            htmlFor='full_name'
            className='font-bold w-full text-gray-800 mb-1'
          >
            Name
          </label>
          <input
            id='full_name'
            name='full_name'
            onChange={updateState}
            value={fullName}
            className='px-2 h-8 w-full border border-gray-300 rounded-sm mb-5 focus:border-gray-400 focus:outline-none transition-colors'
            disabled={isLoading}
          />
          <p className='text-xs text-gray-500 -mt-2.5 mb-4 w-full'>
            Help people discover your account by using the name you're known by:
            either your full name, nickname, or business name.
          </p>
          <label
            htmlFor='username'
            className='font-bold w-full text-gray-800 mb-1'
          >
            Username
          </label>
          <input
            name='username'
            id='username'
            onChange={updateState}
            value={username}
            className='px-2 h-8 w-full border border-gray-300 rounded-sm mb-5 focus:border-gray-400 focus:outline-none transition-colors'
            disabled={isLoading}
          />
          <label htmlFor='bio' className='font-bold w-full text-gray-800 mb-1'>
            Bio
          </label>
          <textarea
            id='bio'
            name='bio'
            onChange={updateState}
            value={bio ? bio : ''}
            className='resize-none py-1.5 px-2.5 min-h-[77px] w-full border border-gray-300 rounded mb-5 focus:border-gray-400 focus:outline-none transition-colors'
            disabled={isLoading}
          />

          <label
            htmlFor='email'
            className='font-bold w-full text-gray-800 mb-1'
          >
            Email
          </label>
          <input
            value={email}
            id='email'
            name='email'
            onChange={updateState}
            className='px-2 h-8 w-full border border-gray-300 rounded-sm mb-5 focus:border-gray-400 focus:outline-none transition-colors'
            disabled={isLoading}
          />
          <button
            type='submit'
            className='bg-blue-500 font-bold text-white border-none w-full rounded h-7.5 hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Submit'}
          </button>
        </form>
        <button
          className='text-blue-500 bg-white mt-5 border border-blue-500 w-full rounded h-7.5 hover:bg-blue-50 transition-colors'
          onClick={goBack}
          disabled={isLoading}
        >
          Go back
        </button>
        {isEditProfilePicOpen ? (
          <ProfilePicModal
            openModal={isEditProfilePicOpen}
            closeModal={closeEditPicModal}
          />
        ) : (
          ''
        )}
      </div>
    </>
  );
};

export default EditProfile;
