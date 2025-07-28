import React, { CSSProperties } from 'react';

interface LoadingProps {
  positioner?: CSSProperties;
}

const Loading: React.FC<LoadingProps> = ({ positioner }) => {
  return (
    <div style={positioner}>
      <div className='fixed top-[calc(50%-20vh)] left-[calc(50%-12.5vh)] z-[12] w-[40vh] h-[40vh]'>
        <div className='absolute h-[40vh] w-[10vh] left-[calc(50%-12.5vh)] red-box'>
          <div className='h-[10vh] w-[10vh] opacity-50 rounded-full bg-red-500 for-color'></div>
        </div>
        <div className='absolute h-[40vh] w-[10vh] left-[calc(50%-12.5vh)] yellow-box'>
          <div className='h-[10vh] w-[10vh] opacity-50 rounded-full bg-yellow-500 for-color'></div>
        </div>
        <div className='absolute h-[40vh] w-[10vh] left-[calc(50%-12.5vh)] green-box'>
          <div className='h-[10vh] w-[10vh] opacity-50 rounded-full bg-green-500 for-color'></div>
        </div>
        <div className='absolute h-[40vh] w-[10vh] left-[calc(50%-12.5vh)] blue-box'>
          <div className='h-[10vh] w-[10vh] opacity-50 rounded-full bg-blue-500 for-color'></div>
        </div>
        <div className='absolute h-[40vh] w-[10vh] left-[calc(50%-12.5vh)] red2-box'>
          <div className='h-[10vh] w-[10vh] opacity-50 rounded-full bg-red-500 rev-color'></div>
        </div>
        <div className='absolute h-[40vh] w-[10vh] left-[calc(50%-12.5vh)] yellow2-box'>
          <div className='h-[10vh] w-[10vh] opacity-50 rounded-full bg-yellow-500 rev-color'></div>
        </div>
        <div className='absolute h-[40vh] w-[10vh] left-[calc(50%-12.5vh)] green2-box'>
          <div className='h-[10vh] w-[10vh] opacity-50 rounded-full bg-green-500 rev-color'></div>
        </div>
        <div className='absolute h-[40vh] w-[10vh] left-[calc(50%-12.5vh)] blue2-box'>
          <div className='h-[10vh] w-[10vh] opacity-50 rounded-full bg-blue-500 rev-color'></div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
