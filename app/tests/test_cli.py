"""
Test suite for CLI commands
Tests Flask CLI commands and database operations
"""
import pytest
import os
import tempfile
from unittest.mock import Mock, patch, MagicMock
from click.testing import CliRunner
from app.cli import (
    database,
    init,
    analyze,
    test_n1,
    seed,
    health,
    init_app
)
from app import app as flask_app


class TestCLICommands:
    """Test cases for CLI commands."""

    def setup_method(self):
        """Set up test environment."""
        self.app = flask_app
        self.runner = CliRunner()
        init_app(self.app)

    def test_init_success(self):
        """Test successful database initialization."""
        with patch('app.cli.upgrade') as mock_upgrade:
            with patch('app.cli.seed_data') as mock_seed:
                with patch('app.cli.db.session.execute') as mock_execute:
                    with patch('app.models.User.query.count') as mock_count:
                        mock_count.return_value = 10
                        mock_execute.return_value = None

                        result = self.runner.invoke(database, ['init'])
                        
                        assert result.exit_code == 0
                        assert '🚀 Initializing Isntgram Database' in result.output

    def test_init_failure(self):
        """Test database initialization failure."""
        with patch('app.cli.upgrade') as mock_upgrade:
            mock_upgrade.side_effect = Exception("Migration failed")

            result = self.runner.invoke(database, ['init'])
            
            assert result.exit_code == 0  # CLI doesn't exit on error
            assert '❌ Migration failed' in result.output

    def test_analyze_success(self):
        """Test successful database analysis."""
        with patch('app.cli.inspect') as mock_inspect:
            mock_inspector = Mock()
            mock_inspector.has_table.return_value = True
            mock_inspector.get_indexes.return_value = [{'column_names': ['id']}]
            mock_inspector.get_foreign_keys.return_value = []
            mock_inspect.return_value = mock_inspector

            with patch('app.cli.db.session.execute') as mock_execute:
                mock_execute.side_effect = Exception("PostgreSQL not available")

                result = self.runner.invoke(database, ['analyze'])
                
                assert result.exit_code == 0
                assert '🔍 Analyzing Database Performance' in result.output

    def test_analyze_failure(self):
        """Test database analysis failure."""
        with patch('app.cli.inspect') as mock_inspect:
            mock_inspect.side_effect = Exception("Inspection failed")

            result = self.runner.invoke(database, ['analyze'])
            
            assert result.exit_code == 0  # CLI doesn't exit on error

    def test_seed_success(self):
        """Test successful database seeding."""
        with patch('app.cli.seed_data') as mock_seed:
            result = self.runner.invoke(database, ['seed'])
            
            assert result.exit_code == 0
            assert '🌱 Seeding Database with Test Data' in result.output

    def test_seed_failure(self):
        """Test database seeding failure."""
        with patch('app.cli.seed_data') as mock_seed:
            mock_seed.side_effect = ImportError("Seed script not found")

            result = self.runner.invoke(database, ['seed'])
            
            assert result.exit_code == 0
            assert '⚠️  Seed script not found' in result.output

    def test_health_success(self):
        """Test successful health check."""
        with patch('app.cli.db.session.execute') as mock_execute:
            with patch('app.models.User.query.count') as mock_count:
                mock_count.return_value = 5
                mock_execute.return_value = None

                result = self.runner.invoke(database, ['health'])
                
                assert result.exit_code == 0
                assert '🏥 Database Health Check' in result.output

    def test_health_failure(self):
        """Test health check failure."""
        with patch('app.cli.db.session.execute') as mock_execute:
            mock_execute.side_effect = Exception("Connection failed")

            result = self.runner.invoke(database, ['health'])
            
            assert result.exit_code == 0
            assert '❌ Database health check failed' in result.output

    def test_test_n1_success(self):
        """Test successful N+1 query testing."""
        with patch('app.models.User.query.options') as mock_options:
            with patch('app.models.Post.query.options') as mock_post_options:
                with patch('app.models.Like.query.filter') as mock_like_filter:
                    mock_options.return_value.first.return_value = Mock()
                    mock_post_options.return_value.limit.return_value.all.return_value = [Mock()]
                    mock_like_filter.return_value.limit.return_value.all.return_value = [Mock()]

                    result = self.runner.invoke(database, ['test-n1'])
                    
                    assert result.exit_code == 0
                    assert '🔍 Testing for N+1 Query Problems' in result.output

    def test_test_n1_failure(self):
        """Test N+1 query testing failure."""
        with patch('app.models.Post.query.options') as mock_options:
            mock_options.side_effect = Exception("Query failed")

            result = self.runner.invoke(database, ['test-n1'])
            
            assert result.exit_code == 0  # CLI doesn't exit on error


class TestCLIIntegration:
    """Integration tests for CLI functionality."""

    def setup_method(self):
        """Set up test environment."""
        self.app = flask_app
        self.runner = CliRunner()
        init_app(self.app)

    def test_full_database_init_flow(self):
        """Test complete database initialization flow."""
        with patch('app.cli.upgrade') as mock_upgrade:
            with patch('app.cli.seed_data') as mock_seed:
                with patch('app.cli.db.session.execute') as mock_execute:
                    with patch('app.models.User.query.count') as mock_count:
                        mock_count.return_value = 10
                        mock_execute.return_value = None

                        result = self.runner.invoke(database, ['init'])
                        
                        assert result.exit_code == 0
                        assert '🚀 Initializing Isntgram Database' in result.output
                        assert '🎉 Database initialization complete' in result.output

    def test_full_health_check_flow(self):
        """Test complete health check flow."""
        with patch('app.cli.db.session.execute') as mock_execute:
            with patch('app.models.User.query.count') as mock_user_count:
                with patch('app.models.Post.query.count') as mock_post_count:
                    with patch('app.models.Comment.query.count') as mock_comment_count:
                        with patch('app.models.Like.query.count') as mock_like_count:
                            with patch('app.models.Follow.query.count') as mock_follow_count:
                                mock_user_count.return_value = 5
                                mock_post_count.return_value = 10
                                mock_comment_count.return_value = 20
                                mock_like_count.return_value = 15
                                mock_follow_count.return_value = 8
                                mock_execute.return_value = None

                                result = self.runner.invoke(database, ['health'])
                                
                                assert result.exit_code == 0
                                assert '🏥 Database Health Check' in result.output
                                assert '🎉 Database health check passed' in result.output

    def test_cli_command_help(self):
        """Test CLI command help output."""
        result = self.runner.invoke(database, ['--help'])
        
        assert result.exit_code == 0
        assert 'Database management commands' in result.output

    def test_cli_subcommand_help(self):
        """Test CLI subcommand help output."""
        result = self.runner.invoke(database, ['init', '--help'])
        
        assert result.exit_code == 0
        assert 'Initialize complete database setup' in result.output


class TestCLIErrorHandling:
    """Test cases for CLI error handling."""

    def setup_method(self):
        """Set up test environment."""
        self.app = flask_app
        self.runner = CliRunner()
        init_app(self.app)

    def test_invalid_command(self):
        """Test handling of invalid command."""
        result = self.runner.invoke(database, ['invalid-command'])
        
        assert result.exit_code != 0

    def test_database_connection_failure(self):
        """Test handling of database connection failure."""
        with patch('app.cli.db.session.execute') as mock_execute:
            mock_execute.side_effect = Exception("Database connection failed")

            result = self.runner.invoke(database, ['health'])
            
            assert result.exit_code == 0  # CLI doesn't exit on error
            assert '❌ Database health check failed' in result.output

    def test_migration_failure_handling(self):
        """Test handling of migration failure."""
        with patch('app.cli.upgrade') as mock_upgrade:
            mock_upgrade.side_effect = Exception("Migration failed")

            result = self.runner.invoke(database, ['init'])
            
            assert result.exit_code == 0  # CLI doesn't exit on error
            assert '❌ Migration failed' in result.output

    def test_seed_script_not_found(self):
        """Test handling when seed script is not found."""
        with patch('app.cli.seed_data') as mock_seed:
            mock_seed.side_effect = ImportError("No module named 'database'")

            result = self.runner.invoke(database, ['seed'])
            
            assert result.exit_code == 0
            assert '⚠️  Seed script not found' in result.output

    def test_postgresql_stats_fallback(self):
        """Test fallback to SQLite when PostgreSQL stats are not available."""
        with patch('app.cli.inspect') as mock_inspect:
            mock_inspector = Mock()
            mock_inspector.has_table.return_value = True
            mock_inspector.get_indexes.return_value = []
            mock_inspector.get_foreign_keys.return_value = []
            mock_inspect.return_value = mock_inspector

            with patch('app.cli.db.session.execute') as mock_execute:
                mock_execute.side_effect = Exception("PostgreSQL not available")

                result = self.runner.invoke(database, ['analyze'])
                
                assert result.exit_code == 0
                assert '📈 Database Statistics (SQLite mode)' in result.output 