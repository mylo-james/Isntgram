import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  RiHome5Line,
  RiCamera2Line,
  RiHeartLine,
  RiSearchLine,
} from 'react-icons/ri';
import { useUser } from '../hooks/useContexts';

const MobileNav: React.FC = () => {
  const { currentUser } = useUser();

  if (!currentUser) return null;
  return (
    <div className='fixed bottom-0 w-full h-[54px] bg-white border-t border-gray-300 z-[100] flex justify-center sm:hidden'>
      <nav className='flex justify-center items-center w-full px-5'>
        <ul className='w-full flex justify-around'>
          <li className='pt-1.5'>
            <NavLink
              to='/'
              className={({ isActive }) =>
                `text-gray-800 hover:text-blue-500 transition-colors ${isActive ? 'text-blue-500' : ''}`
              }
            >
              <RiHome5Line className='text-2xl' />
            </NavLink>
          </li>
          <li className='pt-1.5'>
            <NavLink
              to='/explore'
              className={({ isActive }) =>
                `text-gray-800 hover:text-blue-500 transition-colors ${isActive ? 'text-blue-500' : ''}`
              }
            >
              <RiSearchLine className='text-2xl' />
            </NavLink>
          </li>
          <li className='pt-1.5'>
            <NavLink
              to='/upload'
              className={({ isActive }) =>
                `text-gray-800 hover:text-blue-500 transition-colors ${isActive ? 'text-blue-500' : ''}`
              }
            >
              <RiCamera2Line className='text-2xl' />
            </NavLink>
          </li>
          <li className='pt-1.5'>
            <NavLink
              to='/notifications'
              className={({ isActive }) =>
                `text-gray-800 hover:text-blue-500 transition-colors ${isActive ? 'text-blue-500' : ''}`
              }
            >
              <RiHeartLine className='text-2xl' />
            </NavLink>
          </li>
          <li className='pt-1.5'>
            <NavLink
              to={`/profile/${currentUser.username}`}
              className={({ isActive }) =>
                `block ${isActive ? 'ring-2 ring-blue-500 rounded-full' : ''}`
              }
            >
              <div className='w-6 h-6 rounded-full overflow-hidden'>
                <img
                  className='w-full h-full object-cover'
                  src={currentUser.profileImageUrl}
                  alt='avatar'
                />
              </div>
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default MobileNav;
