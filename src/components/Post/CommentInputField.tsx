import React, { useState, ChangeEvent, FormEvent } from 'react';
import { usePosts, useUser } from '../../hooks/useContexts';
import { useApi } from '../../utils/apiComposable';
import { Comment } from '../../types';
import type { CreateCommentRequest } from '../../types/api';

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
  const { createComment, isLoading, error, clearError } = useApi();

  const updateCommentState = (e: ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (content === '' || !currentUser?.id) {
      return;
    }

    clearError();

    const commentRequest: CreateCommentRequest = {
      content,
      postId: postId,
    };

    try {
      const response = await createComment(commentRequest);

      if (response.error) {
        console.error('Failed to create comment:', response.error);
        return;
      }

      if (response.data?.comment) {
        const comment = response.data.comment;
        setPosts((posts) => {
          const currentPost = posts[postId];
          const commentList = [...(currentPost.comments ?? []), comment];
          return {
            ...posts,
            [postId]: { ...currentPost, comments: commentList },
          };
        });
        setContent('');
      }
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  if (!isSinglePost) {
    return null;
  }

  return (
    <section className='px-4 h-[55px] max-h-20 border-t border-b border-gray-300 hidden sm:block'>
      {error && (
        <div className='bg-red-50 border border-red-200 text-red-700 px-2 py-1 rounded text-xs mb-2'>
          {error}
        </div>
      )}
      <form className='h-full flex' onSubmit={handleSubmit}>
        <div className='flex items-center w-full'>
          <input
            className='resize-none max-h-20 w-full border-none outline-none'
            placeholder='Add a comment...'
            onChange={updateCommentState}
            value={content}
            disabled={isLoading}
          />
        </div>
        <button
          type='submit'
          className='border-none p-0 text-blue-500 font-semibold bg-transparent outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
          disabled={isLoading || !content.trim()}
        >
          {isLoading ? 'Posting...' : 'Post'}
        </button>
      </form>
    </section>
  );
};

export default CommentInputField;
