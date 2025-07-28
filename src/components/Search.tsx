import React from 'react';
import { IoMdSearch } from 'react-icons/io';

const Search: React.FC = () => {
  return (
    <div className='relative'>
      <input
        className='border border-gray-300 outline-none px-2.5 py-0.5 h-7 rounded-sm text-sm placeholder-gray-500 focus:border-gray-400 transition-colors'
        placeholder='Search'
      />
      <IoMdSearch className='absolute right-2 top-1.5 text-gray-400 pointer-events-none' />
    </div>
  );
};

export default Search;
