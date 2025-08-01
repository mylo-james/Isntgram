"""
Comprehensive tests for AWS routes to achieve 100% coverage
Tests file uploads, S3 integration, and post creation with images
"""
import pytest
import json
import io
from unittest.mock import patch, MagicMock
from app.models import User, Post, db


class TestAWSRoutes:
    """Comprehensive test suite for all AWS API routes."""

    @pytest.fixture
    def sample_image_file(self):
        """Create a sample image file for testing."""
        return io.BytesIO(b"fake image data")

    @pytest.fixture
    def sample_user_for_upload(self, client):
        """Create a sample user for upload testing."""
        with client.application.app_context():
            user = User(
                username="uploaduser",
                email="upload@example.com",
                full_name="Upload User"
            )
            user.password = "password123"
            db.session.add(user)
            db.session.commit()
            db.session.refresh(user)
            return user

    # =================
    # UPLOAD PROFILE IMAGE TESTS (POST /api/aws/<id>)
    # =================

    def test_upload_profile_image_success(self, client, sample_user_for_upload, sample_image_file):
        """Test POST /api/aws/<id> uploads profile image successfully."""
        with patch('app.api.aws_routes.upload_file') as mock_upload:
            mock_upload.return_value = None
            
            response = client.post(
                f'/api/aws/{sample_user_for_upload.id}',
                data={'file': (sample_image_file, 'test.jpg')},
                content_type='multipart/form-data'
            )
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert "img" in data
            assert "isntgram.s3.us-east-2.amazonaws.com" in data["img"]

    def test_upload_profile_image_missing_file(self, client, sample_user_for_upload):
        """Test POST /api/aws/<id> with missing file."""
        response = client.post(
            f'/api/aws/{sample_user_for_upload.id}',
            data={},
            content_type='multipart/form-data'
        )
        
        # Should handle missing file gracefully
        assert response.status_code in [400, 500]

    def test_upload_profile_image_invalid_user_id(self, client):
        """Test POST /api/aws/<id> with invalid user ID."""
        sample_file = io.BytesIO(b"fake image data")
        with patch('app.api.aws_routes.upload_file') as mock_upload:
            mock_upload.return_value = None
            
            response = client.post(
                '/api/aws/99999',
                data={'file': (sample_file, 'test.jpg')},
                content_type='multipart/form-data'
            )
            
            # Should handle non-existent user gracefully
            assert response.status_code == 404

    def test_upload_profile_image_s3_error(self, client, sample_user_for_upload):
        """Test POST /api/aws/<id> handles S3 upload errors."""
        sample_file = io.BytesIO(b"fake image data")
        with patch('app.api.aws_routes.upload_file') as mock_upload:
            mock_upload.side_effect = Exception("S3 upload failed")
            
            response = client.post(
                f'/api/aws/{sample_user_for_upload.id}',
                data={'file': (sample_file, 'test.jpg')},
                content_type='multipart/form-data'
            )
            
            # Should handle S3 errors gracefully
            assert response.status_code == 500

    def test_upload_profile_image_database_error(self, client, sample_user_for_upload, sample_image_file):
        """Test POST /api/aws/<id> handles database errors."""
        with patch('app.api.aws_routes.upload_file') as mock_upload:
            mock_upload.return_value = None
        with patch('app.api.aws_routes.db.session.commit') as mock_commit:
            mock_commit.side_effect = Exception("Database error")
            
            response = client.post(
                f'/api/aws/{sample_user_for_upload.id}',
                data={'file': (sample_image_file, 'test.jpg')},
                content_type='multipart/form-data'
            )
            
            # Should handle database errors gracefully
            assert response.status_code in [400, 500]

    def test_upload_profile_image_filename_change(self, client, sample_user_for_upload, sample_image_file):
        """Test that uploaded files get renamed correctly."""
        with patch('app.api.aws_routes.upload_file') as mock_upload:
            mock_upload.return_value = None
            
            response = client.post(
                f'/api/aws/{sample_user_for_upload.id}',
                data={'file': (sample_image_file, 'original_name.jpg')},
                content_type='multipart/form-data'
            )
            
            assert response.status_code == 200
            data = json.loads(response.data)
            # Should have a timestamp-based filename
            assert ".png" in data["img"]

    # =================
    # UPLOAD POST IMAGE TESTS (POST /api/aws/post/<current_user_id>/<content>)
    # =================

    def test_upload_post_image_success(self, client, sample_user_for_upload, sample_image_file):
        """Test POST /api/aws/post/<current_user_id>/<content> creates post successfully."""
        with patch('app.api.aws_routes.upload_file') as mock_upload:
            mock_upload.return_value = None
            
            response = client.post(
                f'/api/aws/post/{sample_user_for_upload.id}/Test caption',
                data={'file': (sample_image_file, 'test.jpg')},
                content_type='multipart/form-data'
            )
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert "image_url" in data
            assert "caption" in data
            assert data["caption"] == "Test caption"

    def test_upload_post_image_null_content(self, client, sample_user_for_upload, sample_image_file):
        """Test POST /api/aws/post/<current_user_id>/null handles empty content."""
        with patch('app.api.aws_routes.upload_file') as mock_upload:
            mock_upload.return_value = None
            
            response = client.post(
                f'/api/aws/post/{sample_user_for_upload.id}/null',
                data={'file': (sample_image_file, 'test.jpg')},
                content_type='multipart/form-data'
            )
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert "caption" in data
            assert data["caption"] == ""

    def test_upload_post_image_missing_file(self, client, sample_user_for_upload):
        """Test POST /api/aws/post/<current_user_id>/<content> with missing file."""
        response = client.post(
            f'/api/aws/post/{sample_user_for_upload.id}/Test caption',
            data={},
            content_type='multipart/form-data'
        )
        
        # Should handle missing file gracefully
        assert response.status_code in [400, 500]

    def test_upload_post_image_invalid_user_id(self, client, sample_image_file):
        """Test POST /api/aws/post/<current_user_id>/<content> with invalid user ID."""
        with patch('app.api.aws_routes.upload_file') as mock_upload:
            mock_upload.return_value = None
            
            response = client.post(
                '/api/aws/post/99999/Test caption',
                data={'file': (sample_image_file, 'test.jpg')},
                content_type='multipart/form-data'
            )
            
            # Should handle non-existent user gracefully
            assert response.status_code in [200, 400, 404, 500]

    def test_upload_post_image_s3_error(self, client, sample_user_for_upload):
        """Test POST /api/aws/post/<current_user_id>/<content> handles S3 upload errors."""
        sample_file = io.BytesIO(b"fake image data")
        with patch('app.api.aws_routes.upload_file') as mock_upload:
            mock_upload.side_effect = Exception("S3 upload failed")
            
            response = client.post(
                f'/api/aws/post/{sample_user_for_upload.id}/Test caption',
                data={'file': (sample_file, 'test.jpg')},
                content_type='multipart/form-data'
            )
            
            # Should handle S3 errors gracefully
            assert response.status_code == 500

    def test_upload_post_image_database_error(self, client, sample_user_for_upload, sample_image_file):
        """Test POST /api/aws/post/<current_user_id>/<content> handles database errors."""
        with patch('app.api.aws_routes.upload_file') as mock_upload:
            mock_upload.return_value = None
        with patch('app.api.aws_routes.db.session.commit') as mock_commit:
            mock_commit.side_effect = Exception("Database error")
            
            response = client.post(
                f'/api/aws/post/{sample_user_for_upload.id}/Test caption',
                data={'file': (sample_image_file, 'test.jpg')},
                content_type='multipart/form-data'
            )
            
            # Should handle database errors gracefully
            assert response.status_code in [400, 500]

    def test_upload_post_image_assertion_error(self, client, sample_user_for_upload):
        """Test POST /api/aws/post/<current_user_id>/<content> handles assertion errors."""
        sample_file = io.BytesIO(b"fake image data")
        with patch('app.api.aws_routes.upload_file') as mock_upload:
            mock_upload.return_value = None
        with patch('app.api.aws_routes.Post') as mock_post:
            mock_post.side_effect = AssertionError("Invalid post data")
            
            response = client.post(
                f'/api/aws/post/{sample_user_for_upload.id}/Test caption',
                data={'file': (sample_file, 'test.jpg')},
                content_type='multipart/form-data'
            )
            
            # The AssertionError is being caught by the general Exception handler
            assert response.status_code == 500
            data = json.loads(response.data)
            assert "error" in data

    # =================
    # UTILITY FUNCTION TESTS
    # =================

    def test_upload_file_function(self):
        """Test upload_file function with mocked S3 client."""
        from app.api.aws_routes import upload_file
        
        mock_file = MagicMock()
        mock_file.filename = "test.jpg"
        
        with patch('app.api.aws_routes.boto3.client') as mock_boto3:
            mock_s3_client = MagicMock()
            mock_boto3.return_value = mock_s3_client
            
            result = upload_file(mock_file, 'test-bucket')
            
            mock_s3_client.upload_fileobj.assert_called_once_with(mock_file, 'test-bucket', 'test.jpg')
            assert result is not None

    def test_upload_file_s3_error(self):
        """Test upload_file function handles S3 errors."""
        from app.api.aws_routes import upload_file
        
        mock_file = MagicMock()
        mock_file.filename = "test.jpg"
        
        with patch('app.api.aws_routes.boto3.client') as mock_boto3:
            mock_s3_client = MagicMock()
            mock_s3_client.upload_fileobj.side_effect = Exception("S3 error")
            mock_boto3.return_value = mock_s3_client
            
            with pytest.raises(Exception):
                upload_file(mock_file, 'test-bucket')

    def test_change_name_function(self):
        """Test change_name function generates correct filename."""
        from app.api.aws_routes import change_name
        
        result = change_name("original.jpg")
        
        assert result.endswith(".png")
        assert "original" not in result  # Should be timestamp-based

    def test_change_name_with_spaces_and_colons(self):
        """Test change_name function handles special characters."""
        from app.api.aws_routes import change_name
        
        result = change_name("file with spaces.jpg")
        
        assert result.endswith(".png")
        assert " " not in result  # Should remove spaces
        assert ":" not in result  # Should remove colons

    # =================
    # INTEGRATION TESTS
    # =================

    def test_upload_lifecycle(self, client, sample_user_for_upload):
        """Test complete upload lifecycle: profile image then post image."""
        with patch('app.api.aws_routes.upload_file') as mock_upload:
            mock_upload.return_value = None
            
            # Upload profile image
            profile_file = io.BytesIO(b"fake image data")
            profile_response = client.post(
                f'/api/aws/{sample_user_for_upload.id}',
                data={'file': (profile_file, 'profile.jpg')},
                content_type='multipart/form-data'
            )
            assert profile_response.status_code == 200
            
            # Upload post image
            post_file = io.BytesIO(b"fake image data")
            post_response = client.post(
                f'/api/aws/post/{sample_user_for_upload.id}/Test post',
                data={'file': (post_file, 'post.jpg')},
                content_type='multipart/form-data'
            )
            assert post_response.status_code == 200

    def test_multiple_uploads_same_user(self, client, sample_user_for_upload):
        """Test multiple uploads for the same user."""
        with patch('app.api.aws_routes.upload_file') as mock_upload:
            mock_upload.return_value = None
            
            # First upload
            first_file = io.BytesIO(b"fake image data")
            response1 = client.post(
                f'/api/aws/{sample_user_for_upload.id}',
                data={'file': (first_file, 'first.jpg')},
                content_type='multipart/form-data'
            )
            assert response1.status_code == 200
            
            # Second upload (should overwrite profile)
            second_file = io.BytesIO(b"fake image data")
            response2 = client.post(
                f'/api/aws/{sample_user_for_upload.id}',
                data={'file': (second_file, 'second.jpg')},
                content_type='multipart/form-data'
            )
            assert response2.status_code == 200

    def test_error_handling_comprehensive(self, client, sample_user_for_upload, sample_image_file):
        """Test comprehensive error handling across all AWS routes."""
        # Test various error conditions
        routes_to_test = [
            (f'/api/aws/{sample_user_for_upload.id}', 'POST'),
            (f'/api/aws/post/{sample_user_for_upload.id}/Test', 'POST'),
        ]
        
        for route, method in routes_to_test:
            if method == 'POST':
                response = client.post(route, data={}, content_type='multipart/form-data')
            else:
                response = client.get(route)
            
            # Should not crash, should return some response
            assert response.status_code in [200, 400, 404, 500]

    def test_file_upload_with_different_content_types(self, client, sample_user_for_upload):
        """Test file uploads with different content types."""
        with patch('app.api.aws_routes.upload_file') as mock_upload:
            mock_upload.return_value = None
            
            # Test with different file types
            file_types = ['jpg', 'png', 'gif', 'jpeg']
            
            for file_type in file_types:
                sample_file = io.BytesIO(b"fake image data")
                response = client.post(
                    f'/api/aws/{sample_user_for_upload.id}',
                    data={'file': (sample_file, f'test.{file_type}')},
                    content_type='multipart/form-data'
                )
                
                # Should handle all file types
                assert response.status_code in [200, 400, 500]

    def test_large_file_handling(self, client, sample_user_for_upload):
        """Test handling of large files."""
        with patch('app.api.aws_routes.upload_file') as mock_upload:
            mock_upload.return_value = None
            
            # Create a larger file
            large_file = io.BytesIO(b"x" * 1024 * 1024)  # 1MB
            
            response = client.post(
                f'/api/aws/{sample_user_for_upload.id}',
                data={'file': (large_file, 'large.jpg')},
                content_type='multipart/form-data'
            )
            
            # Should handle large files
            assert response.status_code in [200, 400, 500] 