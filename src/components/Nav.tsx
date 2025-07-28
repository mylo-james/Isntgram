import { NavLink, Link } from 'react-router-dom';
import navImage from '../Images/logo.svg';
import MobileNav from './MobileNav';
import {
  RiHome5Line,
  RiCamera2Line,
  RiHeartLine,
  RiSearchLine,
} from 'react-icons/ri';
import { useUser } from '../hooks/useContexts';

const Nav: React.FC = () => {
  const { currentUser } = useUser();

  return (
    <>
      {/* Main Navigation Container */}
      <div className='fixed top-0 w-full h-[54px] bg-white border-b border-gray-300 z-[100] flex justify-center'>
        <nav className='flex justify-between items-center w-full max-w-[935px] px-5'>
          {/* Logo */}
          <Link to='/'>
            <img className='mt-2 h-10' src={navImage} alt='logo' />
          </Link>

          {/* Navigation Links - Hidden on mobile */}
          <ul className='hidden sm:flex'>
            <li className='ml-[22px] pt-1.5'>
              <NavLink
                to='/'
                className={({ isActive }) =>
                  `text-gray-800 hover:text-blue-500 transition-colors ${isActive ? 'text-blue-500' : ''}`
                }
              >
                <RiHome5Line className='text-2xl' />
              </NavLink>
            </li>
            <li className='ml-[22px] pt-1.5'>
              <NavLink
                to='/explore'
                className={({ isActive }) =>
                  `text-gray-800 hover:text-blue-500 transition-colors ${isActive ? 'text-blue-500' : ''}`
                }
              >
                <RiSearchLine className='text-2xl' />
              </NavLink>
            </li>
            <li className='ml-[22px] pt-1.5'>
              <NavLink
                to='/upload'
                className={({ isActive }) =>
                  `text-gray-800 hover:text-blue-500 transition-colors ${isActive ? 'text-blue-500' : ''}`
                }
              >
                <RiCamera2Line className='text-2xl' />
              </NavLink>
            </li>
            <li className='ml-[22px] pt-1.5'>
              <NavLink
                to='/notifications'
                className={({ isActive }) =>
                  `text-gray-800 hover:text-blue-500 transition-colors ${isActive ? 'text-blue-500' : ''}`
                }
              >
                <RiHeartLine className='text-2xl' />
              </NavLink>
            </li>
            <li className='ml-[22px] pt-1.5'>
              <NavLink
                to={`/profile/${currentUser?.username || currentUser?.id}`}
                className={({ isActive }) =>
                  `block ${isActive ? 'ring-2 ring-blue-500 rounded-full' : ''}`
                }
              >
                {/* Profile Picture */}
                <div className='w-6 h-6 rounded-full overflow-hidden'>
                  <img
                    className='w-full h-full object-cover'
                    src={currentUser?.profileImageUrl || '/default-avatar.png'}
                    alt='avatar'
                  />
                </div>
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
      <MobileNav />
    </>
  );
};

export default Nav;
