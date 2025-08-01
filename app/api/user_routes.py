from flask import Blueprint, request, current_app
from ..models import db, User

import jwt

user_routes = Blueprint("users", __name__)

@user_routes.route('/lookup/<username>')
def lookup_user(username):
    """
    Look up a user by username and return basic user info
    """
    user = User.query.filter(User.username == username).first()
    if not user:
        return {"error": "User not found"}, 404
    
    return {"user": user.to_dict()}

@user_routes.route('', methods=['PUT'])
def update_user():
    data = request.json
    if not data or "id" not in data:
        return {"error": "Missing required data"}, 400
    
    user = User.query.filter(User.id == data["id"]).first()
    if not user:
        return {"error": "User not found"}, 404
    
    old_user = user.to_dict()
    if user.username != data["username"]:
        if User.query.filter(User.username == data['username']).first():
            return {"error": 'Username already exists'}, 401
        user.username = data["username"]
    if user.email != data["email"]:
        if User.query.filter(User.email == data['email']).first():
            return {"error": 'Email already exists'}, 401
        user.email = data["email"]
    if user.full_name != data["full_name"]:
        user.full_name = data["full_name"]
    if user.bio != data["bio"]:
        user.bio = data["bio"]
    db.session.commit()

    # Check if any changes were actually made
    new_user = user.to_dict()
    if (old_user['username'] == new_user['username'] and 
        old_user['email'] == new_user['email'] and 
        old_user['full_name'] == new_user['full_name'] and 
        old_user['bio'] == new_user['bio']):
        return {"error": "No changes made"}, 401

    access_token = jwt.encode({'email': user.email}, current_app.config['SECRET_KEY'], algorithm="HS256")
    return {'access_token': access_token, 'user': user.to_dict()}


@user_routes.route('/<id>/resetImg')
def reset_img(id):
    user = User.query.filter(User.id == id).first()
    
    if not user:
        return {"error": "User not found"}, 404

    user.profile_image_url = 'https://slickpics.s3.us-east-2.amazonaws.com/uploads/FriJul171300242020.png'
    db.session.commit()

    return user.to_dict()
