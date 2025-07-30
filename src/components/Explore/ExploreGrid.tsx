import React, { useState, useEffect, useRef } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useUser } from '../../hooks/useContexts';
import { Post } from '../../types';
import { apiCall } from '../../utils/apiMiddleware';

import Layout1 from './Layout1';
import Layout2 from './Layout2';
import Layout3 from './Layout3';

const ExploreGrid: React.FC = () => {
  const { currentUser } = useUser();

  const [toRender, setToRender] = useState<React.ReactElement[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const totalPostsLoadedRef = useRef<number>(0);
  const componentCounterRef = useRef<number>(0);
  const fetchingRef = useRef<boolean>(false); // Immediate lock to prevent race conditions
  const initialLoadCompleteRef = useRef<boolean>(false); // Track if we've done initial bulk loading

  useEffect(() => {
    // Initial load when current user is available and no content loaded yet
    if (
      currentUser?.id &&
      toRender.length === 0 &&
      hasMore &&
      !loading &&
      !fetchingRef.current &&
      !initialLoadCompleteRef.current
    ) {
      initialBulkLoad();
    }
  }, [currentUser?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep loading until we have sufficient content for scrolling
  const initialBulkLoad = async () => {
    if (fetchingRef.current ?? initialLoadCompleteRef.current) return;

    fetchingRef.current = true;
    setLoading(true);

    const minComponentsNeeded = 4; // Load at least 4 layout components (12+ posts)
    let componentsLoaded = 0;
    let currentOffset = 0;
    let stillHasMore = true;

    try {
      while (componentsLoaded < minComponentsNeeded && stillHasMore) {
        const obj = (await apiCall(`/api/post/explore/${currentOffset}`)) as {
          posts: Post[];
        };
        const photoArray = obj.posts;

        if (photoArray.length === 0) {
          stillHasMore = false;
          break;
        }

        if (photoArray.length < 3) {
          stillHasMore = false;
        }

        const componentToRender = getTemplate(photoArray);

        setToRender((prevToRender) => [...prevToRender, ...componentToRender]);

        currentOffset += photoArray.length;
        componentsLoaded++;

        // Small delay to prevent overwhelming the server
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      totalPostsLoadedRef.current = currentOffset;
      setHasMore(stillHasMore);
      initialLoadCompleteRef.current = true;
    } catch {
      // console.error('Error during bulk load:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
  }

  function getTemplate(photoArray: Post[]) {
    const randomInt = getRandomInt(2, 4);
    const uniqueId = componentCounterRef.current++;

    if (
      toRender.length === 0 ||
      photoArray.length < 3 ||
      !toRender[toRender.length - 1]?.key?.includes('layout1key')
    ) {
      return [
        <Layout1 key={`layout1key-${uniqueId}`} componentPhotos={photoArray} />,
      ];
    }

    if (toRender.length === 1 || randomInt === 2) {
      return [
        <Layout2 key={`layout2key-${uniqueId}`} componentPhotos={photoArray} />,
      ];
    }

    return [
      <Layout3 key={`layout3key-${uniqueId}`} componentPhotos={photoArray} />,
    ];
  }

  const fetchMore = () => {
    if (
      (!currentUser?.id || loading) ??
      fetchingRef.current ??
      !initialLoadCompleteRef.current
    ) {
      return;
    }

    setLoading(true);
    fetchingRef.current = true;

    // Capture the current offset immediately and update the ref to prevent race conditions
    const currentOffset = totalPostsLoadedRef.current;
    totalPostsLoadedRef.current = currentOffset + 3; // Reserve 3 spots optimistically

    (async () => {
      try {
        const obj = (await apiCall(`/api/post/explore/${currentOffset}`)) as {
          posts: Post[];
        };
        const photoArray = obj.posts;

        if (photoArray.length === 0) {
          totalPostsLoadedRef.current = currentOffset; // Reset
          setHasMore(false);
          setLoading(false);
          fetchingRef.current = false;
          return;
        }

        if (photoArray.length < 3) {
          setHasMore(false);
        }

        // Adjust the counter to the actual number received
        totalPostsLoadedRef.current = currentOffset + photoArray.length;

        const componentToRender = getTemplate(photoArray);

        setToRender((prevToRender) => {
          const newToRender = [...prevToRender, ...componentToRender];
          return newToRender;
        });

        setLoading(false);
        fetchingRef.current = false;
      } catch {
        // console.error('Error fetching more posts:', error);
        setHasMore(false);
        setLoading(false);
        fetchingRef.current = false;
      }
    })();
  };

  if (!currentUser?.id) {
    return null;
  }

  return (
    <div key='gridWrapper' className='mx-auto mb-[10vh] w-[95vw] max-w-[614px]'>
      <InfiniteScroll
        dataLength={toRender.length}
        next={fetchMore}
        hasMore={hasMore}
        loader={<div className='text-center py-4'>Loading more posts...</div>}
        endMessage={
          <p className='text-center text-gray-500 py-4'>
            <b>Yay! You have seen it all</b>
          </p>
        }
      >
        {toRender}
      </InfiniteScroll>
    </div>
  );
};

export default ExploreGrid;
