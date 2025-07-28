import React, { useState, useRef } from 'react';
import ModalPost from './ModalPost';
import Modal from 'react-modal';
import { AiOutlineEllipsis } from 'react-icons/ai';
import { Link } from 'react-router-dom';

Modal.setAppElement('#root');

interface PostUser {
  profileImageUrl: string;
  username: string;
  id: number;
}

interface PostHeaderProps {
  id: number;
  user: PostUser;
}

const PostHeader: React.FC<PostHeaderProps> = ({
  id: postId,
  user: { profileImageUrl: userPic, username, id: userId },
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const outside = useRef<HTMLDivElement>(null);

  const closeModal = () => {
    setIsOpen(false);
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
      zIndex: '1000',
    },
  };

  return (
    <div ref={outside} className='flex items-center justify-between h-15 p-4'>
      <div className='flex items-center'>
        <Link to={`/profile/${username}`}>
          <img
            className='flex h-9 w-9 rounded-full overflow-hidden justify-center items-center'
            src={userPic}
            alt='profile'
          />
        </Link>
        <Link
          className='pl-2.5 text-sm font-semibold'
          to={`/profile/${username}`}
        >
          {username}
        </Link>
      </div>
      <button
        className='bg-none border-none cursor-pointer p-0'
        onClick={() => setIsOpen(true)}
      >
        <div>
          <AiOutlineEllipsis size='2em' />
        </div>
      </button>
      <Modal
        isOpen={isOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel='Post Options Modal'
      >
        <ModalPost closeModal={closeModal} postId={postId} />
      </Modal>
    </div>
  );
};

export default PostHeader;
