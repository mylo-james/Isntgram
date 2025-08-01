import { useEffect, useState } from 'react';
import PostHeader from '../components/Post/PostHeader';
import PhotoImagePost from '../components/Post/PhotoImagePost';
import IconPost from '../components/Post/IconPost';
import PostCommentSection from '../components/Post/PostCommentSection';
import CommentInputField from '../components/Post/CommentInputField';
import { useParams } from 'react-router-dom';
import { usePosts } from '../hooks/useContexts';
import { Post, PostDetail } from '../types';
import { useApi } from '../utils/apiComposable';

const SinglePost: React.FC = () => {
  const { postId } = useParams<{ postId?: string }>();
  const { posts } = usePosts();
  const { getPost } = useApi();
  const [post, setPost] = useState<PostDetail | null>(null);

  useEffect(() => {
    if (!postId) return;

    const loadPost = async () => {
      try {
        const response = await getPost(parseInt(postId));
        if (response.data?.post) {
          setPost(response.data.post);
        }
      } catch (error) {
        console.error('Error loading post:', error);
      }
    };

    // First try to get from context
    const contextPost = posts[parseInt(postId)] as PostDetail | undefined;
    if (contextPost?.user) {
      setPost(contextPost);
    } else {
      // If not in context, fetch from API
      loadPost();
    }
  }, [postId, posts, getPost]);

  if (!post?.user) {
    return <div>Loading...</div>;
  }

  const postUser = {
    id: post.user.id,
    username: post.user.username,
  };

  return (
    <div className='flex flex-col items-center min-h-screen pt-14 sm:pt-20'>
      <div className='w-full max-w-[600px] bg-white sm:border sm:border-gray-300 sm:rounded-sm'>
        <PostHeader id={post.id} user={post.user} />
        <PhotoImagePost id={parseInt(postId!)} postImg={post.imageUrl} />
        <IconPost isSinglePost={true} {...post} />
        <PostCommentSection
          id={post.id}
          user={postUser}
          comments={post.comments ?? []}
          createdAt={post.createdAt}
          isSinglePost={true}
          likes={post.likes ?? []}
          caption={post.caption ?? ''}
        />
        <CommentInputField id={post.id} isSinglePost={true} />
      </div>
    </div>
  );
};

export default SinglePost;
