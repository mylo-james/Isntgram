import React from 'react';
import { Link } from 'react-router-dom';
import { RiHeartLine } from 'react-icons/ri';
import { FaRegComment } from 'react-icons/fa';
import { Post } from '../../types';

interface Layout1Props {
  componentPhotos: Post[];
}

const Layout1: React.FC<Layout1Props> = ({ componentPhotos }) => {
  return (
    <div className='grid grid-cols-[1fr_0.97fr_1fr] gap-[1vw] my-[1vw] h-[calc(100vw/3)] max-h-[204px] overflow-hidden [&_*]:text-white [&_*]:text-[2vw]'>
      {componentPhotos.map((photo, i) => {
        const gridClass =
          i === 0 ? 'col-start-1' : i === 1 ? 'col-start-2' : 'col-start-3';
        return (
          <Link
            key={`img${i + 1}`}
            className={`${gridClass} relative group`}
            to={`/post/${photo.id}`}
          >
            <div className='absolute w-full h-full flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 bg-black bg-opacity-30 overflow-hidden z-10 transition-opacity duration-300'>
              <div className='text-white flex items-center'>
                <RiHeartLine />
                <div className='pl-[1vw]'>{photo.likeCount ?? 0}</div>
              </div>
              <div className='text-white flex items-center'>
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

export default Layout1;
