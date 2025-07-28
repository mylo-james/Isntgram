import React, { CSSProperties } from 'react';
import { useUser } from '../../hooks/useContexts';

interface CommentNotificationProps {
  style?: CSSProperties;
  user: {
    id: number;
    username: string;
    fullName: string;
    profileImageUrl: string;
  };
  post: {
    id: number;
    imageUrl: string;
    caption: string;
  };
}

const CommentNotification: React.FC<CommentNotificationProps> = ({
  style,
  user,
  post,
}) => {
  const { currentUser } = useUser();

  return (
    <div
      className='flex justify-between items-center p-1.5 border-b border-gray-300 h-12 w-full object-cover animate-fadeIn'
      style={style}
    >
      <>
        <a href={`/profile/${user.id}`}>
          <img
            className='avatar w-8 h-8 rounded-full'
            src={user.profileImageUrl}
            alt={user.fullName}
          />
        </a>
        <p className='flex-1 px-3 text-sm'>
          <a
            href={`/profile/${user.id}`}
            className='font-semibold hover:underline'
          >
            {user.username === currentUser?.username
              ? 'You'
              : user.username}{' '}
          </a>
          commented on your
          <a
            href={`/post/${post.id}`}
            className='font-semibold hover:underline'
          >
            {' '}
            post
          </a>
        </p>
        <a href={`/post/${post.id}`}>
          <img
            src={post.imageUrl}
            alt={post.caption}
            className='w-10 h-10 object-cover'
          />
        </a>
      </>
    </div>
  );
};

export default CommentNotification;
