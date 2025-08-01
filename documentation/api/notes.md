# Notes API

> Activity feed and notifications with pagination

## Overview

The Notes API provides activity feed functionality that aggregates user interactions including follows, likes, and comments. The feed is optimized for performance with pagination and proper sorting.

## Base URLs

```http
GET /api/note/<id>/scroll/<length>  # Get user activity feed with pagination
```

## Authentication Required

- **Notes Feed**: Public endpoint (no authentication required)

## Feed Parameters

- **id**: User ID to get activity feed for
- **length**: Number of items already loaded (for pagination)

---

## 1. Get User Activity Feed

**Endpoint**: `GET /api/note/<id>/scroll/<length>`

**Purpose**: Get paginated activity feed for a specific user

**Parameters**:
- **id**: User ID to get activity feed for
- **length**: Number of items already loaded (for pagination)

**Success Response** (200):
```json
{
  "notes": [
    {
      "id": 1,
      "user_id": 2,
      "user_followed_id": 1,
      "created_at": "2025-07-31T16:30:00Z",
      "user": {
        "id": 2,
        "username": "jane_smith",
        "email": "jane@example.com",
        "full_name": "Jane Smith",
        "profile_image_url": "https://s3.amazonaws.com/isntgram/profile_2.jpg",
        "bio": "Photographer",
        "created_at": "2025-07-31T10:30:00Z",
        "updated_at": "2025-07-31T10:30:00Z"
      },
      "type": "follow"
    },
    {
      "id": 3,
      "user_id": 3,
      "likeable_type": "post",
      "likeable_id": 123,
      "created_at": "2025-07-31T16:45:00Z",
      "user": {
        "id": 3,
        "username": "mike_jones",
        "email": "mike@example.com",
        "full_name": "Mike Jones",
        "profile_image_url": "https://s3.amazonaws.com/isntgram/profile_3.jpg",
        "bio": "Travel enthusiast",
        "created_at": "2025-07-31T11:15:00Z",
        "updated_at": "2025-07-31T11:15:00Z"
      },
      "post": {
        "id": 123,
        "user_id": 1,
        "image_url": "https://s3.amazonaws.com/isntgram/image_123.jpg",
        "caption": "Beautiful sunset!",
        "created_at": "2025-07-31T15:30:00Z",
        "updated_at": "2025-07-31T15:30:00Z"
      },
      "type": "like"
    },
    {
      "id": 45,
      "user_id": 4,
      "post_id": 123,
      "content": "Amazing photo!",
      "created_at": "2025-07-31T17:00:00Z",
      "updated_at": "2025-07-31T17:00:00Z",
      "user": {
        "id": 4,
        "username": "sarah_wilson",
        "email": "sarah@example.com",
        "full_name": "Sarah Wilson",
        "profile_image_url": "https://s3.amazonaws.com/isntgram/profile_4.jpg",
        "bio": "Art lover",
        "created_at": "2025-07-31T12:00:00Z",
        "updated_at": "2025-07-31T12:00:00Z"
      },
      "post": {
        "id": 123,
        "user_id": 1,
        "image_url": "https://s3.amazonaws.com/isntgram/image_123.jpg",
        "caption": "Beautiful sunset!",
        "created_at": "2025-07-31T15:30:00Z",
        "updated_at": "2025-07-31T15:30:00Z"
      },
      "type": "comment"
    }
  ]
}
```

**Empty Feed Response** (200):
```json
{
  "notes": []
}
```

**curl Example**:
```bash
# Get first page of activity feed
curl "http://localhost:8080/api/note/1/scroll/0"

# Get next page (after loading 20 items)
curl "http://localhost:8080/api/note/1/scroll/20"
```

---

## Feed Item Types

### Follow Activity
```json
{
  "id": 1,
  "user_id": 2,
  "user_followed_id": 1,
  "created_at": "2025-07-31T16:30:00Z",
  "user": {
    "id": 2,
    "username": "jane_smith",
    "full_name": "Jane Smith",
    "profile_image_url": "https://s3.amazonaws.com/isntgram/profile_2.jpg"
  },
  "type": "follow"
}
```

### Like Activity
```json
{
  "id": 3,
  "user_id": 3,
  "likeable_type": "post",
  "likeable_id": 123,
  "created_at": "2025-07-31T16:45:00Z",
  "user": {
    "id": 3,
    "username": "mike_jones",
    "full_name": "Mike Jones",
    "profile_image_url": "https://s3.amazonaws.com/isntgram/profile_3.jpg"
  },
  "post": {
    "id": 123,
    "image_url": "https://s3.amazonaws.com/isntgram/image_123.jpg",
    "caption": "Beautiful sunset!"
  },
  "type": "like"
}
```

### Comment Activity
```json
{
  "id": 45,
  "user_id": 4,
  "post_id": 123,
  "content": "Amazing photo!",
  "created_at": "2025-07-31T17:00:00Z",
  "user": {
    "id": 4,
    "username": "sarah_wilson",
    "full_name": "Sarah Wilson",
    "profile_image_url": "https://s3.amazonaws.com/isntgram/profile_4.jpg"
  },
  "post": {
    "id": 123,
    "image_url": "https://s3.amazonaws.com/isntgram/image_123.jpg",
    "caption": "Beautiful sunset!"
  },
  "type": "comment"
}
```

---

## Error Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Feed retrieved successfully |
| 400 | Bad Request | Invalid parameters |
| 500 | Internal Server Error | Server error |

## Common Errors

### Invalid User ID
```json
{
  "error": "User not found"
}
```

**Cause**: User ID doesn't exist

**Solution**: Use valid user ID

### Server Error
```json
{
  "error": "Failed to retrieve feed"
}
```

**Cause**: Database or server error

**Solution**: Try again later

## Integration Examples

### JavaScript/Frontend

```javascript
// Get activity feed with pagination
async function getActivityFeed(userId, offset = 0) {
  const response = await fetch(`/api/note/${userId}/scroll/${offset}`);
  const data = await response.json();
  
  if (response.ok) {
    return data.notes;
  } else {
    throw new Error(data.error);
  }
}

// Display activity feed
function displayActivityFeed(notes) {
  const feedContainer = document.getElementById('activityFeed');
  
  if (notes.length === 0) {
    feedContainer.innerHTML = '<p>No activity yet</p>';
    return;
  }
  
  const html = notes.map(note => {
    switch (note.type) {
      case 'follow':
        return `
          <div class="activity-item follow">
            <img src="${note.user.profile_image_url || '/default-avatar.png'}" alt="${note.user.username}" />
            <div class="activity-content">
              <strong>${note.user.full_name}</strong> started following you
              <span class="time">${formatTime(note.created_at)}</span>
            </div>
          </div>
        `;
      
      case 'like':
        return `
          <div class="activity-item like">
            <img src="${note.user.profile_image_url || '/default-avatar.png'}" alt="${note.user.username}" />
            <div class="activity-content">
              <strong>${note.user.full_name}</strong> liked your post
              <span class="time">${formatTime(note.created_at)}</span>
              ${note.post ? `<div class="post-preview">${note.post.caption}</div>` : ''}
            </div>
          </div>
        `;
      
      case 'comment':
        return `
          <div class="activity-item comment">
            <img src="${note.user.profile_image_url || '/default-avatar.png'}" alt="${note.user.username}" />
            <div class="activity-content">
              <strong>${note.user.full_name}</strong> commented: "${note.content}"
              <span class="time">${formatTime(note.created_at)}</span>
              ${note.post ? `<div class="post-preview">${note.post.caption}</div>` : ''}
            </div>
          </div>
        `;
      
      default:
        return '';
    }
  }).join('');
  
  feedContainer.innerHTML = html;
}

// Format time for display
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
}

// Infinite scroll implementation
let currentOffset = 0;
let isLoading = false;

async function loadMoreActivity(userId) {
  if (isLoading) return;
  
  isLoading = true;
  try {
    const newNotes = await getActivityFeed(userId, currentOffset);
    if (newNotes.length > 0) {
      displayActivityFeed([...getCurrentNotes(), ...newNotes]);
      currentOffset += newNotes.length;
    }
  } catch (error) {
    console.error('Failed to load more activity:', error);
  } finally {
    isLoading = false;
  }
}

// Scroll event listener for infinite scroll
window.addEventListener('scroll', () => {
  if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1000) {
    loadMoreActivity(currentUserId);
  }
});
```

### Python Client

```python
import requests
from datetime import datetime

def get_activity_feed(user_id, offset=0):
    response = requests.get(
        f'http://localhost:8080/api/note/{user_id}/scroll/{offset}'
    )
    
    if response.status_code == 200:
        return response.json()['notes']
    else:
        raise Exception(response.json()['error'])

def format_activity_feed(notes):
    """Format activity feed for display"""
    formatted_notes = []
    
    for note in notes:
        if note['type'] == 'follow':
            formatted_notes.append({
                'message': f"{note['user']['full_name']} started following you",
                'user': note['user'],
                'time': note['created_at'],
                'type': 'follow'
            })
        elif note['type'] == 'like':
            formatted_notes.append({
                'message': f"{note['user']['full_name']} liked your post",
                'user': note['user'],
                'post': note.get('post'),
                'time': note['created_at'],
                'type': 'like'
            })
        elif note['type'] == 'comment':
            formatted_notes.append({
                'message': f"{note['user']['full_name']} commented: \"{note['content']}\"",
                'user': note['user'],
                'post': note.get('post'),
                'time': note['created_at'],
                'type': 'comment'
            })
    
    return formatted_notes

# Usage example
try:
    notes = get_activity_feed(1, 0)
    formatted_notes = format_activity_feed(notes)
    
    print(f"Found {len(formatted_notes)} activity items:")
    for note in formatted_notes:
        print(f"- {note['message']} ({note['time']})")
        
except Exception as e:
    print(f"Failed to load activity feed: {e}")
```

## Testing Examples

### Basic Feed Test
```bash
# Get first page of activity feed
curl "http://localhost:8080/api/note/1/scroll/0"

# Get next page
curl "http://localhost:8080/api/note/1/scroll/20"

# Get third page
curl "http://localhost:8080/api/note/1/scroll/40"
```

### Edge Case Tests
```bash
# Test with non-existent user
curl "http://localhost:8080/api/note/999/scroll/0"

# Test with negative offset
curl "http://localhost:8080/api/note/1/scroll/-20"

# Test with large offset
curl "http://localhost:8080/api/note/1/scroll/1000"
```

## Performance Considerations

### Database Optimization
- **Indexes**: Proper indexes on user_id, created_at, and activity types
- **Joins**: Optimized queries with proper joins
- **Pagination**: Efficient offset-based pagination

### Caching Strategy
- **Feed Cache**: Cache activity feed for 5 minutes
- **User Data**: Cache user information for quick display
- **Post Data**: Cache post information for feed items

### Security Features
- **Input Validation**: User ID and offset validation
- **SQL Injection Protection**: Parameterized queries
- **Rate Limiting**: Consider implementing rate limiting

## Feed Algorithm

### Current Implementation
- **Aggregation**: Combines follows, likes, and comments
- **Sorting**: Sorted by created_at in descending order
- **Pagination**: 20 items per page
- **Performance**: Optimized with database indexes

### Feed Types
1. **Follows**: When someone follows the user
2. **Likes**: When someone likes the user's posts or comments
3. **Comments**: When someone comments on the user's posts

---

**Next**: [Users API](./users.md) | [Posts API](./posts.md) | [Social Features API](./social-features.md) 