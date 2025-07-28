import React, { useState, ChangeEvent, FormEvent } from 'react';
import { usePosts, useUser } from '../../hooks/useContexts';
import { apiCall } from '../../utils/apiMiddleware';

interface CommentInputFieldProps {
  id: number;
  isSinglePost: boolean;
}

const CommentInputField: React.FC<CommentInputFieldProps> = ({
  id: postId,
  isSinglePost,
}) => {
  const [content, setContent] = useState<string>('');
  const { currentUser } = useUser();
  const { setPosts } = usePosts();

  const updateCommentState = (e: ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (content === '' || !currentUser?.id) {
      return;
    }
    const data = { content, userId: currentUser.id, postId };
    const comment = await apiCall(`/api/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setPosts((posts) => {
      const currentPost = posts[postId];
      const commentList = [...(currentPost.comments || []), comment];
      return {
        ...posts,
        [postId]: { ...currentPost, comments: commentList },
      };
    });
    setContent('');
  };

  if (!isSinglePost) {
    return null;
  }

  return (
    <section className='px-4 h-[55px] max-h-20 border-t border-b border-gray-300 hidden sm:block'>
      <form className='h-full flex' onSubmit={handleSubmit}>
        <div className='flex items-center w-full'>
          <input
            className='resize-none max-h-20 w-full border-none outline-none'
            placeholder='Add a comment...'
            onChange={updateCommentState}
            value={content}
          />
        </div>
        <button
          type='submit'
          className='border-none p-0 text-blue-500 font-semibold bg-transparent outline-none cursor-pointer'
        >
          Post
        </button>
      </form>
    </section>
  );
};

export default CommentInputField;
