import React from 'react';
import { Link } from 'react-router-dom';
import { RiHeartLine } from 'react-icons/ri';
import { FaRegComment } from 'react-icons/fa';
import { Post } from '../../types';

interface Layout2Props {
  componentPhotos: Post[];
}

const Layout2: React.FC<Layout2Props> = ({ componentPhotos }) => {
  return (
    <div
      className='grid grid-cols-[2fr_1fr] grid-rows-2 gap-[1vw] mb-[1vw] h-[calc((100vw/3)*2)] max-h-[409px] overflow-hidden [&_*]:text-white [&_*]:text-[2vw]'
      style={{ gridTemplateAreas: '"big img2" "big img3"' }}
    >
      {componentPhotos.map((photo, i) => {
        const gridClass =
          i === 0
            ? 'col-span-1 row-span-2'
            : i === 1
              ? 'col-start-2 row-start-1'
              : 'col-start-2 row-start-2';
        const fontSize = i === 0 ? '[&_*]:text-[3.5vw]' : '';
        return (
          <Link
            key={`img${i + 1}`}
            className={`${gridClass} relative group ${fontSize}`}
            to={`/post/${photo.id}`}
          >
            <div className='absolute w-full h-full flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 bg-black bg-opacity-30 overflow-hidden z-10 transition-opacity duration-300'>
              <div className='flex items-center'>
                <RiHeartLine />
                <div className='pl-[1vw]'>{photo.likeCount ?? 0}</div>
              </div>
              <div className='flex items-center'>
                <FaRegComment />
                <div className='pl-[1vw]'>{photo.commentCount ?? 0}</div>
              </div>
            </div>
            <img
              className='h-full w-full object-cover animate-fadeIn'
              draggable={false}
              src={photo.imageUrl}
              alt={photo.caption}
            />
          </Link>
        );
      })}
    </div>
  );
};

export default Layout2;
