import React from 'react';
import { Link } from 'react-router-dom';

interface CaptionProps {
  userId: number;
  username: string;
  caption: string;
}

const Caption: React.FC<CaptionProps> = ({ username, caption }) => {
  return (
    <div className='sm:pt-1.5'>
      <Link to={`/profile/${username}`} className='font-bold pr-2'>
        {username}
      </Link>
      {caption}
    </div>
  );
};

export default Caption;
