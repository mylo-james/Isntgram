import React from 'react';
import { Link } from 'react-router-dom';
import { RiHeartLine } from 'react-icons/ri';
import { useLikes, usePosts, useUser } from '../../hooks/useContexts';
import { toast } from 'react-toastify';
import { Like } from '../../types';
import { useApi } from '../../utils/apiComposable';
import type { ToggleLikeRequest } from '../../types/api';

interface CommentProps {
  username: string;
  content: string;
  postId: number;
  userId: number;
  id: number;
}

const Comment: React.FC<CommentProps> = ({ username, content, postId, id }) => {
  const { currentUser } = useUser();
  const { likes, setLikes } = useLikes();
  const { setPosts } = usePosts();
  const { toggleLike, isLoading, error, clearError } = useApi();

  const likeComment = async () => {
    if (!currentUser?.id) return;

    clearError();

    const likeRequest: ToggleLikeRequest = {
      likeableId: id,
      likeableType: 'comment',
    };

    try {
      const response = await toggleLike(likeRequest);

      if (response.error) {
        console.error('Failed to like comment:', response.error);
        return;
      }

      if (response.data?.liked) {
        setLikes({
          ...likes,
          [`comment-${id}`]: {
            id: Date.now(),
            userId: currentUser.id,
            likeableId: id,
            likeableType: 'comment',
            createdAt: new Date().toISOString(),
          },
        });
        toast.info('Liked comment!', { autoClose: 1500 });
      }
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const unlikeComment = async () => {
    const like = likes?.[`comment-${id}`];
    if (!like) return;

    clearError();

    const likeRequest: ToggleLikeRequest = {
      likeableId: id,
      likeableType: 'comment',
    };

    try {
      const response = await toggleLike(likeRequest);

      if (response.error) {
        console.error('Failed to unlike comment:', response.error);
        return;
      }

      if (!response.data?.liked) {
        const newLikes = { ...likes };
        delete newLikes[`comment-${id}`];
        setLikes(newLikes);

        setPosts((posts) => {
          const newPost = { ...posts[postId] };
          const filtered = (newPost.likes ?? []).filter(
            (ele: Like) => ele.likeableId !== id
          );
          return {
            ...posts,
            [postId]: { ...posts[postId], likes: filtered },
          };
        });

        toast.info('Unliked comment!', { autoClose: 1500 });
      }
    } catch (error) {
      console.error('Error unliking comment:', error);
    }
  };

  return (
    <div className='flex justify-between text-sm py-1.5 pr-4 leading-[18px] sm:pr-0'>
      {error && (
        <div className='absolute top-0 left-0 right-0 bg-red-50 border border-red-200 text-red-700 px-2 py-1 rounded text-xs'>
          {error}
        </div>
      )}
      <div>
        <Link className='font-bold' to={`/profile/${username}`}>
          {username}{' '}
        </Link>
        {content}
      </div>
      <div>
        {likes?.[`comment-${id}`] ? (
          <RiHeartLine
            onClick={unlikeComment}
            className='cursor-pointer text-red-500'
            style={{ opacity: isLoading ? 0.5 : 1 }}
          />
        ) : (
          <RiHeartLine
            onClick={likeComment}
            className='cursor-pointer text-gray-500'
            style={{ opacity: isLoading ? 0.5 : 1 }}
          />
        )}
      </div>
    </div>
  );
};

export default Comment;
