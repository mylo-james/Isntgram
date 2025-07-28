import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import Post from '../components/Post/Post';
import { useUser, useFollows, usePosts } from '../hooks/useContexts';
import NoFollows from '../components/NoFollows';
import Loading from '../components/Loading/Loading';
import { Post as PostType } from '../types';
import { apiCall } from '../utils/apiMiddleware';

const Home: React.FC = () => {
  const { currentUser } = useUser();
  const { follows } = useFollows();
  const { posts, setPosts, postOrder, setPostOrder } = usePosts();

  const [feedPosts, setFeedPosts] = useState<React.ReactNode[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // Initial load effect
  useEffect(() => {
    if (currentUser?.id && follows.size > 0 && !postOrder.size) {
      loadMore();
    }
  }, [currentUser?.id, follows.size]);

  const loadMore = (): void => {
    if (!currentUser?.id) {
      return;
    }

    (async () => {
      try {
        const { posts: newPosts } = await apiCall(
          `/api/post/${currentUser.id}/scroll/${postOrder.size}`
        );

        const obj = newPosts.reduce(
          (
            accumulator: { order: number[]; posts: Record<number, PostType> },
            post: PostType
          ) => {
            accumulator.posts = { ...accumulator.posts, [post.id]: post };
            accumulator.order = [...accumulator.order, post.id];
            return accumulator;
          },
          { order: [], posts: {} }
        );

        setPosts((currentPosts: Record<number, PostType>) => ({
          ...currentPosts,
          ...obj.posts,
        }));
        setPostOrder((currentPostOrder: Set<number>) => {
          const newOrder = new Set(currentPostOrder);
          for (const postId of obj.order) {
            newOrder.add(postId);
          }
          return newOrder;
        });
      } catch (error) {
        console.error(error);
      }
    })();
  };

  useEffect(() => {
    if (!postOrder.size) {
      return;
    }

    const nodeList: React.ReactNode[] = [];

    postOrder.forEach((postId) => {
      if (posts[postId]) {
        nodeList.push(
          <Post key={`feedPost-${postId}`} post={posts[postId] as any} />
        );
      }
    });

    setFeedPosts(nodeList);

    if (postOrder.size < 3) {
      setHasMore(false);
    }
  }, [posts, postOrder]);

  if (!feedPosts || feedPosts.length === 0) {
    return <Loading />;
  }

  return (
    <>
      {follows.size > 0 ? (
        <div className='flex flex-col pt-14 sm:pt-20 items-center justify-start min-h-screen pb-14 min-[475px]:pb-0 bg-white sm:bg-gray-50'>
          <div className='w-full max-w-[600px] sm:px-0'>
            <InfiniteScroll
              dataLength={feedPosts.length}
              next={loadMore}
              hasMore={hasMore}
              loader={<Loading />}
            >
              {feedPosts}
            </InfiniteScroll>
          </div>
        </div>
      ) : (
        <NoFollows />
      )}
    </>
  );
};

export default Home;
