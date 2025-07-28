import React from 'react';
import Modal from 'react-modal';
import Comment from './Comment';
import Caption from './Caption';
import { Link } from 'react-router-dom';

Modal.setAppElement('#root');

interface PostUser {
  username: string;
  id: number;
}

interface PostComment {
  id: number;
  user: PostUser;
  content: string;
}

interface PostLike {
  id: number;
  // Add other like properties as needed
}

interface PostCommentSectionProps {
  id: number;
  user: PostUser;
  comments: PostComment[];
  createdAt: string;
  isSinglePost: boolean;
  likes: PostLike[];
  caption: string;
}

const PostCommentSection: React.FC<PostCommentSectionProps> = ({
  id: postId,
  user: { username, id: userId },
  comments,
  createdAt,
  isSinglePost,
  likes,
  caption,
}) => {
  function timeSince(timeStamp: string): string {
    const timeStampDate = new Date(timeStamp);
    const now = new Date();

    const secondsPast = (now.getTime() - timeStampDate.getTime()) / 1000;
    if (secondsPast < 60) {
      return `${parseInt(String(secondsPast))}s`;
    }
    if (secondsPast < 3600) {
      return `${parseInt(String(secondsPast / 60))}m`;
    }
    if (secondsPast <= 86400) {
      return `${parseInt(String(secondsPast / 3600))}h`;
    }
    if (secondsPast > 86400) {
      const day = timeStampDate.getDate();
      const monthMatch = timeStampDate.toDateString().match(/ [a-zA-Z]*/);
      const month = monthMatch ? monthMatch[0].replace(' ', '') : '';
      const year =
        timeStampDate.getFullYear() === now.getFullYear()
          ? ''
          : ` ${timeStampDate.getFullYear()}`;
      return `${day} ${month}${year}`;
    }
    return '';
  }

  return (
    <div className='px-4 pb-4'>
      <div className='font-semibold text-sm border-none p-0 bg-transparent'>
        {likes.length} likes
      </div>
      <Caption userId={userId} username={username} caption={caption} />

      {isSinglePost ? (
        comments.map(({ id, user: { id: userId, username }, content }) => {
          return (
            <Comment
              key={`post-comment-${id}`}
              id={id}
              userId={userId}
              username={username}
              postId={postId}
              content={content}
            />
          );
        })
      ) : comments.length > 2 ? (
        <div className='pt-1.5 sm:p-0 text-blue-500'>
          <Link
            to={`/post/${postId}`}
          >{`View all ${comments.length} comments`}</Link>
        </div>
      ) : null}

      {isSinglePost
        ? null
        : comments.map(({ id, user: { id: userId, username }, content }) => {
            return (
              <Comment
                key={`post-comment-${id}`}
                id={id}
                userId={userId}
                postId={postId}
                username={username}
                content={content}
              />
            );
          })}
      <div className='pt-1.5 text-xs text-gray-500'>{`${timeSince(createdAt)}`}</div>
    </div>
  );
};

export default PostCommentSection;
