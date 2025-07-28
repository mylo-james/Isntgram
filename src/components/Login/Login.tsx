import React from 'react';
import LoginCard from './LoginCard';
import Splash from './Splash';

const Login: React.FC = () => {
  return (
    <div className='min-h-screen w-full flex items-center justify-end bg-gray-50 overflow-hidden'>
      <Splash />
      <LoginCard />
    </div>
  );
};

export default Login;
