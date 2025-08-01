import factory
from factory import Faker
from app.models import User, Post, Comment, Like, Follow
from datetime import datetime, timedelta
import random


class UserFactory(factory.Factory):
    """Factory for creating User instances."""
    
    class Meta:
        model = User
    
    username = factory.Sequence(lambda n: f'user{n}')
    email = factory.LazyAttribute(lambda obj: f'{obj.username}@example.com')
    full_name = factory.Faker('name')
    bio = factory.Faker('text', max_nb_chars=100)
    profile_image_url = factory.Faker('image_url')
    
    @factory.post_generation
    def password(self, create, extracted, **kwargs):
        """Set password after user creation."""
        if not create:
            return
        
        if extracted:
            self.password = extracted  # Use property setter
        else:
            self.password = 'TestPassword123'  # Use property setter


class PostFactory(factory.Factory):
    """Factory for creating Post instances."""
    
    class Meta:
        model = Post
    
    caption = factory.Faker('text', max_nb_chars=200)
    image_url = factory.Faker('image_url')
    user = factory.SubFactory(UserFactory)
    created_at = factory.Faker('date_time_between', start_date='-30d', end_date='now')
    
    @factory.post_generation
    def user_id(self, create, extracted, **kwargs):
        """Set user_id after post creation."""
        if not create:
            return
        
        if extracted:
            self.user_id = extracted
        elif self.user:
            self.user_id = self.user.id


class CommentFactory(factory.Factory):
    """Factory for creating Comment instances."""
    
    class Meta:
        model = Comment
    
    content = factory.Faker('text', max_nb_chars=150)
    user = factory.SubFactory(UserFactory)
    post = factory.SubFactory(PostFactory)
    created_at = factory.Faker('date_time_between', start_date='-7d', end_date='now')
    
    @factory.post_generation
    def user_id(self, create, extracted, **kwargs):
        """Set user_id after comment creation."""
        if not create:
            return
        
        if extracted:
            self.user_id = extracted
        elif self.user:
            self.user_id = self.user.id
    
    @factory.post_generation
    def post_id(self, create, extracted, **kwargs):
        """Set post_id after comment creation."""
        if not create:
            return
        
        if extracted:
            self.post_id = extracted
        elif self.post:
            self.post_id = self.post.id


class LikeFactory(factory.Factory):
    """Factory for creating Like instances."""
    
    class Meta:
        model = Like
    
    user = factory.SubFactory(UserFactory)
    likeable_type = factory.Iterator(['Post', 'Comment'])  # Match the Literal type
    likeable_id = factory.Sequence(lambda n: n)  # Use sequence for unique IDs
    created_at = factory.Faker('date_time_between', start_date='-7d', end_date='now')
    
    @factory.post_generation
    def user_id(self, create, extracted, **kwargs):
        """Set user_id after like creation."""
        if not create:
            return
        
        if extracted:
            self.user_id = extracted
        elif self.user:
            self.user_id = self.user.id


class FollowFactory(factory.Factory):
    """Factory for creating Follow instances."""
    
    class Meta:
        model = Follow
    
    user = factory.SubFactory(UserFactory)
    user_followed_id = factory.Sequence(lambda n: n + 100)  # Use sequence for unique IDs
    created_at = factory.Faker('date_time_between', start_date='-30d', end_date='now')
    
    @factory.post_generation
    def user_id(self, create, extracted, **kwargs):
        """Set user_id after follow creation."""
        if not create:
            return
        
        if extracted:
            self.user_id = extracted
        elif self.user:
            self.user_id = self.user.id


# Specialized factories for common test scenarios
class AuthenticatedUserFactory(UserFactory):
    """Factory for creating users that are ready for authentication."""
    
    @classmethod
    def create_with_session(cls, **kwargs):
        """Create user and return with session data."""
        user = cls.create(**kwargs)
        return {
            'user': user,
            'session_data': {'user_id': user.id}
        }


class PostWithLikesFactory(PostFactory):
    """Factory for creating posts with likes."""
    
    @factory.post_generation
    def likes(self, create, extracted, **kwargs):
        """Add likes to the post."""
        if not create or not extracted:
            return
        
        num_likes = extracted if isinstance(extracted, int) else 3
        for _ in range(num_likes):
            LikeFactory.create(
                likeable_type='post',
                likeable_id=self.id,
                user=UserFactory()
            )


class PostWithCommentsFactory(PostFactory):
    """Factory for creating posts with comments."""
    
    @factory.post_generation
    def comments(self, create, extracted, **kwargs):
        """Add comments to the post."""
        if not create or not extracted:
            return
        
        num_comments = extracted if isinstance(extracted, int) else 3
        for _ in range(num_comments):
            CommentFactory.create(
                post_id=self.id,
                user=UserFactory()
            )


class UserWithPostsFactory(UserFactory):
    """Factory for creating users with posts."""
    
    @factory.post_generation
    def posts(self, create, extracted, **kwargs):
        """Add posts to the user."""
        if not create or not extracted:
            return
        
        num_posts = extracted if isinstance(extracted, int) else 5
        for _ in range(num_posts):
            PostFactory.create(user_id=self.id)


class UserWithFollowersFactory(UserFactory):
    """Factory for creating users with followers."""
    
    @factory.post_generation
    def followers(self, create, extracted, **kwargs):
        """Add followers to the user."""
        if not create or not extracted:
            return
        
        num_followers = extracted if isinstance(extracted, int) else 3
        for _ in range(num_followers):
            follower = UserFactory.create()
            FollowFactory.create(
                user_id=follower.id,
                user_followed_id=self.id
            )


class UserWithFollowingFactory(UserFactory):
    """Factory for creating users who follow others."""
    
    @factory.post_generation
    def following(self, create, extracted, **kwargs):
        """Add users that this user follows."""
        if not create or not extracted:
            return
        
        num_following = extracted if isinstance(extracted, int) else 3
        for _ in range(num_following):
            followed_user = UserFactory.create()
            FollowFactory.create(
                user_id=self.id,
                user_followed_id=followed_user.id
            )


# Utility functions for creating test data
def create_test_users(num_users=5):
    """Create a specified number of test users."""
    return [UserFactory.create() for _ in range(num_users)]


def create_test_posts(num_posts=10, user=None):
    """Create a specified number of test posts."""
    if user is None:
        user = UserFactory.create()
    
    return [PostFactory.create(user_id=user.id) for _ in range(num_posts)]


def create_test_comments(num_comments=5, post=None, user=None):
    """Create a specified number of test comments."""
    if post is None:
        post = PostFactory.create()
    if user is None:
        user = UserFactory.create()
    
    return [CommentFactory.create(post_id=post.id, user_id=user.id) for _ in range(num_comments)]


def create_test_likes(num_likes=3, likeable_type='post', likeable_id=None):
    """Create a specified number of test likes."""
    if likeable_id is None:
        if likeable_type == 'post':
            post = PostFactory.create()
            likeable_id = post.id
        elif likeable_type == 'comment':
            comment = CommentFactory.create()
            likeable_id = comment.id
    
    return [LikeFactory.create(
        likeable_type=likeable_type,
        likeable_id=likeable_id,
        user=UserFactory.create()
    ) for _ in range(num_likes)]


def create_test_follows(num_follows=3, user=None, followed_user=None):
    """Create a specified number of test follows."""
    if user is None:
        user = UserFactory.create()
    if followed_user is None:
        followed_user = UserFactory.create()
    
    return [FollowFactory.create(
        user_id=user.id,
        user_followed_id=followed_user.id
    ) for _ in range(num_follows)]


def create_complex_test_scenario():
    """Create a complex test scenario with users, posts, comments, likes, and follows."""
    # Create main user
    main_user = UserWithPostsFactory.create(posts=5)
    
    # Create other users
    other_users = create_test_users(3)
    
    # Create posts for other users
    for user in other_users:
        create_test_posts(3, user)
    
    # Add comments to main user's posts
    for post in main_user.posts:
        create_test_comments(2, post, random.choice(other_users))
    
    # Add likes to posts
    for post in main_user.posts:
        create_test_likes(2, 'post', post.id)
    
    # Create follow relationships
    for user in other_users:
        FollowFactory.create(user_id=main_user.id, user_followed_id=user.id)
        FollowFactory.create(user_id=user.id, user_followed_id=main_user.id)
    
    return {
        'main_user': main_user,
        'other_users': other_users,
        'all_posts': Post.query.all(),
        'all_comments': Comment.query.all(),
        'all_likes': Like.query.all(),
        'all_follows': Follow.query.all()
    }


# Factory for creating test data with specific attributes
class TestDataFactory:
    """Factory for creating comprehensive test data."""
    
    @staticmethod
    def create_user_with_profile(**kwargs):
        """Create a user with a complete profile."""
        return UserFactory.create(**kwargs)
    
    @staticmethod
    def create_post_with_interactions(**kwargs):
        """Create a post with likes and comments."""
        post = PostFactory.create(**kwargs)
        create_test_likes(3, 'post', post.id)
        create_test_comments(2, post)
        return post
    
    @staticmethod
    def create_user_with_followers_and_following(**kwargs):
        """Create a user with followers and following relationships."""
        user = UserFactory.create(**kwargs)
        
        # Create followers
        followers = create_test_users(3)
        for follower in followers:
            FollowFactory.create(user_id=follower.id, user_followed_id=user.id)
        
        # Create users to follow
        following_users = create_test_users(2)
        for following_user in following_users:
            FollowFactory.create(user_id=user.id, user_followed_id=following_user.id)
        
        return {
            'user': user,
            'followers': followers,
            'following': following_users
        }
    
    @staticmethod
    def create_feed_scenario():
        """Create a scenario suitable for testing feed functionality."""
        # Create users
        users = create_test_users(5)
        
        # Create posts for each user
        posts = []
        for user in users:
            user_posts = create_test_posts(3, user)
            posts.extend(user_posts)
        
        # Add interactions
        for post in posts:
            create_test_likes(random.randint(1, 5), 'post', post.id)
            create_test_comments(random.randint(0, 3), post)
        
        # Create follow relationships
        for i, user in enumerate(users):
            for j in range(i + 1, min(i + 3, len(users))):
                FollowFactory.create(
                    user_id=user.id,
                    user_followed_id=users[j].id
                )
        
        return {
            'users': users,
            'posts': posts,
            'all_interactions': {
                'likes': Like.query.all(),
                'comments': Comment.query.all(),
                'follows': Follow.query.all()
            }
        } 