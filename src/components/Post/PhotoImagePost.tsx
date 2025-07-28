import React from 'react';
import { useNavigate } from 'react-router-dom';

interface PhotoImagePostProps {
  postImg: string;
  id: number;
}

const PhotoImagePost: React.FC<PhotoImagePostProps> = ({ postImg, id }) => {
  const navigate = useNavigate();

  return (
    <div
      className='w-full max-w-[600px] cursor-pointer'
      onClick={() => navigate(`/post/${id}`)}
    >
      <img className='w-full object-cover' src={postImg} alt='feed-post' />
    </div>
  );
};

export default PhotoImagePost;
