import { useContext } from 'react';
// import DynamicModal from "../DynamicModal";
import Modal from 'react-modal';
import styled from 'styled-components';
import Comment from './Comment';
import Caption from './Caption';
import { Link } from 'react-router-dom';
import { PostContext } from '../../Contexts';

const CommentWrapper = styled.div`
    padding: 0px 16px 16px;

    .like-button,
    .user-name {
        font-weight: 600;
        font-size: 14px;
    }
    .like-button {
        border: none;
        padding-left: initial;
        background: none;
    }

    .post-date-created {
        padding-top: 5px;
        font-size: 11px;
        color: #8e8e8e;
    }

    .comments__view-all {
        padding: 5px 16px 0 0;

        color: #0095f6;

        @media screen and (min-width: 735px) {
            padding: 0;
        }
    }
`;
Modal.setAppElement('#root');

const PostCommentSection = ({
    id: postId,
    user: { username, id: userId },
    comments,
    created_at,
    likes,
    isSinglePost,
    caption,
}) => {
    console.log(comments);

    function timeSince(timeStamp) {
        timeStamp = new Date(timeStamp);
        const now = new Date();

        const secondsPast = (now.getTime() - timeStamp) / 1000;
        if (secondsPast < 60) {
            return parseInt(secondsPast) + 's';
        }
        if (secondsPast < 3600) {
            return parseInt(secondsPast / 60) + 'm';
        }
        if (secondsPast <= 86400) {
            return parseInt(secondsPast / 3600) + 'h';
        }
        if (secondsPast > 86400) {
            const day = timeStamp.getDate();
            const month = timeStamp
                .toDateString()
                .match(/ [a-zA-Z]*/)[0]
                .replace(' ', '');
            const year =
                timeStamp.getFullYear() === now.getFullYear()
                    ? ''
                    : ' ' + timeStamp.getFullYear();
            return day + ' ' + month + year;
        }
    }

    return (
        <CommentWrapper>
            <div className='like-button'>{likes.length} likes</div>
            <Caption userId={userId} caption={caption} />

            {isSinglePost ? (
                comments.map(
                    ({ id, user: { id: userId, username }, content }) => {
                        return (
                            <Comment
                                key={`post-comment-${id}`}
                                id={id}
                                userId={userId}
                                username={username}
                                // likesCommentList={likes_comment}
                                content={content}
                            ></Comment>
                        );
                    }
                )
            ) : comments.length > 2 ? (
                <div className='comments__view-all'>
                    <Link
                        to={`/post/${postId}`}
                    >{`View all ${comments.length} comments`}</Link>
                </div>
            ) : (
                ''
            )}

            {isSinglePost
                ? ''
                : comments.map((comment) => {
                      const {
                          id,
                          user: { id: user_id, username },
                          content,
                      } = comment;
                      return (
                          <Comment
                              key={`post-comment-${id}`}
                              commentId={id}
                              userId={user_id}
                              username={username}
                              content={content}
                          ></Comment>
                      );
                  })}
            <div className='post-date-created'>{`${timeSince(
                created_at
            )}`}</div>
        </CommentWrapper>
    );
};

export default PostCommentSection;
