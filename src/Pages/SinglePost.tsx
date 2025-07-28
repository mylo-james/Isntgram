import { useEffect, useState } from 'react';
import PostHeader from '../components/Post/PostHeader';
import PhotoImagePost from '../components/Post/PhotoImagePost';
import IconPost from '../components/Post/IconPost';
import PostCommentSection from '../components/Post/PostCommentSection';
import CommentInputField from '../components/Post/CommentInputField';
import { useParams } from 'react-router-dom';
import { usePosts } from '../hooks/useContexts';
import { Post } from '../types';
import { apiCall } from '../utils/apiMiddleware';

const SinglePost: React.FC = () => {
  const { posts, setPosts } = usePosts();
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const { postId } = useParams<{ postId?: string }>();

  useEffect(() => {
    if (!postId) return;

    (async () => {
      setIsLoaded(false);
      try {
        const response = await apiCall(`/api/post/${postId}`);

        const { post }: { post: Post } = response;
        setPosts((currentPosts) => ({ ...currentPosts, [post.id]: post }));
        setIsLoaded(true);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [postId, setPosts]);

  if (!isLoaded || !postId) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='text-gray-500'>Loading...</div>
      </div>
    );
  }

  const post = posts[parseInt(postId)];

  if (!post) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='text-gray-500'>Post not found</div>
      </div>
    );
  }

  return (
    <div className='w-full max-w-[600px] my-14 mx-auto bg-white border-t border-gray-300 sm:border sm:border-gray-300 sm:mt-20 sm:rounded-sm'>
      <PostHeader {...(post as any)} isSinglePost={true} />
      <PhotoImagePost id={parseInt(postId)} postImg={(post as any).imageUrl} />
      <IconPost isSinglePost={true} {...(post as any)} />
      <PostCommentSection {...(post as any)} isSinglePost={true} />
      <CommentInputField {...(post as any)} isSinglePost={true} />
    </div>
  );
};

export default SinglePost;
