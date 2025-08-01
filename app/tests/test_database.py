import pytest
from app.models import User, Post, Comment, Like, Follow
from app.tests.factories import (
    UserFactory, PostFactory, CommentFactory, LikeFactory, FollowFactory,
    create_test_users, create_test_posts, create_test_comments, create_test_likes
)


class TestDatabaseRelationships:
    """Test database model relationships and associations."""
    
    def test_user_posts_relationship(self, app):
        """Test User -> Posts relationship."""
        with app.app_context():
            from app.models import db
            
            # Create user
            user = UserFactory.create()
            
            # Create posts with the user
            posts = []
            for _ in range(3):
                post = Post(
                    caption=f"Test post {_}",
                    image_url=f"https://example.com/image{_}.jpg",
                    user_id=user.id
                )
                db.session.add(post)
                posts.append(post)
            
            db.session.commit()
            
            # Test relationship using direct query
            user_posts = Post.query.filter_by(user_id=user.id).all()
            assert len(user_posts) == 3
            assert all(post.user_id == user.id for post in posts)
    
    def test_post_comments_relationship(self, app):
        """Test Post -> Comments relationship."""
        with app.app_context():
            from app.models import db
            
            # Create post
            post = PostFactory.create()
            
            # Create comments with the post
            comments = []
            for _ in range(2):
                comment = Comment(
                    content=f"Test comment {_}",
                    user_id=post.user_id,
                    post_id=post.id
                )
                db.session.add(comment)
                comments.append(comment)
            
            db.session.commit()
            
            # Test relationship using direct query
            post_comments = Comment.query.filter_by(post_id=post.id).all()
            assert len(post_comments) == 2
            assert all(comment.post_id == post.id for comment in comments)
    
    def test_user_likes_relationship(self, app):
        """Test User -> Likes relationship."""
        with app.app_context():
            from app.models import db
            
            # Create user and post
            user = UserFactory.create()
            post = PostFactory.create()
            
            # Create likes for the post with the user
            likes = []
            for _ in range(3):
                like = Like(
                    user_id=user.id,
                    likeable_type='Post',
                    likeable_id=post.id
                )
                db.session.add(like)
                likes.append(like)
            
            db.session.commit()
            
            # Test relationship using direct query
            user_likes = Like.query.filter_by(user_id=user.id).all()
            assert len(user_likes) == 3
            assert all(like.user_id == user.id for like in likes)
    
    def test_user_follows_relationship(self, app):
        """Test User -> Follows relationship."""
        with app.app_context():
            from app.models import db
            
            # Create users
            user = UserFactory.create()
            followed_user = UserFactory.create()
            
            # Create follow relationship
            follow = Follow(
                user_id=user.id,
                user_followed_id=followed_user.id
            )
            db.session.add(follow)
            db.session.commit()
            
            # Test relationship using direct query
            user_follows = Follow.query.filter_by(user_id=user.id).all()
            assert len(user_follows) == 1
            assert user_follows[0].user_id == user.id
            assert user_follows[0].user_followed_id == followed_user.id


class TestDatabaseQueries:
    """Test database query performance and optimization."""
    
    def test_user_posts_query_performance(self, app):
        """Test querying user posts with proper indexing."""
        with app.app_context():
            user = UserFactory.create()
            posts = create_test_posts(5, user)
            
            # Test direct query
            user_posts = Post.query.filter_by(user_id=user.id).all()
            assert len(user_posts) == 5
            
            # Test relationship query
            relationship_posts = user.posts
            assert len(relationship_posts) == 5
    
    def test_post_comments_query_performance(self, app):
        """Test querying post comments with proper indexing."""
        with app.app_context():
            post = PostFactory.create()
            comments = create_test_comments(3, post)
            
            # Test direct query
            post_comments = Comment.query.filter_by(post_id=post.id).all()
            assert len(post_comments) == 3
            
            # Test relationship query
            relationship_comments = post.comments
            assert len(relationship_comments) == 3
    
    def test_likes_polymorphic_query(self, app):
        """Test polymorphic likes query performance."""
        with app.app_context():
            post = PostFactory.create()
            comment = CommentFactory.create(post=post)
            
            # Create likes for both post and comment
            post_likes = create_test_likes(2, 'Post', post.id)
            comment_likes = create_test_likes(1, 'Comment', comment.id)
            
            # Test post likes query
            queried_post_likes = Like.query.filter_by(
                likeable_type='Post', 
                likeable_id=post.id
            ).all()
            assert len(queried_post_likes) == 2
            
            # Test comment likes query
            queried_comment_likes = Like.query.filter_by(
                likeable_type='Comment', 
                likeable_id=comment.id
            ).all()
            assert len(queried_comment_likes) == 1
    
    def test_follow_relationships_query(self, app):
        """Test follow relationships query performance."""
        with app.app_context():
            user = UserFactory.create()
            followed_users = create_test_users(3)
            
            # Create follow relationships
            for followed_user in followed_users:
                FollowFactory.create(
                    user_id=user.id,
                    user_followed_id=followed_user.id
                )
            
            # Test following query
            following = Follow.query.filter_by(user_id=user.id).all()
            assert len(following) == 3
            
            # Test followers query
            followers = Follow.query.filter_by(user_followed_id=user.id).all()
            assert len(followers) == 0  # No one follows this user


class TestDataIntegrity:
    """Test data integrity and constraints."""
    
    def test_user_unique_constraints(self, app):
        """Test user unique constraints (username, email)."""
        with app.app_context():
            # Create first user
            user1 = UserFactory.create()
            
            # Try to create user with same username
            with pytest.raises(Exception):
                UserFactory.create(username=user1.username)
            
            # Try to create user with same email
            with pytest.raises(Exception):
                UserFactory.create(email=user1.email)
    
    def test_follow_unique_constraint(self, app):
        """Test follow unique constraint."""
        with app.app_context():
            user = UserFactory.create()
            followed_user = UserFactory.create()
            
            # Create first follow relationship
            FollowFactory.create(
                user_id=user.id,
                user_followed_id=followed_user.id
            )
            
            # Try to create duplicate follow relationship
            with pytest.raises(Exception):
                FollowFactory.create(
                    user_id=user.id,
                    user_followed_id=followed_user.id
                )
    
    def test_cascade_deletes(self, app):
        """Test cascade delete behavior."""
        with app.app_context():
            user = UserFactory.create()
            post = PostFactory.create(user=user)
            comment = CommentFactory.create(post=post, user=user)
            like = LikeFactory.create(
                user_id=user.id,
                likeable_type='Post',
                likeable_id=post.id
            )
            follow = FollowFactory.create(
                user_id=user.id,
                user_followed_id=UserFactory.create().id
            )
            
            # Delete user
            user_id = user.id
            post_id = post.id
            comment_id = comment.id
            like_id = like.id
            follow_id = follow.id
            
            User.query.filter_by(id=user_id).delete()
            
            # Verify cascade deletes
            assert Post.query.filter_by(id=post_id).first() is None
            assert Comment.query.filter_by(id=comment_id).first() is None
            assert Like.query.filter_by(id=like_id).first() is None
            assert Follow.query.filter_by(id=follow_id).first() is None
    
    def test_post_cascade_deletes(self, app):
        """Test post cascade delete behavior."""
        with app.app_context():
            post = PostFactory.create()
            comment = CommentFactory.create(post=post)
            like = LikeFactory.create(
                likeable_type='Post',
                likeable_id=post.id
            )
            
            # Delete post
            post_id = post.id
            comment_id = comment.id
            like_id = like.id
            
            Post.query.filter_by(id=post_id).delete()
            
            # Verify cascade deletes
            assert Comment.query.filter_by(id=comment_id).first() is None
            assert Like.query.filter_by(id=like_id).first() is None


class TestTransactionHandling:
    """Test transaction handling and rollbacks."""
    
    def test_successful_transaction(self, app):
        """Test successful transaction commit."""
        with app.app_context():
            # Start transaction
            user = UserFactory.create()
            post = PostFactory.create(user=user)
            
            # Verify data is committed
            assert User.query.filter_by(id=user.id).first() is not None
            assert Post.query.filter_by(id=post.id).first() is not None
    
    def test_rollback_on_constraint_violation(self, app):
        """Test rollback on constraint violation."""
        with app.app_context():
            # Create user with unique username
            user = UserFactory.create()
            original_user_count = User.query.count()
            
            # Try to create duplicate user (should fail)
            try:
                UserFactory.create(username=user.username)
                assert False, "Should have raised an exception"
            except Exception:
                # Verify rollback - count should be unchanged
                assert User.query.count() == original_user_count
    
    def test_bulk_operations(self, app):
        """Test bulk database operations."""
        with app.app_context():
            # Create multiple users
            users = create_test_users(10)
            assert len(users) == 10
            assert User.query.count() >= 10
            
            # Create multiple posts for each user
            for user in users:
                create_test_posts(3, user)
            
            # Verify all posts were created
            assert Post.query.count() >= 30


class TestModelMethods:
    """Test model methods and utilities."""
    
    def test_user_to_dict_method(self, app):
        """Test User.to_dict() method."""
        with app.app_context():
            user = UserFactory.create()
            user_dict = user.to_dict()
            
            assert 'id' in user_dict
            assert 'username' in user_dict
            assert 'email' in user_dict
            assert 'full_name' in user_dict
            assert 'profile_image_url' in user_dict
            assert 'bio' in user_dict
            assert 'created_at' in user_dict
            assert 'updated_at' in user_dict
    
    def test_like_to_dict_method(self, app):
        """Test Like.to_dict() method."""
        with app.app_context():
            like = LikeFactory.create()
            like_dict = like.to_dict()
            
            assert 'id' in like_dict
            assert 'user_id' in like_dict
            assert 'likeable_id' in like_dict
            assert 'likeable_type' in like_dict
            assert 'created_at' in like_dict
    
    def test_follow_to_dict_method(self, app):
        """Test Follow.to_dict() method."""
        with app.app_context():
            follow = FollowFactory.create()
            follow_dict = follow.to_dict()
            
            assert 'id' in follow_dict
            assert 'user_id' in follow_dict
            assert 'user_followed_id' in follow_dict
            assert 'created_at' in follow_dict
    
    def test_user_password_hashing(self, app):
        """Test user password hashing and verification."""
        with app.app_context():
            user = UserFactory.create()
            test_password = "TestPassword123"
            
            # Set password
            user.password = test_password
            
            # Verify password
            assert user.check_password(test_password) is True
            assert user.check_password("WrongPassword") is False
    
    def test_like_class_methods(self, app):
        """Test Like model class methods."""
        with app.app_context():
            post = PostFactory.create()
            user = UserFactory.create()
            
            # Test user_liked_post
            assert Like.user_liked_post(user.id, post.id) is False
            
            # Create like
            LikeFactory.create(
                user_id=user.id,
                likeable_type='Post',
                likeable_id=post.id
            )
            
            # Test user_liked_post again
            assert Like.user_liked_post(user.id, post.id) is True
    
    def test_follow_class_methods(self, app):
        """Test Follow model class methods."""
        with app.app_context():
            user = UserFactory.create()
            followed_user = UserFactory.create()
            
            # Test is_following
            assert Follow.is_following(user.id, followed_user.id) is False
            
            # Create follow relationship
            FollowFactory.create(
                user_id=user.id,
                user_followed_id=followed_user.id
            )
            
            # Test is_following again
            assert Follow.is_following(user.id, followed_user.id) is True
            
            # Test get_followers_count
            assert Follow.get_followers_count(followed_user.id) == 1
            
            # Test get_following_count
            assert Follow.get_following_count(user.id) == 1 