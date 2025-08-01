from flask import Blueprint, request
from ..models import Comment, User, Like, db


comment_routes = Blueprint("comment", __name__)


@comment_routes.route('', methods=['POST'])
def post_comment():
    data = request.json
    
    # Validate required fields
    if not data or not all(key in data for key in ['user_id', 'post_id', 'content']):
        return {"error": "Missing required fields: user_id, post_id, content"}, 400
    
    try:
        # Validate foreign keys exist
        from ..models import User, Post
        user = User.query.filter(User.id == data['user_id']).first()
        if not user:
            return {"error": "User not found"}, 404
            
        post = Post.query.filter(Post.id == data['post_id']).first()
        if not post:
            return {"error": "Post not found"}, 404
        
        comment = Comment(user_id=data['user_id'], post_id=data['post_id'], content=data['content'])
        db.session.add(comment)
        db.session.commit()
        comment_dict = comment.to_dict()
        
        # Handle case where user relationship might not exist (for testing)
        if comment.user:
            comment_dict['user'] = comment.user.to_dict()
        else:
            comment_dict['user'] = None
       
        likes = Like.query.filter(Like.likeable_id == comment.id).filter(Like.likeable_type == 'comment').all()
        likes_comment = []

        for like in likes:
            likes_comment.append(like.to_dict())
        comment_dict['likes'] = likes_comment
        
        # Return wrapped in comment key for consistency
        return {"comment": comment_dict}
        
    except Exception as e:
        db.session.rollback()
        return {"error": "Failed to create comment"}, 500
