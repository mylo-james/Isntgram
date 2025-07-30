import React, { useContext, useEffect, useState, CSSProperties } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { ProfileContext } from '../../Contexts';
import { useUser } from '../../hooks/useContexts';
import CommentNotification from './CommentNotification';
import FollowNotification from './FollowNotification';
import LikeNotification from './LikeNotification';
import { apiCall } from '../../utils/apiMiddleware';
import { Post, User } from '../../types';

interface Notification {
  id: number;
  type: 'comment' | 'follow' | 'like';
  likeableType?: string;
  post?: Post;
  user?: User;
}

const Notifications: React.FC = () => {
  const { currentUser } = useUser();
  const profileContext = useContext(ProfileContext);

  if (!profileContext) {
    throw new Error(
      'Notifications must be used within a ProfileContextProvider'
    );
  }

  const { profileData, setProfileData } = profileContext;
  const [toRender, setToRender] = useState<React.ReactElement[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);

  useEffect(() => {
    if (!currentUser?.id) {
      return;
    }
    (async () => {
      try {
        const data = (await apiCall(
          `/api/profile/${currentUser.id}`
        )) as typeof profileData;

        setProfileData?.(data);
      } catch {
        // console.error(e);
      }
    })();
  }, [currentUser?.id, setProfileData]);

  useEffect(() => {
    // Initial load when profile data is available and no notifications loaded yet
    if (profileData && toRender.length === 0 && hasMore) {
      loadMore();
    }
  }, [profileData]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMore = () => {
    if (!currentUser?.id) {
      return;
    }
    (async () => {
      try {
        const response = (await apiCall(
          `/api/note/${currentUser.id}/scroll/${toRender.length}`
        )) as { notes: Notification[] };

        const { notes } = response;
        const nodeList = notes
          .filter(
            (notification) =>
              notification.user?.fullName && notification.user.profileImageUrl
          )
          .map((notification, i) => {
            const style: CSSProperties = {
              animationDuration: `${1 + i * 0.25}s`,
            };

            // Create proper user object for the components (already filtered for these properties)
            if (!notification.user) return null;
            const notificationUser = notification.user;
            const user = {
              id: notificationUser.id,
              username: notificationUser.username ?? '',
              fullName: notificationUser.fullName ?? '',
              profileImageUrl: notificationUser.profileImageUrl ?? '',
            };

            switch (notification.type) {
              case 'comment':
                if (!notification.post) return null;
                return (
                  <CommentNotification
                    style={style}
                    post={{
                      id: notification.post.id,
                      imageUrl: notification.post.imageUrl,
                      caption: notification.post.caption,
                    }}
                    user={user}
                    key={`${notification.type}-${notification.id}`}
                  />
                );
              case 'follow':
                return (
                  <FollowNotification
                    style={style}
                    user={user}
                    key={`${notification.type}-${notification.id}`}
                  />
                );
              default:
                if (!notification.post) return null;
                return (
                  <LikeNotification
                    type={notification.likeableType}
                    style={style}
                    post={{
                      id: notification.post.id,
                      imageUrl: notification.post.imageUrl,
                      caption: notification.post.caption,
                    }}
                    user={user}
                    key={`${notification.type}}-${notification.id}`}
                  />
                );
            }
          })
          .filter((node): node is React.ReactElement => node !== null);

        setToRender([...toRender, ...nodeList]);

        if (notes.length < 20) {
          setHasMore(false);
        }
      } catch {
        // console.error(e);
      }
    })();
  };

  if (!profileData) {
    return null;
  }

  return (
    <div className='flex items-center flex-col mx-auto h-[calc(100%-54px)] min-h-[calc(100vh-54px)] w-full max-w-[614px] mt-[54px] pt-5 pb-[54px] object-cover border border-gray-300 [&_img]:h-full [&_img]:object-cover [&_.avatar]:rounded-full [&_a]:h-full [&_a]:font-bold [&_a]:text-blue-500 [&_p]:w-full [&_p]:px-2.5 [&_p]:text-xs [&_p]:text-left'>
      <h1 className='pb-1.5 text-xl font-semibold text-gray-800'>
        Notifications
      </h1>
      <InfiniteScroll
        dataLength={toRender.length}
        next={loadMore}
        hasMore={hasMore}
        loader={<div className='text-gray-500 py-4'>Loading...</div>}
      >
        {toRender}
      </InfiniteScroll>
    </div>
  );
};

export default Notifications;
