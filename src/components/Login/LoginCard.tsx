import React from 'react';
import navImage from '../../Images/logo.svg';
import LoginForm from './LoginForm';
import GitIcons from './GitIcons';
import RegisterForm from './RegisterForm';

const LoginCard: React.FC = () => {
  return (
    <div className='relative min-h-screen w-full max-w-md bg-white border border-gray-200 shadow-xl animate-slide-in z-10'>
      <div className='flex flex-col items-center justify-center min-h-screen px-8 py-12'>
        <div className='mb-8'>
          <img
            className='w-48 h-auto object-contain'
            src={navImage}
            alt='Instagram logo'
          />
        </div>
        <div className='w-full max-w-sm'>
          {window.location.href.match(/login/) ? (
            <LoginForm />
          ) : (
            <RegisterForm />
          )}
        </div>
        <GitIcons />
      </div>
    </div>
  );
};

export default LoginCard;
