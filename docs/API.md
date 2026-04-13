# TixChat - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require the `Authorization` header with JWT token:
```
Authorization: Bearer <access_token>
```

---

## Authentication Endpoints

### Register
```
POST /auth/register
```

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "fullName": "John Doe"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "_id": "user_id",
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe"
  }
}
```

---

### Login
```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "user_id",
      "username": "johndoe",
      "email": "john@example.com",
      "fullName": "John Doe",
      "avatar": null
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

---

### Logout
```
POST /auth/logout
```
**Protected:** ✅ Yes

**Response:**
```json
{
  "message": "Logout successful"
}
```

---

### Refresh Token
```
POST /auth/refresh-token
```

**Request Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

**Response:**
```json
{
  "accessToken": "new_jwt_token"
}
```

---

### Get Current User
```
GET /auth/me
```
**Protected:** ✅ Yes

**Response:**
```json
{
  "user": {
    "_id": "user_id",
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "avatar": "url",
    "bio": "My bio",
    "isOnline": true,
    "lastSeen": "2024-01-01T12:00:00Z",
    "friends": [...],
    "blockedUsers": [...]
  }
}
```

---

## User Endpoints

### Get User Profile
```
GET /users/profile/:userId
```
**Protected:** ✅ Yes

**Response:**
```json
{
  "user": {
    "_id": "user_id",
    "username": "johndoe",
    "fullName": "John Doe",
    "avatar": "url",
    "bio": "My bio",
    "isOnline": true,
    "lastSeen": "2024-01-01T12:00:00Z",
    "friends": [...]
  }
}
```

---

### Update Profile
```
PUT /users/profile
```
**Protected:** ✅ Yes

**Request Body:**
```json
{
  "fullName": "John Doe",
  "bio": "Updated bio",
  "avatar": "image_url"
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "user": {...}
}
```

---

### Search Users
```
GET /users/search?q=john&limit=10
```
**Protected:** ✅ Yes

**Response:**
```json
{
  "users": [
    {
      "_id": "user_id",
      "username": "johndoe",
      "fullName": "John Doe",
      "avatar": "url",
      "isOnline": true
    }
  ]
}
```

---

### Get Friends List
```
GET /users/friends
```
**Protected:** ✅ Yes

**Response:**
```json
{
  "friends": [
    {
      "_id": "friend_id",
      "username": "janedoe",
      "fullName": "Jane Doe",
      "avatar": "url",
      "isOnline": true
    }
  ]
}
```

---

### Add Friend
```
POST /users/friend/add
```
**Protected:** ✅ Yes

**Request Body:**
```json
{
  "friendId": "friend_user_id"
}
```

**Response:**
```json
{
  "message": "Friend added successfully",
  "user": {...}
}
```

---

### Remove Friend
```
POST /users/friend/remove
```
**Protected:** ✅ Yes

**Request Body:**
```json
{
  "friendId": "friend_user_id"
}
```

---

### Get Online Users
```
GET /users/online
```
**Protected:** ✅ Yes

**Response:**
```json
{
  "users": [...]
}
```

---

### Block User
```
POST /users/block
```
**Protected:** ✅ Yes

**Request Body:**
```json
{
  "userId": "user_id"
}
```

---

### Unblock User
```
POST /users/unblock
```
**Protected:** ✅ Yes

**Request Body:**
```json
{
  "userId": "user_id"
}
```

---

## Conversation Endpoints

### Create Conversation
```
POST /conversations
```
**Protected:** ✅ Yes

**Request Body:**
```json
{
  "type": "1-1",
  "participantIds": ["user_id"],
  "name": null
}
```

Or for group:
```json
{
  "type": "group",
  "participantIds": ["user_id1", "user_id2"],
  "name": "Group Name"
}
```

**Response:**
```json
{
  "message": "Conversation created successfully",
  "conversation": {
    "_id": "conv_id",
    "type": "1-1",
    "participants": [...],
    "lastMessage": {...},
    "lastMessageAt": "2024-01-01T12:00:00Z"
  }
}
```

---

### Get User Conversations
```
GET /conversations?limit=20&skip=0
```
**Protected:** ✅ Yes

**Response:**
```json
{
  "conversations": [...]
}
```

---

### Get Single Conversation
```
GET /conversations/:conversationId
```
**Protected:** ✅ Yes

**Response:**
```json
{
  "conversation": {...}
}
```

---

### Update Conversation
```
PUT /conversations/:conversationId
```
**Protected:** ✅ Yes

**Request Body:**
```json
{
  "name": "New Name",
  "avatar": "url",
  "description": "Group description"
}
```

---

### Add Participant
```
POST /conversations/:conversationId/participants
```
**Protected:** ✅ Yes

**Request Body:**
```json
{
  "participantId": "user_id"
}
```

---

### Remove Participant
```
DELETE /conversations/:conversationId/participants/:participantId
```
**Protected:** ✅ Yes

---

### Archive Conversation
```
POST /conversations/:conversationId/archive
```
**Protected:** ✅ Yes

---

### Delete Conversation
```
DELETE /conversations/:conversationId
```
**Protected:** ✅ Yes

---

### Search Conversations
```
GET /conversations/search?q=group&limit=10
```
**Protected:** ✅ Yes

---

## Message Endpoints

### Send Message
```
POST /messages
```
**Protected:** ✅ Yes

**Request Body:**
```json
{
  "conversationId": "conv_id",
  "content": "Hello!",
  "replyTo": "message_id"
}
```

**Response:**
```json
{
  "message": "Message sent successfully",
  "data": {
    "_id": "message_id",
    "conversationId": "conv_id",
    "senderId": {...},
    "content": "Hello!",
    "status": "sent",
    "createdAt": "2024-01-01T12:00:00Z"
  }
}
```

---

### Get Messages
```
GET /messages/:conversationId?limit=50&skip=0
```
**Protected:** ✅ Yes

**Response:**
```json
{
  "messages": [...]
}
```

---

### Edit Message
```
PUT /messages/:messageId
```
**Protected:** ✅ Yes

**Request Body:**
```json
{
  "content": "Updated message"
}
```

---

### Delete Message
```
DELETE /messages/:messageId
```
**Protected:** ✅ Yes

---

### Mark as Delivered
```
POST /messages/:messageId/delivered
```
**Protected:** ✅ Yes

---

### Mark as Seen
```
POST /messages/:conversationId/seen
```
**Protected:** ✅ Yes

---

### Get Unread Counts
```
GET /messages/unread/counts
```
**Protected:** ✅ Yes

**Response:**
```json
{
  "unreadByConversation": {
    "conversation_id_1": 3,
    "conversation_id_2": 0
  }
}
```

---

### Add Emoji
```
POST /messages/:messageId/emoji
```
**Protected:** ✅ Yes

**Request Body:**
```json
{
  "emoji": "😂"
}
```

---

### Remove Emoji
```
DELETE /messages/:messageId/emoji
```
**Protected:** ✅ Yes

**Request Body:**
```json
{
  "emoji": "😂"
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message"
}
```

### Common Status Codes
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing token)
- `403` - Forbidden (invalid token)
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `500` - Internal Server Error
