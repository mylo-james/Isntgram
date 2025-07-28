from flask import Blueprint, request, jsonify
from sqlalchemy.orm import joinedload
from ..models import db, Post, User, Follow, Like, Comment

profile_routes = Blueprint("profile", __name__)


@profile_routes.route('/<username>')
def index(username):
    # Try to find user by username first, then by ID as fallback
    user = User.query.filter(User.username == username).first()
    if not user:
        # Try as numeric ID for backward compatibility
        try:
            user_id = int(username)
            user = User.query.filter(User.id == user_id).first()
        except ValueError:
            user = None
    
    if not user:
        return {"error": "User not found"}, 404
    
    user_id = user.id
    post_count = Post.query.filter(Post.user_id == user_id).count()
    followers = Follow.query.filter(Follow.user_followed_id == user_id).all()
    follows = Follow.query.filter(Follow.user_id == user_id).all()
    posts = Post.query.filter(Post.user_id == user_id).all()
    posts.reverse()
    plist = []

    followersList = []
    followsList = []

    for follower in followers:
        followersList.append(follower.to_dict())

    for follower in follows:
        followsList.append(follower.to_dict())

    for post in posts:
        post_dict = post.to_dict()
        likes = Like.query.filter((Like.likeable_id == post_dict["id"]) & (Like.likeable_type == 'post')).count()
        comments = Comment.query.filter(Comment.post_id == post_dict["id"]).count()
        post_dict["like_count"] = likes
        post_dict["comment_count"] = comments
        plist.append(post_dict)
    return {"num_posts": post_count, "posts": plist, "followersList": followersList, "followingList": followsList, "user": user.to_dict() }
