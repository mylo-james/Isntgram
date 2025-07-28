import React, { CSSProperties } from 'react';

interface LoadingPageProps {
  positioner?: CSSProperties;
}

const LoadingPage: React.FC<LoadingPageProps> = ({ positioner }) => {
  return (
    <div style={positioner} className=''>
      <div className='absolute bottom-full left-1/2 -translate-x-1/2 -z-10 w-80 h-80'>
        <div className='absolute h-screen w-60 left-1/2 -translate-x-1/2 animate-rotate-0'>
          <div className='h-60 w-60 opacity-50 rounded-full bg-red-500 animate-y-translate'></div>
        </div>
        <div className='absolute h-screen w-60 left-1/2 -translate-x-1/2 animate-rotate-45'>
          <div className='h-60 w-60 opacity-50 rounded-full bg-yellow-500 animate-y-translate'></div>
        </div>
        <div className='absolute h-screen w-60 left-1/2 -translate-x-1/2 animate-rotate-90'>
          <div className='h-60 w-60 opacity-50 rounded-full bg-green-500 animate-y-translate'></div>
        </div>
        <div className='absolute h-screen w-60 left-1/2 -translate-x-1/2 animate-rotate-135'>
          <div className='h-60 w-60 opacity-50 rounded-full bg-blue-500 animate-y-translate'></div>
        </div>
        <div className='absolute h-screen w-60 left-1/2 -translate-x-1/2 animate-rotate-0'>
          <div className='h-60 w-60 opacity-50 rounded-full bg-red-500 animate-y-translate-rev'></div>
        </div>
        <div className='absolute h-screen w-60 left-1/2 -translate-x-1/2 animate-rotate-45'>
          <div className='h-60 w-60 opacity-50 rounded-full bg-yellow-500 animate-y-translate-rev'></div>
        </div>
        <div className='absolute h-screen w-60 left-1/2 -translate-x-1/2 animate-rotate-90'>
          <div className='h-60 w-60 opacity-50 rounded-full bg-green-500 animate-y-translate-rev'></div>
        </div>
        <div className='absolute h-screen w-60 left-1/2 -translate-x-1/2 animate-rotate-135'>
          <div className='h-60 w-60 opacity-50 rounded-full bg-blue-500 animate-y-translate-rev'></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;
