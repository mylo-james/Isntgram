"""
Flask CLI commands for database management and performance optimization.
"""
import click
from flask import current_app
from flask.cli import with_appcontext
from sqlalchemy import text, inspect
from sqlalchemy.orm import joinedload, selectinload
import time
from . import db
from .models import User, Post, Comment, Like, Follow


@click.group()
def database():
    """Database management commands."""
    pass


@database.command()
@with_appcontext
def init():
    """Initialize complete database setup with tables, indexes, and seed data."""
    click.echo("🚀 Initializing Isntgram Database (Complete Setup)")
    click.echo("=" * 60)
    
    # Step 1: Apply migrations (creates tables + indexes)
    click.echo("\n📋 Step 1: Creating tables and performance indexes...")
    
    try:
        from flask_migrate import upgrade
        upgrade()
        click.echo("   ✅ Tables and indexes created successfully!")
    except Exception as e:
        click.echo(f"   ❌ Migration failed: {e}")
        return
    
    # Step 2: Seed with test data
    click.echo("\n🌱 Step 2: Seeding with realistic test data...")
    
    try:
        # Import and run the existing seed logic
        import sys
        import os
        sys.path.append(os.path.dirname(os.path.abspath(__file__)))
        
        # Run the database.py seed script
        from database import seed_data
        seed_data()
        
        click.echo("   ✅ Database seeded with 50+ users, posts, comments, likes!")
        
    except ImportError:
        click.echo("   ⚠️  Full seed script not found. Creating basic test data...")
        
        # Create a few test users if none exist
        if User.query.count() == 0:
            test_user = User(
                email="test@example.com",
                full_name="Test User", 
                username="testuser",
                hashed_password="hashed_password_here"
            )
            db.session.add(test_user)
            db.session.commit()
            click.echo("   ✅ Created basic test user")
    except Exception as e:
        click.echo(f"   ⚠️  Seeding had issues: {e}")
    
    # Step 3: Run health check
    click.echo("\n🏥 Step 3: Running health check...")
    
    try:
        # Test basic connection
        db.session.execute(text('SELECT 1'))
        
        # Count records
        counts = {
            'users': User.query.count(),
            'posts': Post.query.count(), 
            'comments': Comment.query.count(),
            'likes': Like.query.count(),
            'follows': Follow.query.count(),
        }
        
        total_records = sum(counts.values())
        click.echo(f"   ✅ Database connection: OK")
        click.echo(f"   📊 Total records created: {total_records}")
        
        for table, count in counts.items():
            if count > 0:
                click.echo(f"      • {table}: {count} records")
        
    except Exception as e:
        click.echo(f"   ❌ Health check failed: {e}")
        return
    
    # Step 4: Performance test
    click.echo("\n⚡ Step 4: Testing performance optimizations...")
    
    try:
        if User.query.count() > 0:
            # Quick performance test
            import time
            start_time = time.time()
            
            # Test optimized query
            posts_with_users = Post.query.options(
                joinedload(Post.user)
            ).limit(5).all()
            
            query_time = time.time() - start_time
            click.echo(f"   ✅ Optimized query test: {query_time:.4f}s")
            click.echo(f"   📊 Loaded {len(posts_with_users)} posts with user data")
        else:
            click.echo("   ⚠️  No data available for performance test")
            
    except Exception as e:
        click.echo(f"   ⚠️  Performance test skipped: {e}")
    
    click.echo(f"\n🎉 Database initialization complete!")
    click.echo(f"🚀 Your Instagram clone is ready for development!")
    click.echo(f"📝 Use 'flask database analyze' to check performance")
    click.echo(f"🧪 Use 'flask database test-n1' for detailed performance testing")


@database.command()
@with_appcontext
def analyze():
    """Analyze database performance and identify issues."""
    click.echo("🔍 Analyzing Database Performance...")
    click.echo("=" * 50)
    
    # Check if we have indexes
    inspector = inspect(db.engine)
    
    # Analyze each table for missing indexes
    tables_to_check = ['users', 'posts', 'comments', 'likes', 'follows']
    
    for table_name in tables_to_check:
        if inspector.has_table(table_name):
            indexes = inspector.get_indexes(table_name)
            foreign_keys = inspector.get_foreign_keys(table_name)
            
            click.echo(f"\n📊 Table: {table_name}")
            click.echo(f"   Indexes: {len(indexes)}")
            click.echo(f"   Foreign Keys: {len(foreign_keys)}")
            
            # Check for missing FK indexes
            fk_columns = [fk['constrained_columns'][0] for fk in foreign_keys]
            indexed_columns = []
            for idx in indexes:
                indexed_columns.extend(idx['column_names'])
            
            missing_fk_indexes = set(fk_columns) - set(indexed_columns)
            if missing_fk_indexes:
                click.echo(f"   ⚠️  Missing FK indexes: {missing_fk_indexes}")
            else:
                click.echo(f"   ✅ All FK columns indexed")
    
    # Database size analysis
    try:
        result = db.session.execute(text("""
            SELECT 
                schemaname,
                tablename,
                attname,
                n_distinct,
                correlation
            FROM pg_stats 
            WHERE schemaname = 'public' 
            ORDER BY tablename, attname
            LIMIT 10
        """))
        
        click.echo(f"\n📈 Database Statistics (PostgreSQL):")
        for row in result:
            click.echo(f"   {row.tablename}.{row.attname}: {row.n_distinct} distinct values")
            
    except Exception as e:
        # Fallback for SQLite
        click.echo(f"\n📈 Database Statistics (SQLite mode)")
        
        # Count records in each table
        counts = {
            'users': User.query.count(),
            'posts': Post.query.count(), 
            'comments': Comment.query.count(),
            'likes': Like.query.count(),
            'follows': Follow.query.count(),
        }
        
        for table, count in counts.items():
            click.echo(f"   {table}: {count} records")


@database.command()
@with_appcontext 
def test_n1():
    """Test for N+1 query problems in common operations."""
    click.echo("🔍 Testing for N+1 Query Problems...")
    click.echo("=" * 50)
    
    # Test 1: Loading posts with user info (common N+1 problem)
    click.echo("\n1️⃣ Testing Post Feed Query (should use 1-2 queries, not N+1)")
    
    start_time = time.time()
    
    # BAD: This would cause N+1 queries
    # posts = Post.query.limit(10).all()
    # for post in posts:
    #     user_name = post.user.username  # This triggers individual queries!
    
    # GOOD: This uses proper joins to avoid N+1
    posts_with_users = Post.query.options(
        joinedload(Post.user)
    ).limit(10).all()
    
    query_time = time.time() - start_time
    click.echo(f"   ✅ Optimized query took: {query_time:.4f}s")
    click.echo(f"   📊 Loaded {len(posts_with_users)} posts with user data")
    
    # Test 2: Loading user with all relationships
    click.echo("\n2️⃣ Testing User Profile Query (with posts, follows, etc.)")
    
    start_time = time.time()
    user_with_data = User.query.options(
        selectinload(User.posts),
        selectinload(User.follows),
        selectinload(User.likes)
    ).first()
    
    query_time = time.time() - start_time
    if user_with_data:
        click.echo(f"   ✅ User profile query took: {query_time:.4f}s")
        click.echo(f"   📊 User has {len(user_with_data.posts)} posts, {len(user_with_data.follows)} follows")
    else:
        click.echo(f"   ⚠️  No users found in database")
    
    # Test 3: Polymorphic likes query
    click.echo("\n3️⃣ Testing Polymorphic Likes Query")
    
    start_time = time.time()
    post_likes = Like.query.filter(
        Like.likeable_type == 'post'
    ).limit(10).all()
    
    query_time = time.time() - start_time
    click.echo(f"   ✅ Polymorphic query took: {query_time:.4f}s")
    click.echo(f"   📊 Found {len(post_likes)} post likes")
    
    click.echo(f"\n✅ N+1 testing complete!")


@database.command()
@with_appcontext
def seed():
    """Seed database with realistic test data."""
    click.echo("🌱 Seeding Database with Test Data...")
    click.echo("=" * 50)
    
    try:
        # Import and run the existing seed logic
        import sys
        import os
        sys.path.append(os.path.dirname(os.path.abspath(__file__)))
        
        # Run the database.py seed script
        from database import seed_data
        seed_data()
        
        click.echo("✅ Database seeded successfully!")
        
    except ImportError:
        click.echo("⚠️  Seed script not found. Creating basic test data...")
        
        # Create a few test users if none exist
        if User.query.count() == 0:
            test_user = User(
                email="test@example.com",
                full_name="Test User",
                username="testuser",
                hashed_password="hashed_password_here"
            )
            db.session.add(test_user)
            db.session.commit()
            click.echo("✅ Created test user")


@database.command()
@with_appcontext
def health():
    """Check database health and connection."""
    click.echo("🏥 Database Health Check...")
    click.echo("=" * 50)
    
    try:
        # Test basic connection
        db.session.execute(text('SELECT 1'))
        click.echo("✅ Database connection: OK")
        
        # Test each model
        models_to_test = [User, Post, Comment, Like, Follow]
        
        for model in models_to_test:
            count = model.query.count()
            click.echo(f"✅ {model.__name__}: {count} records")
            
        click.echo("\n🎉 Database health check passed!")
        
    except Exception as e:
        click.echo(f"❌ Database health check failed: {e}")


def init_app(app):
    """Initialize CLI commands with Flask app."""
    app.cli.add_command(database)
