import React from 'react';
import JamesAvatar from '../../Images/profile.jpeg';
import AaronAvatar from '../../Images/aaron-profile.jpeg';
import MyloAvatar from '../../Images/mylo-profile.jpg';

const GitIcons: React.FC = () => {
  return (
    <div className='absolute flex justify-between items-center h-[10vh] w-[90%] bottom-[35px] left-[5%]'>
      <a
        href='https://github.com/jamesurobertson/'
        className='flex justify-center w-[30%]'
        target='_blank'
        rel='noopener noreferrer'
      >
        <img
          src={JamesAvatar}
          alt='James Robertson'
          className='w-[70%] h-full rounded-full object-cover hover:opacity-80 transition-opacity duration-200'
        />
      </a>
      <a
        href='https://github.com/ajpierskalla3/'
        className='flex justify-center w-[30%]'
        target='_blank'
        rel='noopener noreferrer'
      >
        <img
          src={AaronAvatar}
          alt='Aaron Pierskalla'
          className='w-[70%] h-full rounded-full object-cover hover:opacity-80 transition-opacity duration-200'
        />
      </a>
      <a
        href='https://github.com/mylo-james/'
        className='flex justify-center w-[30%]'
        target='_blank'
        rel='noopener noreferrer'
      >
        <img
          src={MyloAvatar}
          alt='Mylo James'
          className='w-[70%] h-full rounded-full object-cover hover:opacity-80 transition-opacity duration-200'
        />
      </a>
    </div>
  );
};

export default GitIcons;
