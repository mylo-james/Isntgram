"""
Test suite for database models
Tests model functionality, relationships, and methods
"""
import pytest
from app.models import User, Post, Comment, Like, Follow, db


class TestUserModel:
    """Test User model functionality."""

    def test_user_creation(self, client):
        """Test creating a user with all fields."""
        with client.application.app_context():
            user = User(
                username="testuser",
                email="test@example.com",
                full_name="Test User",
                bio="Test bio"
            )
            user.password = "password123"
            db.session.add(user)
            db.session.commit()
            
            assert user.id is not None
            assert user.username == "testuser"
            assert user.email == "test@example.com"
            assert user.full_name == "Test User"
            assert user.bio == "Test bio"
            assert user.check_password("password123")

    def test_user_password_hashing(self, client):
        """Test password hashing and verification."""
        with client.application.app_context():
            user = User(
                username="passworduser",
                email="password@example.com",
                full_name="Password User"
            )
            user.password = "securepassword"
            db.session.add(user)
            db.session.commit()
            
            # Test password verification
            assert user.check_password("securepassword")
            assert not user.check_password("wrongpassword")

    def test_user_to_dict(self, client):
        """Test user.to_dict() method."""
        with client.application.app_context():
            user = User(
                username="dictuser",
                email="dict@example.com",
                full_name="Dict User",
                bio="Dict bio"
            )
            user.password = "password123"
            db.session.add(user)
            db.session.commit()
            
            user_dict = user.to_dict()
            assert "id" in user_dict
            assert "username" in user_dict
            assert "email" in user_dict
            assert "full_name" in user_dict
            assert "bio" in user_dict
            assert "profile_image_url" in user_dict
            assert "created_at" in user_dict
            assert "updated_at" in user_dict
            assert user_dict["username"] == "dictuser"

    def test_user_relationships(self, client):
        """Test user relationships with posts, comments, likes, and follows."""
        with client.application.app_context():
            # Create users
            user1 = User(
                username="user1",
                email="user1@example.com",
                full_name="User One"
            )
            user1.password = "password123"
            db.session.add(user1)
            
            user2 = User(
                username="user2",
                email="user2@example.com",
                full_name="User Two"
            )
            user2.password = "password123"
            db.session.add(user2)
            db.session.commit()
            
            # Create post
            post = Post(
                user_id=user1.id,
                image_url="https://example.com/post.jpg",
                caption="Test post"
            )
            db.session.add(post)
            db.session.commit()
            
            # Create comment
            comment = Comment(
                user_id=user2.id,
                post_id=post.id,
                content="Test comment"
            )
            db.session.add(comment)
            db.session.commit()
            
            # Create like
            like = Like(
                user_id=user2.id,
                likeable_id=post.id,
                likeable_type="post"
            )
            db.session.add(like)
            db.session.commit()
            
            # Create follow
            follow = Follow(
                user_id=user2.id,
                user_followed_id=user1.id
            )
            db.session.add(follow)
            db.session.commit()
            
            # Test relationships - User model has follows, not followers/following
            assert len(user1.posts) == 1
            assert len(user1.comments) == 0
            assert len(user1.likes) == 0
            assert len(user1.follows) == 0  # user1 is being followed, not following
            
            assert len(user2.posts) == 0
            assert len(user2.comments) == 1
            assert len(user2.likes) == 1
            assert len(user2.follows) == 1  # user2 is following user1


class TestPostModel:
    """Test Post model functionality."""

    def test_post_creation(self, client):
        """Test creating a post."""
        with client.application.app_context():
            user = User(
                username="postuser",
                email="post@example.com",
                full_name="Post User"
            )
            user.password = "password123"
            db.session.add(user)
            db.session.commit()
            
            post = Post(
                user_id=user.id,
                image_url="https://example.com/image.jpg",
                caption="Test post caption"
            )
            db.session.add(post)
            db.session.commit()
            
            assert post.id is not None
            assert post.user_id == user.id
            assert post.image_url == "https://example.com/image.jpg"
            assert post.caption == "Test post caption"

    def test_post_to_dict(self, client):
        """Test post.to_dict() method."""
        with client.application.app_context():
            user = User(
                username="dictpostuser",
                email="dictpost@example.com",
                full_name="Dict Post User"
            )
            user.password = "password123"
            db.session.add(user)
            db.session.commit()
            
            post = Post(
                user_id=user.id,
                image_url="https://example.com/dict.jpg",
                caption="Dict post"
            )
            db.session.add(post)
            db.session.commit()
            
            post_dict = post.to_dict()
            assert "id" in post_dict
            assert "user_id" in post_dict
            assert "image_url" in post_dict
            assert "caption" in post_dict
            assert "created_at" in post_dict
            assert "updated_at" in post_dict
            assert post_dict["caption"] == "Dict post"

    def test_post_relationships(self, client):
        """Test post relationships with user, comments, and likes."""
        with client.application.app_context():
            user = User(
                username="reluser",
                email="rel@example.com",
                full_name="Rel User"
            )
            user.password = "password123"
            db.session.add(user)
            db.session.commit()
            
            post = Post(
                user_id=user.id,
                image_url="https://example.com/rel.jpg",
                caption="Relationship post"
            )
            db.session.add(post)
            db.session.commit()
            
            # Create comment
            comment = Comment(
                user_id=user.id,
                post_id=post.id,
                content="Test comment"
            )
            db.session.add(comment)
            db.session.commit()
            
            # Create like
            like = Like(
                user_id=user.id,
                likeable_id=post.id,
                likeable_type="post"
            )
            db.session.add(like)
            db.session.commit()
            
            # Test relationships - Post model doesn't have direct likes relationship
            assert post.user == user
            assert len(post.comments) == 1
            # Post doesn't have direct likes relationship, likes are polymorphic


class TestCommentModel:
    """Test Comment model functionality."""

    def test_comment_creation(self, client):
        """Test creating a comment."""
        with client.application.app_context():
            user = User(
                username="commentuser",
                email="comment@example.com",
                full_name="Comment User"
            )
            user.password = "password123"
            db.session.add(user)
            db.session.commit()
            
            post = Post(
                user_id=user.id,
                image_url="https://example.com/comment.jpg",
                caption="Comment post"
            )
            db.session.add(post)
            db.session.commit()
            
            comment = Comment(
                user_id=user.id,
                post_id=post.id,
                content="Test comment content"
            )
            db.session.add(comment)
            db.session.commit()
            
            assert comment.id is not None
            assert comment.user_id == user.id
            assert comment.post_id == post.id
            assert comment.content == "Test comment content"

    def test_comment_to_dict(self, client):
        """Test comment.to_dict() method."""
        with client.application.app_context():
            user = User(
                username="dictcommentuser",
                email="dictcomment@example.com",
                full_name="Dict Comment User"
            )
            user.password = "password123"
            db.session.add(user)
            db.session.commit()
            
            post = Post(
                user_id=user.id,
                image_url="https://example.com/dictcomment.jpg",
                caption="Dict comment post"
            )
            db.session.add(post)
            db.session.commit()
            
            comment = Comment(
                user_id=user.id,
                post_id=post.id,
                content="Dict comment"
            )
            db.session.add(comment)
            db.session.commit()
            
            comment_dict = comment.to_dict()
            assert "id" in comment_dict
            assert "user_id" in comment_dict
            assert "post_id" in comment_dict
            assert "content" in comment_dict
            assert "created_at" in comment_dict
            # Comment model doesn't include updated_at in to_dict()
            assert comment_dict["content"] == "Dict comment"

    def test_comment_relationships(self, client):
        """Test comment relationships with user, post, and likes."""
        with client.application.app_context():
            user = User(
                username="relcommentuser",
                email="relcomment@example.com",
                full_name="Rel Comment User"
            )
            user.password = "password123"
            db.session.add(user)
            db.session.commit()
            
            post = Post(
                user_id=user.id,
                image_url="https://example.com/relcomment.jpg",
                caption="Rel comment post"
            )
            db.session.add(post)
            db.session.commit()
            
            comment = Comment(
                user_id=user.id,
                post_id=post.id,
                content="Rel comment"
            )
            db.session.add(comment)
            db.session.commit()
            
            # Create like on comment
            like = Like(
                user_id=user.id,
                likeable_id=comment.id,
                likeable_type="comment"
            )
            db.session.add(like)
            db.session.commit()
            
            # Test relationships - Comment model doesn't have direct likes relationship
            assert comment.user == user
            assert comment.post == post
            # Comment doesn't have direct likes relationship, likes are polymorphic


class TestLikeModel:
    """Test Like model functionality."""

    def test_like_creation_post(self, client):
        """Test creating a like on a post."""
        with client.application.app_context():
            user = User(
                username="likeuser",
                email="like@example.com",
                full_name="Like User"
            )
            user.password = "password123"
            db.session.add(user)
            db.session.commit()
            
            post = Post(
                user_id=user.id,
                image_url="https://example.com/like.jpg",
                caption="Like post"
            )
            db.session.add(post)
            db.session.commit()
            
            like = Like(
                user_id=user.id,
                likeable_id=post.id,
                likeable_type="post"
            )
            db.session.add(like)
            db.session.commit()
            
            assert like.id is not None
            assert like.user_id == user.id
            assert like.likeable_id == post.id
            assert like.likeable_type == "post"

    def test_like_creation_comment(self, client):
        """Test creating a like on a comment."""
        with client.application.app_context():
            user = User(
                username="likecommentuser",
                email="likecomment@example.com",
                full_name="Like Comment User"
            )
            user.password = "password123"
            db.session.add(user)
            db.session.commit()
            
            post = Post(
                user_id=user.id,
                image_url="https://example.com/likecomment.jpg",
                caption="Like comment post"
            )
            db.session.add(post)
            db.session.commit()
            
            comment = Comment(
                user_id=user.id,
                post_id=post.id,
                content="Like comment"
            )
            db.session.add(comment)
            db.session.commit()
            
            like = Like(
                user_id=user.id,
                likeable_id=comment.id,
                likeable_type="comment"
            )
            db.session.add(like)
            db.session.commit()
            
            assert like.id is not None
            assert like.user_id == user.id
            assert like.likeable_id == comment.id
            assert like.likeable_type == "comment"

    def test_like_to_dict(self, client):
        """Test like.to_dict() method."""
        with client.application.app_context():
            user = User(
                username="dictlikeuser",
                email="dictlike@example.com",
                full_name="Dict Like User"
            )
            user.password = "password123"
            db.session.add(user)
            db.session.commit()
            
            post = Post(
                user_id=user.id,
                image_url="https://example.com/dictlike.jpg",
                caption="Dict like post"
            )
            db.session.add(post)
            db.session.commit()
            
            like = Like(
                user_id=user.id,
                likeable_id=post.id,
                likeable_type="post"
            )
            db.session.add(like)
            db.session.commit()
            
            like_dict = like.to_dict()
            assert "id" in like_dict
            assert "user_id" in like_dict
            assert "likeable_id" in like_dict
            assert "likeable_type" in like_dict
            assert "created_at" in like_dict
            # Like model doesn't include updated_at in to_dict()
            assert like_dict["likeable_type"] == "post"

    def test_like_relationships(self, client):
        """Test like relationships with user."""
        with client.application.app_context():
            user = User(
                username="rellikeuser",
                email="rellike@example.com",
                full_name="Rel Like User"
            )
            user.password = "password123"
            db.session.add(user)
            db.session.commit()
            
            post = Post(
                user_id=user.id,
                image_url="https://example.com/rellike.jpg",
                caption="Rel like post"
            )
            db.session.add(post)
            db.session.commit()
            
            like = Like(
                user_id=user.id,
                likeable_id=post.id,
                likeable_type="post"
            )
            db.session.add(like)
            db.session.commit()
            
            # Test relationships
            assert like.user == user


class TestFollowModel:
    """Test Follow model functionality."""

    def test_follow_creation(self, client):
        """Test creating a follow relationship."""
        with client.application.app_context():
            user1 = User(
                username="follower",
                email="follower@example.com",
                full_name="Follower User"
            )
            user1.password = "password123"
            db.session.add(user1)
            
            user2 = User(
                username="followee",
                email="followee@example.com",
                full_name="Followee User"
            )
            user2.password = "password123"
            db.session.add(user2)
            db.session.commit()
            
            follow = Follow(
                user_id=user1.id,
                user_followed_id=user2.id
            )
            db.session.add(follow)
            db.session.commit()
            
            assert follow.id is not None
            assert follow.user_id == user1.id
            assert follow.user_followed_id == user2.id

    def test_follow_to_dict(self, client):
        """Test follow.to_dict() method."""
        with client.application.app_context():
            user1 = User(
                username="dictfollower",
                email="dictfollower@example.com",
                full_name="Dict Follower"
            )
            user1.password = "password123"
            db.session.add(user1)
            
            user2 = User(
                username="dictfollowee",
                email="dictfollowee@example.com",
                full_name="Dict Followee"
            )
            user2.password = "password123"
            db.session.add(user2)
            db.session.commit()
            
            follow = Follow(
                user_id=user1.id,
                user_followed_id=user2.id
            )
            db.session.add(follow)
            db.session.commit()
            
            follow_dict = follow.to_dict()
            assert "id" in follow_dict
            assert "user_id" in follow_dict
            assert "user_followed_id" in follow_dict
            assert "created_at" in follow_dict
            # Follow model doesn't include updated_at in to_dict()
            assert follow_dict["user_id"] == user1.id
            assert follow_dict["user_followed_id"] == user2.id

    def test_follow_relationships(self, client):
        """Test follow relationships with users."""
        with client.application.app_context():
            user1 = User(
                username="relfollower",
                email="relfollower@example.com",
                full_name="Rel Follower"
            )
            user1.password = "password123"
            db.session.add(user1)
            
            user2 = User(
                username="relfollowee",
                email="relfollowee@example.com",
                full_name="Rel Followee"
            )
            user2.password = "password123"
            db.session.add(user2)
            db.session.commit()
            
            follow = Follow(
                user_id=user1.id,
                user_followed_id=user2.id
            )
            db.session.add(follow)
            db.session.commit()
            
            # Test relationships - Follow model has user relationship, not user_followed
            assert follow.user == user1
            # Follow model doesn't have user_followed relationship 