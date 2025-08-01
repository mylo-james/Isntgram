import React, { useState, ChangeEvent } from 'react';
import ExploreGrid from './ExploreGrid';
import SearchGrid from './SearchGrid';
import { useApi } from '../../utils/apiComposable';
import type { SearchResponse } from '../../types/api';

interface SearchResult {
  id: number;
  fullName: string;
  profileImageUrl?: string;
}

const Explore: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [queryRes, setQueryRes] = useState<SearchResult[]>([]);
  const { search, isLoading, error, clearError } = useApi();

  const handleSubmit = async (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    if (e.target.value === '') {
      setQuery(e.target.value);
      setQueryRes([]);
      return;
    }

    setQuery(e.target.value);
    clearError();

    try {
      const response = await search(e.target.value);

      if (response.error) {
        console.error('Search failed:', response.error);
        return;
      }

      if (response.data?.results) {
        // The API middleware converts snake_case to camelCase
        // So the user data already has the correct structure
        const results =
          response.data.results.users?.map((user) => ({
            id: user.id,
            fullName: user.fullName,
            profileImageUrl: user.profileImageUrl,
          })) || [];

        setQueryRes(results);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  return (
    <div className='mt-[54px] pt-2.5'>
      {error && (
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4 mx-auto w-[95vw] max-w-[614px]'>
          {error}
        </div>
      )}

      <div className='mx-auto mb-2.5 w-[95vw] max-w-[614px] max-[614px]:flex max-[614px]:justify-center'>
        <input
          name='search'
          placeholder='Search'
          onChange={handleSubmit}
          className='px-2 py-1 border border-gray-300 rounded-sm w-[200px] focus:border-gray-400 focus:outline-none transition-colors'
          disabled={isLoading}
        />
      </div>

      {queryRes.length === 0 && query === '' ? (
        <ExploreGrid />
      ) : (
        <>
          <div className='mx-auto mb-2.5 w-[95vw] max-w-[614px]'>
            <h1 className='text-lg font-semibold text-gray-800'>
              {isLoading
                ? 'Searching...'
                : queryRes.length === 0
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
