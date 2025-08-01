from flask import Blueprint, request, jsonify
from sqlalchemy import desc, func
from sqlalchemy.orm import joinedload, selectinload
from flask_login import login_required, current_user
from pydantic import ValidationError

from ..models import db, Post, User, Follow, Like, Comment
from ..schemas.post_schemas import (
    PostCreateSchema, 
    PostUpdateSchema, 
    PostResponseSchema,
    PostWithUserSchema,
    PostDetailSchema
)
from ..utils.api_utils import (
    handle_validation_error,
    success_response,
    error_response,
    NotFoundAPIError
)
import logging

logger = logging.getLogger(__name__)
post_routes = Blueprint("posts", __name__)


@post_routes.route("/scroll/<int:length>")
def index(length: int):
    """
    Get paginated posts for infinite scroll with optimized queries.
    Uses modern SQLAlchemy 2.0 patterns and eliminates N+1 queries.
    """
    try:
        # Optimized query with joined loading to prevent N+1 queries
        posts = (Post.query
                .options(joinedload(Post.user))  # Load user data in single query
                .order_by(desc(Post.created_at))
                .offset(length)
                .limit(3)
                .all())
        
        post_list = []
        for post in posts:
            # Use optimized to_dict_with_user method from modernized model
            post_dict = post.to_dict_with_user()
            
            # Get aggregated counts efficiently
            likes_count = Like.query.filter(
                Like.likeable_id == post.id, 
                Like.likeable_type == "Post"
            ).count()
            
            comments_count = Comment.query.filter(
                Comment.post_id == post.id
            ).count()
            
            post_dict["like_count"] = likes_count
            post_dict["comment_count"] = comments_count
            post_list.append(post_dict)
        
        return success_response({"posts": post_list})
        
    except Exception as e:
        logger.error(f"Error fetching posts: {str(e)}")
        return error_response("Failed to fetch posts", status_code=500)


@post_routes.route("/explore/<int:length>")
def explore(length: int):
    """
    Get randomized posts for explore page with optimized queries.
    Uses modern SQLAlchemy 2.0 patterns for better performance.
    """
    try:
        # Optimized randomized query with joined loading
        posts = (Post.query
                .options(joinedload(Post.user))
                .order_by(func.random())
                .offset(length)
                .limit(3)
                .all())
        
        post_list = []
        for post in posts:
            post_dict = post.to_dict_with_user()
            
            # Efficient count queries with proper polymorphic filtering
            likes_count = Like.query.filter(
                Like.likeable_id == post.id,
                Like.likeable_type == "Post"
            ).count()
            
            comments_count = Comment.query.filter(
                Comment.post_id == post.id
            ).count()
            
            post_dict["like_count"] = likes_count
            post_dict["comment_count"] = comments_count
            post_list.append(post_dict)
        
        return success_response({"posts": post_list})
        
    except Exception as e:
        logger.error(f"Error fetching explore posts: {str(e)}")
        return error_response("Failed to fetch explore posts", status_code=500)


@post_routes.route("", methods=["POST"])
@login_required
def create_post():
    """
    Create a new post with modern Pydantic validation.
    """
    try:
        # Parse and validate request data
        post_data = PostCreateSchema.model_validate(request.get_json())
        
        # Create new post
        post = Post(
            user_id=current_user.id,
            image_url=post_data.image_url,
            caption=post_data.caption
        )
        
        db.session.add(post)
        db.session.commit()
        
        # Return post with user data using optimized loading
        post_with_user = (Post.query
                         .options(joinedload(Post.user))
                         .filter(Post.id == post.id)
                         .first())
        
        post_response = post_with_user.to_dict_with_user()
        post_response["like_count"] = 0
        post_response["comment_count"] = 0
        
        return success_response(
            {"post": post_response}, 
            "Post created successfully"
        ), 201
        
    except ValidationError as e:
        return handle_validation_error(e)
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating post: {str(e)}")
        return error_response("Failed to create post", status_code=500)


@post_routes.route("/<int:post_id>", methods=["PUT"])
@login_required
def update_post(post_id: int):
    """
    Update a post's caption with modern Pydantic validation.
    """
    try:
        # Find the post
        post = Post.query.filter(Post.id == post_id).first()
        if not post:
            return error_response("Post not found", status_code=404)
        
        # Check if user owns the post
        if post.user_id != current_user.id:
            return error_response("Not authorized to edit this post", status_code=403)
        
        # Parse and validate request data
        update_data = PostUpdateSchema.model_validate(request.get_json())
        
        # Update post
        post.caption = update_data.caption
        db.session.commit()
        
        # Return updated post
        post_response = post.to_dict_with_user()
        return success_response(
            {"post": post_response}, 
            "Post updated successfully"
        )
        
    except ValidationError as e:
        return handle_validation_error(e)
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating post: {str(e)}")
        return error_response("Failed to update post", status_code=500)


@post_routes.route("/<int:post_id>", methods=["DELETE"])
@login_required
def delete_post(post_id: int):
    """
    Delete a post with proper authorization.
    """
    try:
        # Find the post
        post = Post.query.filter(Post.id == post_id).first()
        if not post:
            return error_response("Post not found", status_code=404)
        
        # Check if user owns the post
        if post.user_id != current_user.id:
            return error_response("Not authorized to delete this post", status_code=403)
        
        # Delete post (cascade will handle comments/likes)
        db.session.delete(post)
        db.session.commit()
        
        return success_response(message="Post deleted successfully")
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting post: {str(e)}")
        return error_response("Failed to delete post", status_code=500)


@post_routes.route("/<id>/scroll/<length>")
def home_feed(id, length):
    length = int(length)
    post_list = []
    followed_users = Follow.query.filter(Follow.user_followed_id == id).all()
    follow_list = []
    for followed in followed_users:
        followed_dict = followed.to_dict()
        follow_list.append(followed_dict["user_id"])
    posts = (
        Post.query.filter(Post.user_id.in_(follow_list))
        .order_by(desc(Post.created_at))
        .offset(length)
        .limit(3)
        .all()
    )

    for post in posts:
        post_dict = post.to_dict()
        user = post.user
        post_dict["user"] = user.to_dict()

        likes = (
            Like.query.filter(Like.likeable_id == post.id)
            .filter(Like.likeable_type == "post")
            .all()
        )

        likes_list = []
        for like in likes:
            likes_list.append(like.to_dict())

        post_dict["likes"] = likes_list

        comments = post.comments

        comments_list = []

        for comment in comments:
            comment_dict = comment.to_dict()
            comment_dict["user"] = comment.user.to_dict()
            comments_list.append(comment_dict)

        post_dict["comments"] = comments_list
        post_list.append(post_dict)
        if len(post_list) == 3:
            return {"posts": post_list}
    return {"posts": post_list}


@post_routes.route("/<post_id>")
def get_post(post_id):

    post = Post.query.filter(Post.id == post_id).first()
    
    if not post:
        return error_response("Post not found", status_code=404)

    post_dict = post.to_dict()

    post_dict["user"] = post.user.to_dict()
    comments = post.comments
    comments_list = []

    for comment in comments:
        comment_dict = comment.to_dict()
        comment_dict["user"] = comment.user.to_dict()
        comments_list.append(comment_dict)

    post_dict["comments"] = comments_list

    likes = Like.query.filter(
        Like.likeable_type == "post", Like.likeable_id == post_id
    ).all()

    likeList = []
    for like in likes:
        likeList.append(like.to_dict())
    post_dict["likes"] = likeList

    return {"post": post_dict}
