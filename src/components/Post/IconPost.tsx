import React from 'react';
import { RiHeartLine } from 'react-icons/ri';
import { FaRegComment } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useLikes, usePosts, useUser } from '../../hooks/useContexts';
import { toast } from 'react-toastify';
import { apiCall } from '../../utils/apiMiddleware';

interface IconPostProps {
  id: number;
  isSinglePost: boolean;
}

const IconPost: React.FC<IconPostProps> = ({ id: postId, isSinglePost }) => {
  const { currentUser } = useUser();
  const { likes, setLikes } = useLikes();
  const { setPosts } = usePosts();

  const likePost = async () => {
    if (!currentUser?.id) return;

    try {
      const body = {
        userId: currentUser.id,
        id: postId,
        likeableType: 'post',
      };
      const { like, likeList } = await apiCall('/api/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      // Note: This may need adjustment based on actual likes context structure
      if (likes && setLikes) {
        const key = `post-${postId}`;
        setLikes({
          ...likes,
          [key]: {
            id: like.id,
            userId: like.userId,
            postId: postId,
          },
        });
      }

      setPosts((posts) => ({
        ...posts,
        [postId]: { ...posts[postId], likes: likeList },
      }));

      toast.info('Liked post!', { autoClose: 1500 });
    } catch (e) {
      console.error(e);
    }
  };

  const unlikePost = async () => {
    const likeKey = `post-${postId}`;
    if (!likes?.[likeKey]) {
      return;
    }

    try {
      // This would need to be adjusted based on how like data is stored
      await apiCall('/api/like', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId }), // Simplified for now
      });

      if (likes && setLikes) {
        const newLikes = { ...likes };
        delete newLikes[likeKey];
        setLikes(newLikes);
      }

      setPosts((posts) => {
        const newPost = { ...posts[postId] };
        const filtered = (newPost.likes || []).filter(
          (ele: any) => ele.id !== postId
        );
        return {
          ...posts,
          [postId]: { ...posts[postId], likes: filtered },
        };
      });

      toast.info('Unliked post!', { autoClose: 1500 });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className='h-10 flex justify-between p-1.5 px-2.5'>
      <div className='flex items-center'>
        <RiHeartLine
          size={24}
          onClick={likes?.[`post-${postId}`] ? unlikePost : likePost}
          className={
            likes?.[`post-${postId}`]
              ? 'text-red-500 cursor-pointer'
              : 'cursor-pointer text-gray-800'
          }
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
