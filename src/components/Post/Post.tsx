import React from 'react';
import PostHeader from './PostHeader';
import PhotoImagePost from './PhotoImagePost';
import IconPost from './IconPost';
import PostCommentSection from './PostCommentSection';
import CommentInputField from './CommentInputField';

interface PostProps {
  post: {
    id: number;
    imageUrl: string;
    user: {
      id: number;
      username: string;
      profileImageUrl: string;
    };
    caption: string;
    createdAt: string;
    comments: any[];
    likes: any[];
    isSinglePost?: boolean;
    // Add other post properties as needed
  };
}

const Post: React.FC<PostProps> = ({ post, post: { id, imageUrl } }) => {
  const isSinglePost = post.isSinglePost || false;

  return (
    <div className='flex flex-col'>
      <div className='w-full max-w-[600px] bg-white sm:border sm:border-gray-300 sm:rounded-sm sm:mb-15'>
        <PostHeader {...post} />
        <PhotoImagePost id={id} postImg={imageUrl} />
        <IconPost id={id} isSinglePost={isSinglePost} />
        <PostCommentSection {...post} isSinglePost={isSinglePost} />
        <CommentInputField id={id} isSinglePost={isSinglePost} />
      </div>
    </div>
  );
};

export default Post;
