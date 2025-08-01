import React, { useState, useRef, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../hooks/useContexts';
import { RiImageAddLine } from 'react-icons/ri';
import { toast } from 'react-toastify';
import { useApi } from '../../utils/apiComposable';

const Upload: React.FC = () => {
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const [picture, setPicture] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const captionInput = useRef<HTMLTextAreaElement>(null);
  const { isLoading, error } = useApi();

  const onDrop = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      setPicture(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const goBack = (): void => {
    navigate('/');
  };

  const handleUpload = async (): Promise<void> => {
    if (!picture || !currentUser?.id) {
      toast.error("Please select a photo and ensure you're logged in");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', picture);

      const caption =
        encodeURIComponent(captionInput.current?.value ?? '') ?? 'null';

      // Note: This endpoint might need to be added to the composable
      // For now, we'll use a direct fetch with better error handling
      const response = await fetch(
        `/api/aws/post/${currentUser.id}/${caption}`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const post = (await response.json()) as { id: number };

      toast.info('Upload Success!');
      navigate(`/post/${post.id}`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload Error. Please try again!');
    }
  };

  return (
    <div className='flex flex-col items-center justify-center w-full p-5 mt-[54px] mb-[54px] bg-white text-center sm:mt-[74px] sm:mx-auto sm:border sm:border-gray-300 sm:w-[500px] sm:rounded-sm'>
      {error && (
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4 w-full'>
          {error}
        </div>
      )}

      <div className='flex justify-center items-center h-[80vw] max-h-[380px] w-[80vw] max-w-[380px] mb-5'>
        {!picture ? (
          <div className='flex justify-center content-center flex-col h-[80vw] max-h-[380px] w-[80vw] max-w-[380px]'>
            <RiImageAddLine className='h-[20%] w-[20%] mx-auto fill-gray-800' />
            <p className='text-gray-800'>Upload a Photo</p>
          </div>
        ) : (
          <img
            src={imagePreview}
            draggable={false}
            alt="User's Upload"
            className='h-[80vw] max-h-[380px] w-[80vw] max-w-[380px] object-cover overflow-hidden border border-gray-300 bg-gray-100 text-gray-800 animate-fadeIn'
          />
        )}
      </div>

      {picture ? (
        <>
          <label
            htmlFor='caption'
            className='font-bold w-full text-gray-800 mb-1 text-left pl-1 text-sm'
          >
            Add a Caption:
          </label>
          <textarea
            ref={captionInput}
            id='caption'
            placeholder='Tell us about your photo...'
            className='resize-none py-1.5 px-2.5 min-h-[77px] w-full border border-gray-300 rounded mb-5 focus:border-gray-400 focus:outline-none transition-colors'
            disabled={isLoading}
          />
          <button
            className='bg-blue-500 font-bold text-white border-none w-full rounded h-7.5 mb-1.5 hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            onClick={handleUpload}
            disabled={isLoading}
          >
            {isLoading ? 'Uploading...' : 'Upload'}
          </button>
        </>
      ) : null}

      {/* Custom file input with Tailwind */}
      <div className='w-full mt-5'>
        <input
          type='file'
          multiple={false}
          accept='.jpg, .gif, .png, .webp'
          onChange={onDrop}
          className='hidden'
          id='file-upload'
          disabled={isLoading}
        />
        <label
          htmlFor='file-upload'
          className='flex justify-center items-center w-full h-7.5 bg-blue-500 text-white font-bold rounded cursor-pointer hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        >
          Select Photo
        </label>
      </div>

      <button
        className='text-blue-500 bg-white mt-5 border border-blue-500 font-bold w-full rounded h-7.5 hover:bg-blue-50 transition-colors'
        onClick={goBack}
        disabled={isLoading}
      >
        Go back
      </button>
    </div>
  );
};

export default Upload;
