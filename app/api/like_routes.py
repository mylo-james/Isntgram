from flask import Blueprint, request, jsonify
from sqlalchemy.orm import joinedload
from ..models import db, User, Like, Post, Comment


like_routes = Blueprint("like", __name__)


@like_routes.route("/user/<id>")
def get_user_likes(id):
    like_list = []
    likes = Like.query.filter(Like.user_id == id).all()
    for like in likes:
        like_list.append(like.to_dict())
    return {"likes": like_list}


@like_routes.route("/<likeable_type>/<id>")
def get_likes(likeable_type, id):
    likes = (
        Like.query.filter(Like.likeable_id == id)
        .filter(Like.likeable_type == likeable_type)
        .all()
    )
    likeList = []
    for like in likes:
        likeList.append(like.to_dict())

    return {"likes": likeList}


@like_routes.route("", methods=["POST"])
def post_like():
    data = request.json
    content = {}
    like = Like(
        user_id=data["user_id"],
        likeable_id=data["id"],
        likeable_type=data["likeable_type"],
    )
    db.session.add(like)
    db.session.commit()

    likes = (
        Like.query.filter(Like.likeable_id == data["id"])
        .filter(Like.likeable_type == data["likeable_type"])
        .all()
    )
    likeList = []
    for like in likes:
        likeList.append(like.to_dict())
    return {"like": like.to_dict(), "like_list": likeList}


@like_routes.route("", methods=["DELETE"])
def delete_like():
    data = request.json
    like = Like.query.filter(Like.id == data["id"]).first()

    db.session.delete(like)
    db.session.commit()

    
    return like.to_dict()
   
