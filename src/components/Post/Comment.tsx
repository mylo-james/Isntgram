import React from 'react';
import { Link } from 'react-router-dom';
import { RiHeartLine } from 'react-icons/ri';
import { useLikes, usePosts, useUser } from '../../hooks/useContexts';
import { toast } from 'react-toastify';
import { Like } from '../../types';
import { apiCall } from '../../utils/apiMiddleware';

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

  const likeComment = async () => {
    if (!currentUser?.id) return;

    const body = {
      userId: currentUser.id,
      likeableType: 'comment',
      id,
    };
    try {
      const { like } = (await apiCall('/api/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })) as { like: Like };
      setLikes({ ...likes, [`comment-${id}`]: like });
      toast.info('Liked comment!', { autoClose: 1500 });
    } catch {
      // console.error(e);
    }
  };

  const unlikeComment = async () => {
    const like = likes?.[`comment-${id}`];
    if (!like) return;

    try {
      await apiCall('/api/like', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(like),
      });

      const newLikes = { ...likes };
      delete newLikes[`comment-${id}`];
      setLikes(newLikes);

      setPosts((posts) => {
        const newPost = { ...posts[postId] };
        const filtered = (newPost.likes ?? []).filter(
          (ele: Like) => ele.id !== like.id
        );
        return {
          ...posts,
          [postId]: { ...posts[postId], likes: filtered },
        };
      });

      toast.info('Unliked comment!', { autoClose: 1500 });
    } catch {
      // console.error(e);
    }
  };

  return (
    <div className='flex justify-between text-sm py-1.5 pr-4 leading-[18px] sm:pr-0'>
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
          />
        ) : (
          <RiHeartLine
            onClick={likeComment}
            className='cursor-pointer text-gray-500'
          />
        )}
      </div>
    </div>
  );
};

export default Comment;
