# User Profile Features - Implementation Guide

## Overview

This document outlines the newly implemented user profile features:
1. **View Profile** - Get current user profile
2. **Change Password** - Update user password with validation
3. **Update Avatar** - Upload and manage user avatars with S3 storage

## Features

### 1. View Profile (GET /api/users/profile/current)

Get the current authenticated user's profile information.

**Endpoint:** `GET /api/users/profile/current`

**Authentication:** Required (JWT Token)

**Request:**
```bash
curl -H "Authorization: Bearer <token>" http://localhost:5000/api/users/profile/current
```

**Response (200 OK):**
```json
{
  "user": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john_doe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "avatar": "https://tixchat-avatars.s3.us-east-1.amazonaws.com/avatars/550e8400-e29b-41d4-a716-446655440000/1717827456789.jpg",
    "bio": "Hello, this is my bio",
    "isOnline": true,
    "lastSeen": "2024-06-08T10:30:45.123Z",
    "friends": ["user-id-2", "user-id-3"],
    "blockedUsers": [],
    "createdAt": "2024-01-15T08:00:00.000Z",
    "updatedAt": "2024-06-08T10:30:45.123Z"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "User not found"
}
```

### 2. Change Password (POST /api/users/password/change)

Update user password with current password verification.

**Endpoint:** `POST /api/users/password/change`

**Authentication:** Required (JWT Token)

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

**Validation Rules:**
- `currentPassword`: Required
- `newPassword`: Minimum 6 characters, required
- `confirmPassword`: Must match `newPassword`, required

**Response (200 OK):**
```json
{
  "message": "Password changed successfully"
}
```

**Error Responses:**

401 Unauthorized (Wrong current password):
```json
{
  "error": "Current password is incorrect"
}
```

400 Bad Request (Validation error):
```json
{
  "error": "Passwords do not match"
}
```

404 Not Found:
```json
{
  "error": "User not found"
}
```

**Example with cURL:**
```bash
curl -X POST http://localhost:5000/api/users/password/change \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "oldPassword123",
    "newPassword": "newPassword123",
    "confirmPassword": "newPassword123"
  }'
```

### 3. Update Avatar (POST /api/users/avatar)

Upload a new avatar image. The old avatar is automatically deleted from S3.

**Endpoint:** `POST /api/users/avatar`

**Authentication:** Required (JWT Token)

**Content-Type:** `multipart/form-data`

**Request:**
```bash
curl -X POST http://localhost:5000/api/users/avatar \
  -H "Authorization: Bearer <token>" \
  -F "avatar=@/path/to/image.jpg"
```

**Supported Image Formats:**
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

**Maximum File Size:** 50MB (configurable via `MAX_FILE_SIZE` env var)

**Response (200 OK):**
```json
{
  "message": "Avatar updated successfully",
  "user": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john_doe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "avatar": "https://tixchat-avatars.s3.us-east-1.amazonaws.com/avatars/550e8400-e29b-41d4-a716-446655440000/1717827456789.jpg",
    "bio": "Hello, this is my bio",
    "createdAt": "2024-01-15T08:00:00.000Z",
    "updatedAt": "2024-06-08T10:30:45.123Z"
  }
}
```

**Error Responses:**

400 Bad Request (No file uploaded):
```json
{
  "error": "No file uploaded"
}
```

400 Bad Request (Invalid file type):
```json
{
  "error": "Only image files are allowed (jpeg, png, gif, webp)"
}
```

404 Not Found:
```json
{
  "error": "User not found"
}
```

## S3 Avatar Storage

### How It Works

1. **Upload Flow:**
   - User uploads an image file
   - Multer stores the file in memory
   - File is uploaded to S3 with a unique key: `avatars/{userId}/{timestamp}.{extension}`
   - S3 URL is returned and stored in DynamoDB
   - Old avatar URL is extracted and deleted asynchronously

2. **Avatar URL Format:**
   ```
   https://{bucket-name}.s3.{region}.amazonaws.com/avatars/{userId}/{timestamp}.{extension}
   ```

3. **Old Avatar Deletion:**
   - When a new avatar is uploaded, the system extracts the old S3 key from the stored URL
   - Deletion happens asynchronously (non-blocking)
   - If deletion fails, it's logged but doesn't affect the upload operation

### Environment Variables

Add these to your `.env` file:

```env
# AWS S3 Configuration
AWS_S3_REGION=us-east-1
S3_BUCKET_NAME=tixchat-avatars
S3_AVATAR_FOLDER=avatars

# AWS Credentials (if not using IAM roles)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# File Upload
MAX_FILE_SIZE=52428800  # 50MB in bytes
```

### S3 Bucket Setup

1. Create an S3 bucket:
```bash
aws s3 mb s3://tixchat-avatars --region us-east-1
```

2. Enable public read access for avatars (optional, if you want public URLs):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::tixchat-avatars/avatars/*"
    }
  ]
}
```

3. Set bucket CORS policy:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["http://localhost:5173", "https://yourdomain.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

## Events

New events are emitted when user profile changes:

### PASSWORD_CHANGED Event
```javascript
userEvents.emit(USER_EVENTS.PASSWORD_CHANGED, {
  userId: user.userId,
})
```

### AVATAR_UPDATED Event
```javascript
userEvents.emit(USER_EVENTS.AVATAR_UPDATED, {
  userId: user.userId,
  avatarUrl: newAvatarUrl,
})
```

These can be subscribed to in socket handlers for real-time updates.

## Database Schema

The User model in DynamoDB includes these new fields:
- `avatar` (String): S3 URL of the user's avatar
- `password` (String): Hashed password (bcrypt)

No schema changes needed - the `avatar` field already existed.

## Implementation Files

- **Services:**
  - `src/services/S3Service.js` - S3 upload/delete operations
  - `src/services/UserService.js` - Updated with new methods

- **Controllers:**
  - `src/controllers/UserController.js` - Updated with new endpoints

- **Middleware:**
  - `src/middleware/upload.js` - Multer configuration for file uploads

- **Routes:**
  - `src/routes/user.js` - Updated with new endpoints

- **Utils:**
  - `src/utils/validation.js` - Added validation schemas

- **Events:**
  - `src/events/EventTypes.js` - Added PASSWORD_CHANGED and AVATAR_UPDATED events

## Testing

### Test Change Password
```bash
curl -X POST http://localhost:5000/api/users/password/change \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "oldPassword",
    "newPassword": "newPassword123",
    "confirmPassword": "newPassword123"
  }'
```

### Test Upload Avatar
```bash
# Using a test image
curl -X POST http://localhost:5000/api/users/avatar \
  -H "Authorization: Bearer eyJhbGc..." \
  -F "avatar=@test-image.jpg"
```

### Test Get Profile
```bash
curl -H "Authorization: Bearer eyJhbGc..." \
  http://localhost:5000/api/users/profile/current
```

## Security Considerations

1. **Password Security:**
   - Passwords are hashed using bcryptjs with 10 salt rounds
   - Password verification required before change
   - Old passwords are never returned in API responses

2. **File Upload:**
   - File type validation (only images)
   - File size limit (50MB default)
   - Files stored in memory, not on disk
   - S3 URLs are public but filename is protected by S3 bucket settings

3. **Avatar Management:**
   - Old avatars automatically cleaned up
   - S3 objects use user-specific keys for isolation
   - Public read access limited to specific paths

## Frontend Integration Example

### React with Axios

```javascript
// Change password
const changePassword = async (currentPassword, newPassword, confirmPassword) => {
  try {
    const response = await api.post('/users/password/change', {
      currentPassword,
      newPassword,
      confirmPassword,
    })
    console.log(response.data.message)
  } catch (error) {
    console.error(error.response.data.error)
  }
}

// Upload avatar
const uploadAvatar = async (file) => {
  try {
    const formData = new FormData()
    formData.append('avatar', file)
    
    const response = await api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    console.log(response.data.user.avatar)
  } catch (error) {
    console.error(error.response.data.error)
  }
}

// Get profile
const getProfile = async () => {
  try {
    const response = await api.get('/users/profile/current')
    console.log(response.data.user)
  } catch (error) {
    console.error(error.response.data.error)
  }
}
```

## Troubleshooting

### S3 Upload Fails
- Check AWS credentials in `.env`
- Verify S3 bucket exists and region is correct
- Check IAM permissions for S3 access
- Verify bucket name and region in config

### Avatar Not Showing
- Check S3 URL in response
- Verify S3 bucket has public read access
- Check CORS settings on S3 bucket
- Verify avatar file format is supported

### Password Change Fails
- Verify current password is correct
- Check password meets minimum length (6 characters)
- Verify passwords match in confirm field

### File Upload Fails
- Check file is an image (jpeg, png, gif, webp)
- Check file size is under 50MB limit
- Verify Content-Type header is multipart/form-data
- Check multer is properly configured

## Future Enhancements

1. **Avatar Optimization:**
   - Image resizing and compression
   - Multiple avatar sizes (thumbnail, full, etc.)
   - WebP conversion for better compression

2. **Security:**
   - Implement two-factor authentication
   - Add password strength requirements
   - Rate limiting on password changes

3. **Storage:**
   - CloudFront distribution for faster avatar delivery
   - Avatar versioning and history
   - Batch avatar processing

4. **User Features:**
   - Profile visibility settings
   - Avatar cropping before upload
   - Bio markdown support
