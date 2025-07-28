import React from 'react';
import ProfilePost from './ProfilePost';
import { useProfile } from '../../hooks/useContexts';
import { Post } from '../../types';

interface ProfilePostsProps {
  posts?: Post[]; // Optional since we're using profileData.posts
}

const ProfilePosts: React.FC<ProfilePostsProps> = () => {
  const { profileData } = useProfile();

  if (!profileData || !profileData.posts) {
    return <div className='text-center py-8 text-gray-500'>No posts yet</div>;
  }
  return (
    <section className='grid grid-cols-3 gap-1 sm:gap-6 mt-5 pb-[53px] sm:pb-0 cursor-pointer auto-rows-fr'>
      {profileData.posts.map((post: any) => {
        return (
          <div key={`post-${post.id}`} className='aspect-square'>
            <ProfilePost post={post} />
          </div>
        );
      })}
    </section>
  );
};

export default ProfilePosts;
