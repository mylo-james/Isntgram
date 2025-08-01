import React from 'react';
import { Post as PostType, Comment, Like } from '../../types';
import PostHeader from './PostHeader';
import PhotoImagePost from './PhotoImagePost';
import IconPost from './IconPost';
import PostCommentSection from './PostCommentSection';
import CommentInputField from './CommentInputField';

interface PostProps {
  post: PostType & {
    comments?: Comment[];
    likes?: Like[];
    isSinglePost?: boolean;
  };
}

const Post: React.FC<PostProps> = ({ post, post: { id, imageUrl } }) => {
  const isSinglePost = post.isSinglePost ?? false;

  // Ensure user is defined and convert to PostUser format
  if (!post.user) {
    return null; // Don't render if no user
  }

  const postUser = {
    id: post.user.id,
    username: post.user.username,
  };

  return (
    <div className='flex flex-col'>
      <div className='w-full max-w-[600px] bg-white sm:border sm:border-gray-300 sm:rounded-sm sm:mb-15'>
        <PostHeader id={id} user={post.user} />
        <PhotoImagePost id={id} postImg={imageUrl} />
        <IconPost id={id} isSinglePost={isSinglePost} />
        <PostCommentSection
          id={id}
          user={postUser}
          comments={post.comments ?? []}
          createdAt={post.createdAt}
          isSinglePost={isSinglePost}
          likes={post.likes ?? []}
          caption={post.caption ?? ''}
        />
        <CommentInputField id={id} isSinglePost={isSinglePost} />
      </div>
    </div>
  );
};

export default Post;
