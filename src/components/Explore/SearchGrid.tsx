import React from 'react';
import UserSquare from './UserSquare';

interface SearchResult {
  id: number;
  fullName: string;
  profileImageUrl?: string;
}

interface SearchGridProps {
  queryRes: SearchResult[];
}

const SearchGrid: React.FC<SearchGridProps> = ({ queryRes }) => {
  return (
    <div
      key='gridWrapper'
      className='mx-auto mt-2.5 mb-[10vh] w-[95vw] max-w-[614px] flex flex-wrap'
    >
      {queryRes.map((result) => {
        return <UserSquare key={`userSquare-${result.id}`} result={result} />;
      })}
    </div>
  );
};

export default SearchGrid;
