import { useEffect, useContext, useState, useCallback } from 'react';
import styled from 'styled-components';
import PostHeader from '../components/Post/PostHeader';
import PhotoImagePost from '../components/Post/PhotoImagePost';
import IconPost from '../components/Post/IconPost';
import PostCommentSection from '../components/Post/PostCommentSection';
import CommentInputField from '../components/Post/CommentInputField';
import { useParams } from 'react-router-dom';

const SinglePostWrapper = styled.div`
    width: 100%;
    max-width: 600px;
    margin: 54px auto;
    background-color: white;

    @media screen and (min-width: 640px) {
        border: 1px solid #dfdfdf;
        margin-top: 77px;
        border-radius: 3px;
        height: 318.66;
    }
`;

const SinglePost = (props) => {
    let [post, setPost] = useState({});
    let { id } = useParams();

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`/api/post/${id}`);

                if (!res.ok) throw res;

                const { post } = await res.json();
                setPost(post);
            } catch (e) {
                console.error(e);
            }
        })();
    }, [id, setPost]);

    if (!Object.keys(post).length) return null;
    console.log(post);
    return (
        <>
            <SinglePostWrapper>
                <PostHeader {...post} isSinglePost={true} />
                <PhotoImagePost id={id} postImg={post.image_url} />
                <IconPost isSinglePost={true} {...post} />
                <PostCommentSection {...post} isSinglePost={true} />
                <CommentInputField {...post} isSinglePost={true} />
            </SinglePostWrapper>
        </>
    );
};

export default SinglePost;
