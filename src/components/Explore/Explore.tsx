import React, { useState, ChangeEvent } from 'react';
import ExploreGrid from './ExploreGrid';
import SearchGrid from './SearchGrid';
import { apiCall } from '../../utils/apiMiddleware';

interface SearchResult {
  id: number;
  fullName: string;
  profileImageUrl?: string;
}

const Explore: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [queryRes, setQueryRes] = useState<SearchResult[]>([]);

  const handleSubmit = async (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    if (e.target.value === '') {
      setQuery(e.target.value);
      setQueryRes([]);
      return;
    }
    setQuery(e.target.value);
    const queryLower = encodeURIComponent(e.target.value.toLowerCase());

    try {
      const { results } = await apiCall(`/api/search?query=${queryLower}`);

      setQueryRes(results);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className='mt-[54px] pt-2.5'>
      <div className='mx-auto mb-2.5 w-[95vw] max-w-[614px] max-[614px]:flex max-[614px]:justify-center'>
        <input
          name='search'
          placeholder='Search'
          onChange={handleSubmit}
          className='px-2 py-1 border border-gray-300 rounded-sm w-[200px] focus:border-gray-400 focus:outline-none transition-colors'
        />
      </div>

      {queryRes.length === 0 && query === '' ? (
        <ExploreGrid />
      ) : (
        <>
          <div className='mx-auto mb-2.5 w-[95vw] max-w-[614px]'>
            <h1 className='text-lg font-semibold text-gray-800'>
              {queryRes.length === 0
                ? 'No Results Found'
                : `Search Results for: ${query}`}
            </h1>
          </div>

          <SearchGrid queryRes={queryRes} />
        </>
      )}
    </div>
  );
};

export default Explore;
