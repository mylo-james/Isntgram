import React from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

interface ModalPostProps {
  postId: number;
  closeModal: () => void;
}

const ModalPost: React.FC<ModalPostProps> = ({ postId, closeModal }) => {
  return (
    <div className='w-[80vw] max-w-[400px] h-full flex flex-col'>
      {window.location.href.includes('/post/') ? null : (
        <Link
          to={`/post/${postId}`}
          className='flex justify-center items-center h-12 text-base text-blue-500 font-bold bg-white border-none border-b border-gray-300 outline-none active:bg-gray-300'
        >
          Go To Post
        </Link>
      )}
      <CopyToClipboard text={window.location.href}>
        <button
          onClick={() => {
            toast.info('Copied to clipboard!');
            closeModal();
          }}
          className='flex justify-center items-center h-12 text-base text-blue-500 font-bold bg-white border-none border-b border-gray-300 outline-none active:bg-gray-300 cursor-pointer'
        >
          Copy Link
        </button>
      </CopyToClipboard>
      <button
        onClick={closeModal}
        className='flex justify-center items-center h-12 text-base text-gray-800 font-bold bg-white border-none border-b border-gray-300 outline-none active:bg-gray-300 cursor-pointer'
      >
        Cancel
      </button>
    </div>
  );
};

export default ModalPost;
