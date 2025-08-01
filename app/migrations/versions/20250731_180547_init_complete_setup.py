"""init_complete_setup

Complete database initialization with tables, indexes, and optimizations.
This migration creates all tables with proper indexes from the start.

Revision ID: 64a3d2f9f607
Revises: 
Create Date: 2025-07-31 18:05:47.492052

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '64a3d2f9f607'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Create tables (this will auto-generate from models)
    
    # Create conversations table
    op.create_table('conversations',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('archived', sa.Boolean(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    
    # Create tags table
    op.create_table('tags',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('content', sa.String(length=2000), nullable=False),
    sa.Column('taggable_id', sa.Integer(), nullable=False),
    sa.Column('taggable_type', sa.String(length=10), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    
    # Create users table
    op.create_table('users',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('email', sa.String(length=255), nullable=False),
    sa.Column('full_name', sa.String(length=255), nullable=False),
    sa.Column('username', sa.String(length=255), nullable=False),
    sa.Column('hashed_password', sa.String(length=128), nullable=False),
    sa.Column('profile_image_url', sa.String(length=255), nullable=True),
    sa.Column('bio', sa.String(length=2000), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email'),
    sa.UniqueConstraint('username')
    )
    
    # Create follows table
    op.create_table('follows',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('user_followed_id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    
    # Create likes table
    op.create_table('likes',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('likeable_id', sa.Integer(), nullable=False),
    sa.Column('likeable_type', sa.String(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    
    # Create messages table
    op.create_table('messages',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('conversation_id', sa.Integer(), nullable=False),
    sa.Column('content', sa.String(length=2000), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.ForeignKeyConstraint(['conversation_id'], ['conversations.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    
    # Create posts table
    op.create_table('posts',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('image_url', sa.String(length=2000), nullable=False),
    sa.Column('caption', sa.String(length=2000), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    
    # Create user_conversations table  
    op.create_table('user_converstations',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('conversation_id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.ForeignKeyConstraint(['conversation_id'], ['conversations.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    
    # Create comments table
    op.create_table('comments',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('post_id', sa.Integer(), nullable=False),
    sa.Column('content', sa.String(length=2000), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.ForeignKeyConstraint(['post_id'], ['posts.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    
    # Create saved_posts table
    op.create_table('saved_posts',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('post_id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.ForeignKeyConstraint(['post_id'], ['posts.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )

    # 🚀 CREATE ALL CRITICAL PERFORMANCE INDEXES
    
    # Posts table indexes
    op.create_index('ix_posts_user_id', 'posts', ['user_id'])
    op.create_index('ix_posts_created_at', 'posts', ['created_at'])
    
    # Comments table indexes  
    op.create_index('ix_comments_user_id', 'comments', ['user_id'])
    op.create_index('ix_comments_post_id', 'comments', ['post_id'])
    op.create_index('ix_comments_post_created', 'comments', ['post_id', 'created_at'])
    
    # Likes table indexes
    op.create_index('ix_likes_user_id', 'likes', ['user_id'])
    op.create_index('ix_likes_polymorphic', 'likes', ['likeable_id', 'likeable_type'])
    op.create_index('ix_likes_user_polymorphic', 'likes', ['user_id', 'likeable_id', 'likeable_type'])
    
    # Follows table indexes
    op.create_index('ix_follows_user_id', 'follows', ['user_id'])
    op.create_index('ix_follows_user_followed_id', 'follows', ['user_followed_id'])
    op.create_index('ix_follows_both_users', 'follows', ['user_id', 'user_followed_id'])
    
    # Saved Posts table indexes
    op.create_index('ix_saved_posts_user_id', 'saved_posts', ['user_id']) 
    op.create_index('ix_saved_posts_post_id', 'saved_posts', ['post_id'])
    op.create_index('ix_saved_posts_user_post', 'saved_posts', ['user_id', 'post_id'])
    
    # Tags table indexes
    op.create_index('ix_tags_polymorphic', 'tags', ['taggable_id', 'taggable_type'])
    op.create_index('ix_tags_content', 'tags', ['content'])
    
    # Messages table indexes
    op.create_index('ix_messages_user_id', 'messages', ['user_id'])
    op.create_index('ix_messages_conversation_id', 'messages', ['conversation_id'])
    
    # User conversations table indexes
    op.create_index('ix_user_conversations_user_id', 'user_converstations', ['user_id'])
    op.create_index('ix_user_conversations_conversation_id', 'user_converstations', ['conversation_id'])


def downgrade():
    # Drop all indexes first
    op.drop_index('ix_user_conversations_conversation_id', 'user_converstations')
    op.drop_index('ix_user_conversations_user_id', 'user_converstations')
    op.drop_index('ix_messages_conversation_id', 'messages')
    op.drop_index('ix_messages_user_id', 'messages')
    op.drop_index('ix_tags_content', 'tags')
    op.drop_index('ix_tags_polymorphic', 'tags')
    op.drop_index('ix_saved_posts_user_post', 'saved_posts')
    op.drop_index('ix_saved_posts_post_id', 'saved_posts')
    op.drop_index('ix_saved_posts_user_id', 'saved_posts')
    op.drop_index('ix_follows_both_users', 'follows')
    op.drop_index('ix_follows_user_followed_id', 'follows')
    op.drop_index('ix_follows_user_id', 'follows')
    op.drop_index('ix_likes_user_polymorphic', 'likes')
    op.drop_index('ix_likes_polymorphic', 'likes')
    op.drop_index('ix_likes_user_id', 'likes')
    op.drop_index('ix_comments_post_created', 'comments')
    op.drop_index('ix_comments_post_id', 'comments')
    op.drop_index('ix_comments_user_id', 'comments')
    op.drop_index('ix_posts_created_at', 'posts')
    op.drop_index('ix_posts_user_id', 'posts')
    
    # Drop tables
    op.drop_table('saved_posts')
    op.drop_table('comments')
    op.drop_table('user_converstations')
    op.drop_table('posts')
    op.drop_table('messages')
    op.drop_table('likes')
    op.drop_table('follows')
    op.drop_table('users')
    op.drop_table('tags')
    op.drop_table('conversations')
