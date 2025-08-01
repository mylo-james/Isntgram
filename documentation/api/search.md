# Search API

> User search functionality with username-based queries

## Overview

The Search API provides user search capabilities using username-based queries. The search is optimized for performance and includes proper error handling.

## Base URLs

```http
GET /api/query?query=<search_term>  # Search for users by username
```

## Authentication Required

- **Search**: Public endpoint (no authentication required)

## Search Parameters

- **query**: Search term to find users by username (case-insensitive)

---

## 1. Search Users

**Endpoint**: `GET /api/query`

**Purpose**: Search for users by username using case-insensitive matching

**Query Parameters**:
- **query**: Search term (required)

**Success Response** (200):
```json
{
  "results": [
    {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "full_name": "John Doe",
      "profile_image_url": "https://s3.amazonaws.com/isntgram/profile_1.jpg",
      "bio": "Software developer",
      "created_at": "2025-07-31T10:30:00Z",
      "updated_at": "2025-07-31T10:30:00Z"
    },
    {
      "id": 2,
      "username": "johnny_smith",
      "email": "johnny@example.com",
      "full_name": "Johnny Smith",
      "profile_image_url": "https://s3.amazonaws.com/isntgram/profile_2.jpg",
      "bio": "Photographer",
      "created_at": "2025-07-31T11:15:00Z",
      "updated_at": "2025-07-31T11:15:00Z"
    }
  ]
}
```

**No Results Response** (200):
```json
{
  "results": []
}
```

**curl Example**:
```bash
# Search for users with "john" in username
curl "http://localhost:8080/api/query?query=john"

# Search for specific username
curl "http://localhost:8080/api/query?query=john_doe"
```

---

## Error Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Search completed successfully |
| 400 | Bad Request | Missing query parameter |
| 500 | Internal Server Error | Server error |

## Common Errors

### Missing Query Parameter
```json
{
  "error": "Query parameter is required"
}
```

**Cause**: No query parameter provided

**Solution**: Include query parameter in request

### Server Error
```json
{
  "error": "Search failed"
}
```

**Cause**: Database or server error

**Solution**: Try again later

## Integration Examples

### JavaScript/Frontend

```javascript
// Search for users
async function searchUsers(query) {
  const response = await fetch(`/api/query?query=${encodeURIComponent(query)}`);
  const data = await response.json();
  
  if (response.ok) {
    return data.results;
  } else {
    throw new Error(data.error);
  }
}

// Search with debouncing
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Debounced search function
const debouncedSearch = debounce(searchUsers, 300);

// Usage in search input
document.getElementById('searchInput').addEventListener('input', async (e) => {
  const query = e.target.value.trim();
  
  if (query.length < 2) {
    // Clear results for short queries
    displayResults([]);
    return;
  }
  
  try {
    const results = await debouncedSearch(query);
    displayResults(results);
  } catch (error) {
    console.error('Search failed:', error);
    displayError('Search failed. Please try again.');
  }
});

function displayResults(results) {
  const resultsContainer = document.getElementById('searchResults');
  
  if (results.length === 0) {
    resultsContainer.innerHTML = '<p>No users found</p>';
    return;
  }
  
  const html = results.map(user => `
    <div class="search-result">
      <img src="${user.profile_image_url || '/default-avatar.png'}" alt="${user.username}" />
      <div class="user-info">
        <h4>${user.username}</h4>
        <p>${user.full_name}</p>
        ${user.bio ? `<p class="bio">${user.bio}</p>` : ''}
      </div>
    </div>
  `).join('');
  
  resultsContainer.innerHTML = html;
}
```

### Python Client

```python
import requests

def search_users(query):
    response = requests.get(
        'http://localhost:8080/api/query',
        params={'query': query}
    )
    
    if response.status_code == 200:
        return response.json()['results']
    else:
        raise Exception(response.json()['error'])

# Usage example
try:
    results = search_users('john')
    print(f"Found {len(results)} users:")
    for user in results:
        print(f"- {user['username']} ({user['full_name']})")
except Exception as e:
    print(f"Search failed: {e}")
```

## Testing Examples

### Basic Search Test
```bash
# Search for users with "john"
curl "http://localhost:8080/api/query?query=john"

# Search for specific username
curl "http://localhost:8080/api/query?query=john_doe"

# Search with special characters
curl "http://localhost:8080/api/query?query=john%20doe"
```

### Advanced Search Test
```bash
# Test with empty query
curl "http://localhost:8080/api/query"

# Test with very long query
curl "http://localhost:8080/api/query?query=verylongusernamequery"

# Test with special characters
curl "http://localhost:8080/api/query?query=user@domain"
```

## Performance Considerations

### Database Optimization
- **Index**: Username field is indexed for fast searches
- **Case Insensitive**: Uses `ilike` for case-insensitive matching
- **Pattern Matching**: Uses `%` wildcards for partial matches

### Caching Strategy
- **Search Results**: Consider caching frequent searches
- **User Data**: Cache user information for quick display
- **Query Optimization**: Limit results for performance

### Security Features
- **Input Validation**: Query parameters are validated
- **SQL Injection Protection**: Uses parameterized queries
- **Rate Limiting**: Consider implementing rate limiting for search

## Search Algorithm

### Current Implementation
- **Pattern**: Uses SQL `ILIKE` with `%query%` pattern
- **Case**: Case-insensitive matching
- **Partial**: Matches partial usernames
- **Performance**: Optimized with database indexes

### Example Queries
```sql
-- Search for "john" matches:
-- - john_doe
-- - johnny_smith
-- - user_john
-- - JOHN_DOE (case insensitive)
```

## Future Enhancements

### Planned Features
- **Full-text Search**: Search across username, full_name, and bio
- **Fuzzy Matching**: Handle typos and similar usernames
- **Search Filters**: Filter by user activity, followers, etc.
- **Search Suggestions**: Auto-complete functionality

### Performance Improvements
- **Elasticsearch Integration**: For advanced search capabilities
- **Search Indexing**: Real-time search index updates
- **Result Ranking**: Relevance-based result ordering

---

**Next**: [Users API](./users.md) | [Posts API](./posts.md) | [Authentication API](./authentication.md) 