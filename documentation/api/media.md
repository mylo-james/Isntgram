# Media Upload API

> AWS S3 integration for profile images and post uploads

## Overview

The Media Upload API provides secure file upload functionality using AWS S3 for profile images and post content. All uploads are optimized for performance and include proper validation and error handling.

## Base URLs

```http
POST /api/aws/<id>                           # Upload profile image
POST /api/aws/post/<current_user_id>/<content>  # Upload post image and create post
```

## Authentication Required

- **Profile Image Upload**: Authentication required
- **Post Image Upload**: Authentication required

## File Requirements

- **Supported Formats**: PNG, JPEG, JPG
- **Maximum Size**: 10MB per file
- **Storage**: AWS S3 bucket 'isntgram'
- **CDN**: CloudFront for global delivery

---

## 1. Upload Profile Image

**Endpoint**: `POST /api/aws/<id>`

**Purpose**: Upload and update user's profile image

**Parameters**:
- **id**: User ID to update profile image for

**Request**: FormData with file field
```http
Content-Type: multipart/form-data
```

**Form Data**:
- **file**: Image file (PNG, JPEG, JPG)

**Success Response** (200):
```json
{
  "img": "https://isntgram.s3.us-east-2.amazonaws.com/FriJul171300242020.png"
}
```

**Error Responses**:

**User Not Found** (404):
```json
{
  "error": "User not found"
}
```

**Upload Error** (500):
```json
{
  "error": "Upload failed: Invalid file format"
}
```

**curl Example**:
```bash
curl -X POST http://localhost:8080/api/aws/1 \
  -H "Cookie: session=your_session_cookie" \
  -F "file=@profile_image.jpg"
```

---

## 2. Upload Post Image and Create Post

**Endpoint**: `POST /api/aws/post/<current_user_id>/<content>`

**Purpose**: Upload image and create a new post in one operation

**Parameters**:
- **current_user_id**: User ID creating the post
- **content**: Post caption (use 'null' for no caption)

**Request**: FormData with file field
```http
Content-Type: multipart/form-data
```

**Form Data**:
- **file**: Image file (PNG, JPEG, JPG)

**Success Response** (200):
```json
{
  "id": 123,
  "user_id": 1,
  "image_url": "https://isntgram.s3.us-east-2.amazonaws.com/FriJul171300242020.png",
  "caption": "Beautiful sunset at the beach! 🌅",
  "created_at": "2025-07-31T15:30:00Z",
  "updated_at": "2025-07-31T15:30:00Z"
}
```

**Error Responses**:

**Validation Error** (400):
```json
{
  "error": "Invalid file format. Only PNG and JPEG are supported."
}
```

**Upload Error** (500):
```json
{
  "error": "Failed to upload file to S3"
}
```

**curl Example**:
```bash
# Upload with caption
curl -X POST http://localhost:8080/api/aws/post/1/Beautiful%20sunset%20at%20the%20beach!%20🌅 \
  -H "Cookie: session=your_session_cookie" \
  -F "file=@post_image.jpg"

# Upload without caption
curl -X POST http://localhost:8080/api/aws/post/1/null \
  -H "Cookie: session=your_session_cookie" \
  -F "file=@post_image.jpg"
```

---

## Error Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Upload successful |
| 400 | Bad Request | Invalid file format or validation error |
| 404 | Not Found | User not found |
| 500 | Internal Server Error | Upload or server error |

## Common Errors

### Invalid File Format
```json
{
  "error": "Invalid file format. Only PNG and JPEG are supported."
}
```

**Cause**: Uploading unsupported file format

**Solution**: Use PNG, JPEG, or JPG files only

### File Too Large
```json
{
  "error": "File size exceeds maximum limit of 10MB"
}
```

**Cause**: File size exceeds 10MB limit

**Solution**: Compress or resize image before upload

### S3 Upload Failed
```json
{
  "error": "Failed to upload file to S3"
}
```

**Cause**: AWS S3 upload error

**Solution**: Check network connection and try again

## Integration Examples

### JavaScript/Frontend

```javascript
// Upload profile image
async function uploadProfileImage(userId, file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`/api/aws/${userId}`, {
    method: 'POST',
    headers: {
      'X-CSRFToken': getCsrfToken()
    },
    body: formData
  });
  
  const data = await response.json();
  if (response.ok) {
    return data.img;
  } else {
    throw new Error(data.error);
  }
}

// Upload post image and create post
async function uploadPostImage(userId, file, caption) {
  const formData = new FormData();
  formData.append('file', file);
  
  const encodedCaption = encodeURIComponent(caption || 'null');
  const response = await fetch(`/api/aws/post/${userId}/${encodedCaption}`, {
    method: 'POST',
    headers: {
      'X-CSRFToken': getCsrfToken()
    },
    body: formData
  });
  
  const data = await response.json();
  if (response.ok) {
    return data;
  } else {
    throw new Error(data.error);
  }
}

// File validation helper
function validateImageFile(file) {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file format. Only PNG and JPEG are supported.');
  }
  
  if (file.size > maxSize) {
    throw new Error('File size exceeds maximum limit of 10MB');
  }
  
  return true;
}
```

### Python Client

```python
import requests

def upload_profile_image(user_id, file_path):
    with open(file_path, 'rb') as f:
        files = {'file': f}
        response = requests.post(
            f'http://localhost:8080/api/aws/{user_id}',
            files=files,
            cookies={'session': 'your_session_cookie'}
        )
    
    if response.status_code == 200:
        return response.json()['img']
    else:
        raise Exception(response.json()['error'])

def upload_post_image(user_id, file_path, caption=None):
    with open(file_path, 'rb') as f:
        files = {'file': f}
        content = caption if caption else 'null'
        response = requests.post(
            f'http://localhost:8080/api/aws/post/{user_id}/{content}',
            files=files,
            cookies={'session': 'your_session_cookie'}
        )
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(response.json()['error'])
```

## Testing Examples

### Profile Image Upload Test
```bash
# Upload profile image
curl -X POST http://localhost:8080/api/aws/1 \
  -H "Cookie: session=$SESSION" \
  -F "file=@profile_image.jpg"
```

### Post Image Upload Test
```bash
# Upload post image with caption
curl -X POST "http://localhost:8080/api/aws/post/1/Beautiful%20sunset!" \
  -H "Cookie: session=$SESSION" \
  -F "file=@post_image.jpg"

# Upload post image without caption
curl -X POST http://localhost:8080/api/aws/post/1/null \
  -H "Cookie: session=$SESSION" \
  -F "file=@post_image.jpg"
```

## Performance Considerations

### Upload Optimization
- **File Compression**: Images are automatically optimized
- **CDN Delivery**: CloudFront for global image delivery
- **Progressive Loading**: Images load progressively for better UX

### Caching Strategy
- **S3 Caching**: CloudFront caches images globally
- **Browser Caching**: Proper cache headers for static assets
- **Image Optimization**: Automatic format conversion and compression

### Security Features
- **File Validation**: Strict file type and size validation
- **Virus Scanning**: AWS S3 includes built-in security scanning
- **Access Control**: All uploads require authentication
- **CSRF Protection**: All POST requests protected

## AWS S3 Configuration

### Bucket Settings
```yaml
Bucket Name: isntgram
Region: us-east-2
Public Access: Enabled for image delivery
CORS Configuration: Enabled for cross-origin requests
```

### File Naming Convention
```
Format: {timestamp}.png
Example: FriJul171300242020.png
```

### CDN Configuration
```yaml
Service: AWS CloudFront
Distribution: Global image delivery
Cache Policy: Optimized for images
```

---

**Next**: [Posts API](./posts.md) | [Users API](./users.md) | [Authentication API](./authentication.md)
