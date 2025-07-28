import React from 'react';
import { useNavigate } from 'react-router-dom';

const NoFollows: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className='mt-5 flex px-5 justify-center items-center text-center flex-col h-[300px] w-full'>
      <p>Looks like you're not following anyone.</p>
      <p>Explore to find more!</p>
      <button
        className='mt-5 bg-blue-500 font-bold text-white border-none w-4/5 rounded h-7.5 hover:bg-blue-600 transition-colors'
        onClick={() => navigate('/explore')}
      >
        Explore
      </button>
    </div>
  );
};

export default NoFollows;
