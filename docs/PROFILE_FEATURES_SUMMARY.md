# User Profile Features - Implementation Summary

## Features Implemented

### ✅ 1. View Profile
- **Endpoint:** `GET /api/users/profile/current`
- **Description:** Get current user's profile information
- **Authentication:** Required
- **File:** `UserController.getCurrentProfile()` in `src/controllers/UserController.js`

### ✅ 2. Change Password
- **Endpoint:** `POST /api/users/password/change`
- **Description:** Update user password with current password verification
- **Authentication:** Required
- **Request Body:**
  - `currentPassword`: Current password (required)
  - `newPassword`: New password (min 6 chars)
  - `confirmPassword`: Must match newPassword
- **Files Modified:**
  - `src/controllers/UserController.js` - `changePassword()` method
  - `src/services/UserService.js` - `changePassword()` method
  - `src/utils/validation.js` - `changePasswordValidation()`

### ✅ 3. Update Avatar with S3 Storage
- **Endpoint:** `POST /api/users/avatar`
- **Description:** Upload avatar image to S3 and delete old avatar automatically
- **Authentication:** Required
- **Request:** multipart/form-data with `avatar` file field
- **Supported Formats:** JPEG, PNG, GIF, WebP
- **Max File Size:** 50MB (configurable)
- **Files Created:**
  - `src/services/S3Service.js` - S3 upload/delete operations
  - `src/middleware/upload.js` - Multer configuration
- **Files Modified:**
  - `src/controllers/UserController.js` - `updateAvatar()` method
  - `src/services/UserService.js` - `updateAvatar()` method
  - `src/routes/user.js` - Added avatar route and upload middleware

## Files Created

1. **`src/services/S3Service.js`**
   - S3 client initialization
   - `uploadAvatar()` - Upload file to S3
   - `deleteAvatar()` - Delete file from S3
   - `replaceAvatar()` - Upload new and delete old avatar
   - MIME type mapping for images

2. **`src/middleware/upload.js`**
   - Multer configuration for file uploads
   - In-memory storage (not disk)
   - File filter for image types
   - File size limits

3. **`docs/USER_PROFILE_FEATURES.md`**
   - Complete API documentation
   - Usage examples
   - S3 bucket setup guide
   - Frontend integration examples
   - Troubleshooting guide

## Files Modified

1. **`src/config/index.js`**
   - Added S3 region configuration
   - Added S3 bucket name
   - Added S3 avatar folder path

2. **`src/controllers/UserController.js`**
   - Added `getCurrentProfile()` method
   - Added `changePassword()` method
   - Added `updateAvatar()` method
   - Updated imports to include `changePasswordValidation`

3. **`src/services/UserService.js`**
   - Added imports for password utilities and S3Service
   - Added `getProfile()` method
   - Added `changePassword()` method
   - Added `updateAvatar()` method

4. **`src/routes/user.js`**
   - Added `GET /profile/current` route
   - Added `POST /password/change` route
   - Added `POST /avatar` route with multer middleware
   - Reordered routes for better organization

5. **`src/utils/validation.js`**
   - Added `changePasswordValidation()` schema
   - Added `updateAvatarValidation()` schema

6. **`src/events/EventTypes.js`**
   - Added `PASSWORD_CHANGED` event
   - Added `AVATAR_UPDATED` event

7. **`package.json`**
   - Added `@aws-sdk/client-s3` dependency

## New API Endpoints

### Profile Management
```
GET  /api/users/profile/current         - Get current user profile
GET  /api/users/profile/:userId         - Get user profile (existing)
PUT  /api/users/profile                 - Update profile (existing)
```

### Password Management
```
POST /api/users/password/change         - Change user password
```

### Avatar Management
```
POST /api/users/avatar                  - Upload/update user avatar
```

## New Events

```javascript
USER_EVENTS.PASSWORD_CHANGED {
  userId: string
}

USER_EVENTS.AVATAR_UPDATED {
  userId: string
  avatarUrl: string
}
```

## Environment Variables Required

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_REGION=us-east-1
S3_BUCKET_NAME=tixchat-avatars
S3_AVATAR_FOLDER=avatars

# File Upload (optional, has defaults)
MAX_FILE_SIZE=52428800  # 50MB
```

## Dependencies Added

```json
"@aws-sdk/client-s3": "^3.400.0"
```

## Testing Commands

### 1. Test View Profile
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/users/profile/current
```

### 2. Test Change Password
```bash
curl -X POST http://localhost:5000/api/users/password/change \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "oldPassword",
    "newPassword": "newPassword123",
    "confirmPassword": "newPassword123"
  }'
```

### 3. Test Upload Avatar
```bash
curl -X POST http://localhost:5000/api/users/avatar \
  -H "Authorization: Bearer <token>" \
  -F "avatar=@/path/to/image.jpg"
```

## Database Schema

No schema changes required. Uses existing `User` model fields:
- `avatar` (String): S3 URL
- `password` (String): Hashed password
- `userId` (String): User ID
- All other existing fields

## Security Features

1. **Password Security:**
   - Bcryptjs hashing (10 salt rounds)
   - Current password verification required
   - Password never returned in responses

2. **File Upload:**
   - Image type validation
   - File size validation
   - In-memory processing (no temp files)
   - S3 storage (not local filesystem)

3. **S3 Avatar Management:**
   - Unique keys per user and timestamp
   - Automatic old avatar cleanup
   - Public read access (optional)
   - CORS protection

## Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Update environment variables:**
   Add AWS S3 credentials to `.env`

3. **Setup S3 bucket (if not exists):**
   ```bash
   aws s3 mb s3://tixchat-avatars --region us-east-1
   ```

4. **Restart backend:**
   ```bash
   npm run dev
   ```

## API Response Examples

### Get Profile (200 OK)
```json
{
  "user": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john_doe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "avatar": "https://tixchat-avatars.s3.us-east-1.amazonaws.com/avatars/...",
    "bio": "Hello, this is my bio",
    "isOnline": true,
    "lastSeen": "2024-06-08T10:30:45.123Z",
    "createdAt": "2024-01-15T08:00:00.000Z",
    "updatedAt": "2024-06-08T10:30:45.123Z"
  }
}
```

### Change Password (200 OK)
```json
{
  "message": "Password changed successfully"
}
```

### Update Avatar (200 OK)
```json
{
  "message": "Avatar updated successfully",
  "user": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "avatar": "https://tixchat-avatars.s3.us-east-1.amazonaws.com/avatars/..."
  }
}
```

## Error Handling

- **400 Bad Request**: Validation errors, missing files, invalid formats
- **401 Unauthorized**: Wrong password, invalid JWT token
- **404 Not Found**: User not found
- **500 Internal Server Error**: S3 upload failures, database errors

## Next Steps

1. Install AWS SDK for S3 client:
   ```bash
   npm install
   ```

2. Create S3 bucket and configure:
   ```bash
   aws s3api create-bucket \
     --bucket tixchat-avatars \
     --region us-east-1
   ```

3. Add AWS credentials to `.env` file

4. Test endpoints with provided cURL commands

5. Integrate with frontend (see `USER_PROFILE_FEATURES.md` for examples)

## Notes

- Old avatars are deleted asynchronously (non-blocking)
- If old avatar deletion fails, it's logged but doesn't affect upload
- Password hashing happens during password change (bcryptjs)
- All endpoints require authentication (JWT token)
- Avatar URLs are permanently stored in DynamoDB
- S3 provides automatic redundancy and availability

---

**Last Updated:** June 8, 2024
**Version:** 1.0.0
