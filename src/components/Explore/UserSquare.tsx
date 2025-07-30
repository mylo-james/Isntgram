import React from 'react';
import { Link } from 'react-router-dom';

interface UserSquareResult {
  id: number;
  fullName: string;
  profileImageUrl?: string;
}

interface UserSquareProps {
  result: UserSquareResult;
}

const UserSquare: React.FC<UserSquareProps> = ({ result }) => {
  return (
    <div className='group'>
      <Link
        key={`result-${result.id}`}
        className={`result-${result.id} relative block`}
        to={`/profile/${result.id}`}
      >
        <div className='absolute h-[calc(95vw/3)] max-h-[calc(614px/3)] w-[calc(95vw/3)] max-w-[calc(614px/3)] flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 bg-black bg-opacity-30 overflow-hidden z-10 transition-opacity duration-300'>
          <h3 className='text-white text-[2vw] text-center'>
            {result.fullName}
          </h3>
        </div>
        <img
          className={`result-${result.id} h-auto w-[calc(95vw/3)] max-w-[calc(614px/3)] object-cover p-[0.5vw] animate-fadeIn`}
          draggable={false}
          src={
            result.profileImageUrl ??
            'https://miro.medium.com/max/720/1*W35QUSvGpcLuxPo3SRTH4w.png'
          }
          alt={result.fullName}
        />
      </Link>
    </div>
  );
};

export default UserSquare;
