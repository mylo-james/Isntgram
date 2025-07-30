import React from 'react';
import { Link } from 'react-router-dom';
import { FaRegComment } from 'react-icons/fa';
import { FaRegHeart } from 'react-icons/fa';
import { Post } from '../../types';

interface ProfilePostProps {
  post: Post;
}

const ProfilePost: React.FC<ProfilePostProps> = ({ post }) => {
  const { imageUrl, comments, likeCount, id } = post;

  return (
    <div className='w-full h-full relative group'>
      <Link to={`/post/${id}`}>
        <div className='absolute w-full h-full hidden group-hover:flex flex-col justify-center items-center bg-black bg-opacity-30 overflow-hidden'>
          <div className='flex items-center text-[3.5vw] lg:text-[35px] text-white text-center'>
            <FaRegHeart />
            <div className='pl-[1vw]'>{likeCount ?? 0}</div>
          </div>
          <div className='flex items-center text-[3.5vw] lg:text-[35px] text-white text-center'>
            <FaRegComment />
            <div className='pl-[1vw]'>{comments?.length ?? 0}</div>
          </div>
        </div>
        <img src={imageUrl} alt='post' className='w-full h-full object-cover' />
      </Link>
    </div>
  );
};

export default ProfilePost;
