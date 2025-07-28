import React from 'react';

const Splash: React.FC = () => {
  return (
    <div className='absolute inset-0 z-0'>
      <div className='relative w-full h-full overflow-hidden'>
        <img
          className='w-full h-full object-cover animate-fade-in'
          src='https://picsum.photos/2000/3000?random=1'
          alt='Instagram splash background'
        />
        <div className='absolute inset-0 bg-gradient-to-r from-transparent to-white/20' />
      </div>
    </div>
  );
};

export default Splash;
