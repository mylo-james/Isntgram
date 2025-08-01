import React from 'react';
import { RiHeartLine } from 'react-icons/ri';
import { FaRegComment } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useLikes, usePosts, useUser } from '../../hooks/useContexts';
import { toast } from 'react-toastify';
import { useApi } from '../../utils/apiComposable';
import { Like } from '../../types';
import type { ToggleLikeRequest } from '../../types/api';

interface IconPostProps {
  id: number;
  isSinglePost: boolean;
}

const IconPost: React.FC<IconPostProps> = ({ id: postId, isSinglePost }) => {
  const { currentUser } = useUser();
  const { likes, setLikes } = useLikes();
  const { setPosts } = usePosts();
  const { toggleLike, isLoading, error, clearError } = useApi();

  const likePost = async () => {
    if (!currentUser?.id) return;

    clearError();

    try {
      const likeRequest: ToggleLikeRequest = {
        likeableId: postId,
        likeableType: 'post',
      };

      const response = await toggleLike(likeRequest);

      if (response.error) {
        console.error('Failed to like post:', response.error);
        return;
      }

      if (response.data?.liked) {
        // Note: This may need adjustment based on actual likes context structure
        if (likes && setLikes) {
          const key = `post-${postId}`;
          setLikes({
            ...likes,
            [key]: {
              id: Date.now(), // Temporary ID
              userId: currentUser.id,
              postId: postId,
            },
          });
        }

        setPosts((posts) => ({
          ...posts,
          [postId]: {
            ...posts[postId],
            likes: [
              ...(posts[postId]?.likes ?? []),
              {
                id: Date.now(),
                userId: currentUser.id,
                likeableId: postId,
                likeableType: 'post',
                createdAt: new Date().toISOString(),
              },
            ],
          },
        }));

        toast.info('Liked post!', { autoClose: 1500 });
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const unlikePost = async () => {
    const likeKey = `post-${postId}`;
    if (!likes?.[likeKey]) {
      return;
    }

    clearError();

    try {
      const likeRequest: ToggleLikeRequest = {
        likeableId: postId,
        likeableType: 'post',
      };

      const response = await toggleLike(likeRequest);

      if (response.error) {
        console.error('Failed to unlike post:', response.error);
        return;
      }

      if (!response.data?.liked) {
        if (likes && setLikes) {
          const newLikes = { ...likes };
          delete newLikes[likeKey];
          setLikes(newLikes);
        }

        setPosts((posts) => {
          const newPost = { ...posts[postId] };
          const filtered = (newPost.likes ?? []).filter(
            (ele: Like) => ele.likeableId !== postId
          );
          return {
            ...posts,
            [postId]: { ...posts[postId], likes: filtered },
          };
        });

        toast.info('Unliked post!', { autoClose: 1500 });
      }
    } catch (error) {
      console.error('Error unliking post:', error);
    }
  };

  return (
    <div className='h-10 flex justify-between p-1.5 px-2.5'>
      {error && (
        <div className='absolute top-0 left-0 right-0 bg-red-50 border border-red-200 text-red-700 px-2 py-1 rounded text-xs'>
          {error}
        </div>
      )}
      <div className='flex items-center'>
        <RiHeartLine
          size={24}
          onClick={likes?.[`post-${postId}`] ? unlikePost : likePost}
          className={
            likes?.[`post-${postId}`]
              ? 'text-red-500 cursor-pointer'
              : 'cursor-pointer text-gray-800'
          }
          style={{ opacity: isLoading ? 0.5 : 1 }}
        />
        {isSinglePost ? null : (
          <Link to={`/post/${postId}`} className='ml-2 p-0 bg-none border-none'>
            <FaRegComment size={24} />
          </Link>
        )}
      </div>
    </div>
  );
};

export default IconPost;
