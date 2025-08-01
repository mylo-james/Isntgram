from flask import Blueprint, request, jsonify
from sqlalchemy.orm import joinedload
from ..models import User, Follow, db


#  following = /:id/following
#  follows = /:id

follow_routes = Blueprint("follow", __name__)

# users who follow user of <id>
@follow_routes.route('/<id>')
def get_follows(id):
    follows = Follow.query.filter(Follow.user_followed_id == id).all()

    follows_list = []
    for follow in follows:
        follows_list.append(follow.to_dict())
    return {"follows": follows_list}

@follow_routes.route('<id>/following')
def get_following(id):
    follows = Follow.query.filter(Follow.user_id == id).all()

    follows_list = []
    for follow in follows:
        follows_list.append(follow.to_dict())
    return {"follows": follows_list}

@follow_routes.route('', methods=["POST"])
def follow_user():
    data = request.json
    exists = Follow.query.filter(Follow.user_id == data['user_id']).filter(Follow.user_followed_id == data['user_followed_id']).first()
    if exists:
        return {"error": "Already Follow!"}
    follow = Follow(user_id = data['user_id'], user_followed_id = data['user_followed_id'])
    db.session.add(follow)
    db.session.commit()
    return follow.to_dict()

@follow_routes.route('', methods = ["DELETE"])
def delete_follow():
    data = request.json
    exists = Follow.query.filter(Follow.user_id == data['user_id']).filter(Follow.user_followed_id == data['user_followed_id']).first()
    if not exists:
        return {"error": "Doesn't follow!"}
    follow = Follow.query.filter(Follow.user_id == data['user_id']).filter(Follow.user_followed_id == data['user_followed_id']).first()
    db.session.delete(follow)
    db.session.commit()
    return follow.to_dict()
