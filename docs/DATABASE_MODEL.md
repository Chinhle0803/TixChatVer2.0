    # 📊 Mô Hình Database TixChat

    ## 1. ERD - Entity Relationship Diagram

    ```
    ┌─────────────────────────────────────────────────────────────────┐
    │                    TIXCHAT DATABASE MODEL                        │
    ├─────────────────────────────────────────────────────────────────┤
    │                                                                  │
    │                         ┌──────────────┐                        │
    │                         │    USERS     │                        │
    │                         ├──────────────┤                        │
    │                    PK   │ userId (UUID)│◄──┐                   │
    │                         │ email        │   │                   │
    │                         │ username     │   │                   │
    │                         │ password     │   │                   │
    │                         │ fullName     │   │                   │
    │                         │ avatar       │   │                   │
    │                         │ bio          │   │                   │
    │                         │ isOnline     │   │                   │
    │                         │ lastSeen     │   │                   │
    │                         │ isEmailVerified    │                 │
    │                         │ createdAt    │   │                   │
    │                         │ updatedAt    │   │                   │
    │                         └──────┬───────┘   │                   │
    │                                │           │                   │
    │                   ┌────────────┼─────┬─────┼────────┐         │
    │                   │            │     │     │        │         │
    │                   │ (1)    (n)  │     │     │        │         │
    │              (sendsTo)   (receivedFrom)   │        │         │
    │                   │            │     │     │        │         │
    │                   │            │     │     │ (isAdmin)       │
    │                   │            │     │     │        │         │
    │                   ▼            ▼     ▼     ▼        ▼         │
    │         ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
    │         │   MESSAGES   │  │PARTICIPANTS  │  │CONVERSATIONS│ │
    │         ├──────────────┤  ├──────────────┤  ├──────────────┤ │
    │    PK   │messageId     │  │participantId │  │conversationId
    │         │conversationId│◄─┤conversationId│─►│type         │ │
    │    FK   │senderId      │  │userId        │◄─┤name         │ │
    │    FK   │(isReplyTo)   │  │role          │  │avatar       │ │
    │         │content       │  │isMuted       │  │description  │ │
    │         │status        │  │lastReadAt    │  │lastMessage  │ │
    │         │seenBy[]      │  │joinedAt      │  │lastMessageAt│ │
    │         │attachments[] │  │leftAt        │  │isArchived   │ │
    │         │emoji[]       │  │createdAt     │  │createdAt    │ │
    │         │isEdited      │  │updatedAt     │  │updatedAt    │ │
    │         │editedAt      │  └──────────────┘  └──────────────┘ │
    │         │isDeleted     │                                      │
    │         │deletedAt     │                                      │
    │         │createdAt     │                                      │
    │         │updatedAt     │                                      │
    │         └──────────────┘                                      │
    │                                                                  │
    │  Legend:                                                        │
    │  PK: Primary Key                                               │
    │  FK: Foreign Key                                               │
    │  (1): One                                                      │
    │  (n): Many                                                     │
    │                                                                  │
    └─────────────────────────────────────────────────────────────────┘
    ```

    ---

    ## 2. Các Bảng Chi Tiết

    ### 2.1 Users Table

    **Mục đích**: Lưu trữ thông tin người dùng

    | Field | Type | Key | Constraint | Mô Tả |
    |-------|------|-----|-----------|-------|
    | `userId` | UUID | PK | NOT NULL, UNIQUE | Định danh duy nhất của người dùng |
    | `username` | String | GSI | UNIQUE | Tên người dùng (3-30 ký tự) |
    | `email` | String | GSI | UNIQUE | Email người dùng |
    | `password` | String | - | NOT NULL | Mật khẩu đã hash (bcryptjs) |
    | `fullName` | String | - | NOT NULL | Tên đầy đủ của người dùng |
    | `avatar` | String | - | NULL | URL ảnh đại diện |
    | `bio` | String | - | NULL, max 500 | Tiểu sử (bio) của người dùng |
    | `isOnline` | Boolean | - | default: false | Trạng thái online |
    | `lastSeen` | ISO String | - | default: now | Lần cuối cùng online |
    | `friends` | Array<UUID> | - | default: [] | Danh sách bạn |
    | `blockedUsers` | Array<UUID> | - | default: [] | Danh sách người dùng đã chặn |
    | `isEmailVerified` | Boolean | - | default: false | Xác minh email |
    | `emailVerificationOtp` | String | - | NULL | OTP xác minh email (6 ký tự) |
    | `emailVerificationOtpExpires` | ISO String | - | NULL | Thời gian hết hạn OTP |
    | `resetPasswordToken` | String | - | NULL | Token reset mật khẩu |
    | `resetPasswordExpires` | ISO String | - | NULL | Thời gian hết hạn token reset |
    | `verificationToken` | String | - | NULL | Token xác minh |
    | `verificationTokenExpires` | ISO String | - | NULL | Thời gian hết hạn token xác minh |
    | `createdAt` | ISO String | - | NOT NULL | Thời gian tạo |
    | `updatedAt` | ISO String | - | NOT NULL | Thời gian cập nhật cuối cùng |

    **Indexes**:
    ```
    Primary Key: userId
    Global Secondary Index (GSI):
    - email-index (HASH: email)
    - username-index (HASH: username)
    - isOnline-index (HASH: isOnline)
    ```

    **Ví dụ dữ liệu**:
    ```json
    {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john_doe",
    "email": "john@example.com",
    "password": "$2a$10$...", // hashed
    "fullName": "John Doe",
    "avatar": "https://s3.amazonaws.com/avatars/550e8400.jpg",
    "bio": "Hello, I'm John!",
    "isOnline": true,
    "lastSeen": "2026-04-06T10:30:00Z",
    "friends": ["550e8400-e29b-41d4-a716-446655440001"],
    "blockedUsers": [],
    "isEmailVerified": true,
    "createdAt": "2026-01-15T08:00:00Z",
    "updatedAt": "2026-04-06T10:30:00Z"
    }
    ```

    ---

    ### 2.2 Conversations Table

    **Mục đích**: Lưu trữ thông tin hội thoại (1-1 hoặc group)

    | Field | Type | Key | Constraint | Mô Tả |
    |-------|------|-----|-----------|-------|
    | `conversationId` | UUID | PK | NOT NULL, UNIQUE | Định danh duy nhất của hội thoại |
    | `type` | String | - | NOT NULL, Enum | Loại hội thoại ('1-1' hoặc 'group') |
    | `name` | String | - | NULL | Tên nhóm (required nếu type='group') |
    | `avatar` | String | - | NULL | URL ảnh đại diện nhóm |
    | `description` | String | - | NULL, max 500 | Mô tả nhóm |
    | `participants` | Array<UUID> | GSI | NOT NULL | Danh sách ID người tham gia |
    | `admin` | UUID | - | NULL | ID admin (required nếu type='group') |
    | `lastMessage` | UUID | - | NULL | ID tin nhắn cuối cùng |
    | `lastMessageAt` | ISO String | GSI | default: now | Thời gian tin nhắn cuối cùng |
    | `isArchived` | Boolean | - | default: false | Trạng thái lưu trữ |
    | `createdAt` | ISO String | - | NOT NULL | Thời gian tạo |
    | `updatedAt` | ISO String | - | NOT NULL | Thời gian cập nhật cuối cùng |

    **Indexes**:
    ```
    Primary Key: conversationId
    Global Secondary Index (GSI):
    - type-index (HASH: type)
    - participants-index (HASH: participants)
    - lastMessageAt-index (HASH: lastMessageAt, RANGE: conversationId)
    - admin-index (HASH: admin)
    ```

    **Ví dụ dữ liệu (1-1)**:
    ```json
    {
    "conversationId": "660e8400-e29b-41d4-a716-446655440000",
    "type": "1-1",
    "name": null,
    "avatar": null,
    "participants": [
        "550e8400-e29b-41d4-a716-446655440000",
        "550e8400-e29b-41d4-a716-446655440001"
    ],
    "admin": null,
    "lastMessage": "770e8400-e29b-41d4-a716-446655440000",
    "lastMessageAt": "2026-04-06T10:30:00Z",
    "isArchived": false,
    "createdAt": "2026-02-01T12:00:00Z",
    "updatedAt": "2026-04-06T10:30:00Z"
    }
    ```

**Ví dụ dữ liệu (Group)**:
```json
{
  "conversationId": "660e8400-e29b-41d4-a716-446655440100",
  "type": "group",
  "name": "Team Development",
  "avatar": "https://s3.amazonaws.com/groups/660e8400.jpg",
  "description": "Discussion about development topics",
  "participants": [
    "550e8400-e29b-41d4-a716-446655440000",
    "550e8400-e29b-41d4-a716-446655440001",
    "550e8400-e29b-41d4-a716-446655440002"
  ],
  "admin": "550e8400-e29b-41d4-a716-446655440000",
  "lastMessage": "770e8400-e29b-41d4-a716-446655440100",
  "lastMessageAt": "2026-04-06T10:35:00Z",
  "isArchived": false,
  "createdAt": "2026-03-01T08:00:00Z",
  "updatedAt": "2026-04-06T10:35:00Z"
}
```

---

### 2.3 Messages Table

**Mục đích**: Lưu trữ các tin nhắn

| Field | Type | Key | Constraint | Mô Tả |
|-------|------|-----|-----------|-------|
| `messageId` | UUID | PK | NOT NULL, UNIQUE | Định danh duy nhất của tin nhắn |
| `conversationId` | UUID | GSI | NOT NULL | ID hội thoại chứa tin nhắn |
| `senderId` | UUID | GSI | NOT NULL | ID người gửi (FK: Users) |
| `content` | String | - | NOT NULL, max 5000 | Nội dung tin nhắn |
| `attachments` | Array | - | default: [] | Danh sách tệp đính kèm |
| `status` | String | - | default: 'sent', Enum | Trạng thái ('sent', 'delivered', 'seen') |
| `seenBy` | Array<UUID> | - | default: [] | Danh sách người đã xem |
| `deliveredTo` | Array<UUID> | - | default: [] | Danh sách người đã nhận |
| `replyTo` | UUID | - | NULL | ID tin nhắn được trả lời |
| `emoji` | Array | - | default: [] | Danh sách emoji reaction |
| `isEdited` | Boolean | - | default: false | Đã được chỉnh sửa |
| `editedAt` | ISO String | - | NULL | Thời gian chỉnh sửa |
| `isDeleted` | Boolean | - | default: false | Đã được xóa |
| `deletedAt` | ISO String | - | NULL | Thời gian xóa |
| `createdAt` | ISO String | GSI | NOT NULL | Thời gian tạo |
| `updatedAt` | ISO String | - | NOT NULL | Thời gian cập nhật cuối cùng |

**Indexes**:
```
Primary Key: messageId
Global Secondary Index (GSI):
  - conversationId-index (HASH: conversationId, RANGE: createdAt)
  - senderId-index (HASH: senderId)
  - status-index (HASH: status)
```

**Ví dụ dữ liệu**:
```json
{
  "messageId": "770e8400-e29b-41d4-a716-446655440000",
  "conversationId": "660e8400-e29b-41d4-a716-446655440000",
  "senderId": "550e8400-e29b-41d4-a716-446655440000",
  "content": "Hello, how are you?",
  "attachments": [],
  "status": "seen",
  "seenBy": [
    "550e8400-e29b-41d4-a716-446655440001"
  ],
  "deliveredTo": [
    "550e8400-e29b-41d4-a716-446655440001"
  ],
  "replyTo": null,
  "emoji": [
    {
      "emoji": "👍",
      "users": ["550e8400-e29b-41d4-a716-446655440001"]
    }
  ],
  "isEdited": false,
  "editedAt": null,
  "isDeleted": false,
  "deletedAt": null,
  "createdAt": "2026-04-06T10:30:00Z",
  "updatedAt": "2026-04-06T10:30:00Z"
}
```

**Ví dụ tin nhắn với attachment**:
```json
{
  "messageId": "770e8400-e29b-41d4-a716-446655440001",
  "conversationId": "660e8400-e29b-41d4-a716-446655440000",
  "senderId": "550e8400-e29b-41d4-a716-446655440000",
  "content": "Check out this document",
  "attachments": [
    {
      "type": "file",
      "url": "https://s3.amazonaws.com/files/document.pdf",
      "size": 1048576,
      "name": "document.pdf"
    }
  ],
  "status": "delivered",
  "seenBy": [],
  "deliveredTo": [
    "550e8400-e29b-41d4-a716-446655440001"
  ],
  "replyTo": null,
  "emoji": [],
  "createdAt": "2026-04-06T10:31:00Z",
  "updatedAt": "2026-04-06T10:31:00Z"
}
```

---

### 2.4 Participants Table

**Mục đích**: Lưu trữ thông tin người tham gia hội thoại

| Field | Type | Key | Constraint | Mô Tả |
|-------|------|-----|-----------|-------|
| `participantId` | UUID | PK | NOT NULL, UNIQUE | Định danh duy nhất |
| `conversationId` | UUID | GSI | NOT NULL | ID hội thoại (FK: Conversations) |
| `userId` | UUID | GSI | NOT NULL | ID người dùng (FK: Users) |
| `role` | String | - | default: 'member', Enum | Vai trò ('admin' hoặc 'member') |
| `isMuted` | Boolean | - | default: false | Tắt thông báo |
| `lastReadMessageId` | UUID | - | NULL | ID tin nhắn cuối cùng đã đọc |
| `lastReadAt` | ISO String | - | default: now | Thời gian đọc cuối cùng |
| `joinedAt` | ISO String | - | default: now | Thời gian tham gia |
| `leftAt` | ISO String | - | NULL | Thời gian rời khỏi |
| `createdAt` | ISO String | - | NOT NULL | Thời gian tạo |
| `updatedAt` | ISO String | - | NOT NULL | Thời gian cập nhật cuối cùng |

**Indexes**:
```
Primary Key: participantId
Global Secondary Index (GSI):
  - conversationId-userId-index (HASH: conversationId, RANGE: userId)
  - userId-index (HASH: userId)
  - role-index (HASH: role)
```

**Ví dụ dữ liệu**:
```json
{
  "participantId": "880e8400-e29b-41d4-a716-446655440000",
  "conversationId": "660e8400-e29b-41d4-a716-446655440000",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "role": "member",
  "isMuted": false,
  "lastReadMessageId": "770e8400-e29b-41d4-a716-446655440000",
  "lastReadAt": "2026-04-06T10:30:00Z",
  "joinedAt": "2026-02-01T12:00:00Z",
  "leftAt": null,
  "createdAt": "2026-02-01T12:00:00Z",
  "updatedAt": "2026-04-06T10:30:00Z"
}
```

---

## 3. Mối Quan Hệ (Relationships)

### 3.1 One-to-Many Relationships

```
┌──────────────────────────────────────────────────────────┐
│ User (1) ──────────→ (n) Message (senderId)              │
├──────────────────────────────────────────────────────────┤
│ One User can send many Messages                          │
│ Foreign Key: Message.senderId → User.userId             │
│ Usage: Get all messages sent by a user                   │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ Conversation (1) ──────────→ (n) Message                 │
├──────────────────────────────────────────────────────────┤
│ One Conversation contains many Messages                  │
│ Foreign Key: Message.conversationId → Conversation.id   │
│ Usage: Get all messages in a conversation               │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ Conversation (1) ──────────→ (n) Participant             │
├──────────────────────────────────────────────────────────┤
│ One Conversation has many Participants                   │
│ Foreign Key: Participant.conversationId → Conv.id       │
│ Usage: Get all participants in a conversation           │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ User (1) ──────────→ (n) Participant                     │
├──────────────────────────────────────────────────────────┤
│ One User can participate in many Conversations          │
│ Foreign Key: Participant.userId → User.userId           │
│ Usage: Get all conversations a user is in               │
└──────────────────────────────────────────────────────────┘
```

### 3.2 Many-to-Many Relationships (Implicit)

```
┌─────────────────────────────────────────────────────────┐
│ User ←── (Participants) ──→ Conversation               │
├─────────────────────────────────────────────────────────┤
│ Users and Conversations have M:N relationship          │
│ Linked through: Participants table (Join table)        │
│ Usage: Find all users in a conversation & vice versa   │
└─────────────────────────────────────────────────────────┘
```

### 3.3 Self-Referencing Relationships

```
┌────────────────────────────────────────────────────────┐
│ Message.replyTo → Message (Self-reference)            │
├────────────────────────────────────────────────────────┤
│ A Message can reply to another Message                │
│ Field: Message.replyTo (NULL if not a reply)          │
│ Usage: Thread replies in conversations                │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ User.friends → User[] (Self-reference)                │
├────────────────────────────────────────────────────────┤
│ A User can have multiple friend Users                 │
│ Field: User.friends (Array of userIds)                │
│ Usage: Friend list management                         │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ User.blockedUsers → User[] (Self-reference)           │
├────────────────────────────────────────────────────────┤
│ A User can block multiple Users                       │
│ Field: User.blockedUsers (Array of userIds)           │
│ Usage: Blocking system                                │
└────────────────────────────────────────────────────────┘
```

---

## 4. Schema Details

### 4.1 Attachment Object Schema

```javascript
{
  type: String,           // 'image', 'file', 'video', 'audio'
  url: String,            // S3 URL
  size: Number,           // Bytes
  name: String,           // Original filename
  mimeType: String,       // e.g., 'image/jpeg', 'application/pdf'
  width: Number,          // For images/videos
  height: Number,         // For images/videos
  duration: Number,       // For videos/audio (seconds)
  uploadedAt: ISO String
}
```

### 4.2 Emoji Object Schema

```javascript
{
  emoji: String,          // e.g., '👍', '❤️', '😂'
  users: Array<UUID>,     // User IDs who reacted
  count: Number           // Total reactions
}
```

### 4.3 Participant Object in Array

```javascript
{
  conversationId: UUID,
  userId: UUID,
  username: String,
  avatar: String,
  role: String            // 'admin' or 'member'
}
```

---

## 5. Truy Vấn Cơ Bản (Query Examples)

### 5.1 User Queries

```javascript
// Find user by email
db.query({
  TableName: 'Users',
  IndexName: 'email-index',
  KeyConditionExpression: 'email = :email',
  ExpressionAttributeValues: { ':email': 'john@example.com' }
})

// Find online users
db.query({
  TableName: 'Users',
  IndexName: 'isOnline-index',
  KeyConditionExpression: 'isOnline = :online',
  ExpressionAttributeValues: { ':online': true }
})

// Get user by ID
db.get({
  TableName: 'Users',
  Key: { userId: 'user-uuid-here' }
})
```

### 5.2 Conversation Queries

```javascript
// Get all conversations for a user (with pagination)
db.query({
  TableName: 'Conversations',
  IndexName: 'participants-index',
  KeyConditionExpression: 'participants = :userId',
  ExpressionAttributeValues: { ':userId': 'user-uuid' },
  Limit: 20,
  ExclusiveStartKey: lastKey
})

// Get conversations sorted by last message
db.query({
  TableName: 'Conversations',
  IndexName: 'lastMessageAt-index',
  KeyConditionExpression: 'lastMessageAt > :timestamp',
  ExpressionAttributeValues: { ':timestamp': '2026-04-06T00:00:00Z' },
  ScanIndexForward: false  // DESC order
})

// Get group conversations by admin
db.query({
  TableName: 'Conversations',
  IndexName: 'admin-index',
  KeyConditionExpression: 'admin = :adminId',
  ExpressionAttributeValues: { ':adminId': 'admin-uuid' }
})
```

### 5.3 Message Queries

```javascript
// Get all messages in a conversation (sorted by time)
db.query({
  TableName: 'Messages',
  IndexName: 'conversationId-index',
  KeyConditionExpression: 'conversationId = :convId AND createdAt > :timestamp',
  ExpressionAttributeValues: {
    ':convId': 'conversation-uuid',
    ':timestamp': '2026-04-06T00:00:00Z'
  },
  ScanIndexForward: true,  // ASC order
  Limit: 50
})

// Get messages by sender
db.query({
  TableName: 'Messages',
  IndexName: 'senderId-index',
  KeyConditionExpression: 'senderId = :senderId',
  ExpressionAttributeValues: { ':senderId': 'user-uuid' }
})

// Get undelivered messages
db.query({
  TableName: 'Messages',
  IndexName: 'status-index',
  KeyConditionExpression: 'status = :status',
  ExpressionAttributeValues: { ':status': 'sent' }
})
```

### 5.4 Participant Queries

```javascript
// Get all participants in a conversation
db.query({
  TableName: 'Participants',
  IndexName: 'conversationId-userId-index',
  KeyConditionExpression: 'conversationId = :convId',
  ExpressionAttributeValues: { ':convId': 'conversation-uuid' }
})

// Get all conversations a user is in
db.query({
  TableName: 'Participants',
  IndexName: 'userId-index',
  KeyConditionExpression: 'userId = :userId',
  ExpressionAttributeValues: { ':userId': 'user-uuid' }
})

// Get user's role in a conversation
db.query({
  TableName: 'Participants',
  IndexName: 'conversationId-userId-index',
  KeyConditionExpression: 'conversationId = :convId AND userId = :userId',
  ExpressionAttributeValues: {
    ':convId': 'conversation-uuid',
    ':userId': 'user-uuid'
  }
})
```

---

## 6. Data Constraints & Validations

### 6.1 Users Table

```javascript
Constraints:
  ✓ userId: NOT NULL, UNIQUE
  ✓ email: NOT NULL, UNIQUE, Valid email format
  ✓ username: NOT NULL, UNIQUE, 3-30 characters
  ✓ password: NOT NULL, Min 6 characters (hashed)
  ✓ fullName: NOT NULL
  ✓ bio: Max 500 characters
  ✓ isOnline: Boolean (default: false)
  ✓ friends: Array of valid userIds
  ✓ blockedUsers: Array of valid userIds
  ✓ isEmailVerified: Boolean (default: false)
```

### 6.2 Conversations Table

```javascript
Constraints:
  ✓ conversationId: NOT NULL, UNIQUE
  ✓ type: NOT NULL, Enum('1-1', 'group')
  ✓ name: Required if type='group'
  ✓ admin: Required if type='group', FK to Users
  ✓ participants: NOT NULL, Min 2 users
  ✓ description: Max 500 characters
  ✓ lastMessageAt: Valid ISO string
```

### 6.3 Messages Table

```javascript
Constraints:
  ✓ messageId: NOT NULL, UNIQUE
  ✓ conversationId: NOT NULL, FK to Conversations
  ✓ senderId: NOT NULL, FK to Users
  ✓ content: NOT NULL, Max 5000 characters
  ✓ status: Enum('sent', 'delivered', 'seen')
  ✓ attachments: Array of valid attachment objects
  ✓ seenBy: Array of valid userIds
  ✓ deliveredTo: Array of valid userIds
  ✓ replyTo: NULL or valid messageId (FK)
  ✓ emoji: Array of valid emoji objects
```

### 6.4 Participants Table

```javascript
Constraints:
  ✓ participantId: NOT NULL, UNIQUE
  ✓ conversationId: NOT NULL, FK to Conversations
  ✓ userId: NOT NULL, FK to Users
  ✓ role: Enum('admin', 'member')
  ✓ joinedAt: Valid ISO string
  ✓ leftAt: NULL or valid ISO string
  ✓ Unique constraint: (conversationId, userId)
```

---

## 7. Data Flow Examples

### 7.1 1-to-1 Conversation Flow

```
Step 1: Create/Get Conversation
  Users: [User1, User2]
  ↓
  Conversations
  {
    conversationId: conv-uuid-1,
    type: '1-1',
    participants: [user1-id, user2-id]
  }

Step 2: Add Participants
  ↓
  Participants (Entry 1)
  {
    conversationId: conv-uuid-1,
    userId: user1-id,
    role: 'member'
  }
  
  Participants (Entry 2)
  {
    conversationId: conv-uuid-1,
    userId: user2-id,
    role: 'member'
  }

Step 3: Send Message
  ↓
  Messages
  {
    messageId: msg-uuid-1,
    conversationId: conv-uuid-1,
    senderId: user1-id,
    content: "Hello!",
    status: 'sent'
  }

Step 4: Mark as Delivered
  ↓
  Update Message
  {
    status: 'delivered',
    deliveredTo: [user2-id]
  }

Step 5: Mark as Seen
  ↓
  Update Message
  {
    status: 'seen',
    seenBy: [user2-id]
  }
```

### 7.2 Group Conversation Flow

```
Step 1: Create Group
  Users: [User1, User2, User3]
  ↓
  Conversations
  {
    conversationId: conv-uuid-2,
    type: 'group',
    name: 'Development Team',
    admin: user1-id,
    participants: [user1-id, user2-id, user3-id]
  }

Step 2: Add Participants
  ↓
  Participants (Entry 1)
  {
    conversationId: conv-uuid-2,
    userId: user1-id,
    role: 'admin'        ← Admin
  }
  
  Participants (Entry 2-3): role: 'member'

Step 3: Send Message to Group
  ↓
  Messages
  {
    messageId: msg-uuid-2,
    conversationId: conv-uuid-2,
    senderId: user1-id,
    content: "Team meeting at 3 PM",
    status: 'sent',
    deliveredTo: [],
    seenBy: []
  }

Step 4: Track Read Status
  ↓
  Update Message
  {
    status: 'delivered',
    deliveredTo: [user2-id, user3-id]
  }
  
  Later:
  {
    status: 'seen',
    seenBy: [user2-id, user3-id]
  }
  
  User 2 reads:
  Update Participant
  {
    lastReadMessageId: msg-uuid-2,
    lastReadAt: 2026-04-06T10:35:00Z
  }
```

---

## 8. Indexing Strategy

### 8.1 Primary Keys

```
Users.userId             - Direct user lookup
Conversations.convId     - Direct conversation lookup
Messages.messageId       - Direct message lookup
Participants.partId      - Direct participant lookup
```

### 8.2 Global Secondary Indexes (GSI)

```
INDEX                           HASH KEY              RANGE KEY       USE CASE
─────────────────────────────────────────────────────────────────────────────
users-email-index               email                 -               Login/Find user
users-username-index            username              -               Search users
users-isOnline-index            isOnline              -               Get online users

conversations-type-index        type                  -               Filter by type
conversations-participants-idx  participants          -               Find user's convs
conversations-lastMessageAt-idx lastMessageAt         conversationId  Sort by recent
conversations-admin-index       admin                 -               Find admin groups

messages-conversationId-index    conversationId        createdAt       Get conv messages
messages-senderId-index         senderId              -               Find user's messages
messages-status-index           status                -               Undelivered messages

participants-convUserId-idx     conversationId        userId          Member check
participants-userId-index       userId                -               User's convs
participants-role-index         role                  -               Admin privileges
```

### 8.3 TTL (Time to Live)

```
Entity                      Field                    TTL
─────────────────────────────────────────────────────────────────
emailVerificationOtp         emailVerificationOtpExp  15 minutes
resetPasswordToken           resetPasswordExpires     1 hour
verificationToken            verificationTokenExp     7 days
```

---

## 9. Performance Optimization

### 9.1 Query Optimization

```javascript
// ✅ GOOD: Use partition key + sort key
db.query({
  IndexName: 'conversationId-index',
  KeyConditionExpression: 'conversationId = :id AND createdAt > :time',
  ExpressionAttributeValues: { ':id': convId, ':time': timestamp }
})

// ❌ BAD: Scan entire table
db.scan({
  FilterExpression: 'content CONTAINS :word'
})

// ✅ GOOD: Use GSI for lookups
db.query({
  IndexName: 'email-index',
  KeyConditionExpression: 'email = :email'
})

// ❌ BAD: Scan all users
db.scan({
  FilterExpression: 'email = :email'
})
```

### 9.2 Batch Operations

```javascript
// Get multiple items efficiently
db.batchGet({
  RequestItems: {
    'Users': {
      Keys: [
        { userId: 'user-1' },
        { userId: 'user-2' },
        { userId: 'user-3' }
      ]
    }
  }
})

// Write multiple items efficiently
db.batchWrite({
  RequestItems: {
    'Messages': [
      { PutRequest: { Item: message1 } },
      { PutRequest: { Item: message2 } },
      { PutRequest: { Item: message3 } }
    ]
  }
})
```

### 9.3 Pagination

```javascript
// First page
const response = db.query({
  KeyConditionExpression: 'conversationId = :id',
  Limit: 50,
  ExpressionAttributeValues: { ':id': convId }
})

// Next page
const nextResponse = db.query({
  KeyConditionExpression: 'conversationId = :id',
  Limit: 50,
  ExclusiveStartKey: response.LastEvaluatedKey
})
```

---

## 10. Backup & Disaster Recovery

```
┌─────────────────────────────────────────────────────┐
│ Backup Strategy                                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│ Daily: Full backup at 2:00 AM UTC                  │
│ Hourly: Incremental backup                         │
│ Retention: 30 days                                 │
│ Regions: 3 (Primary + 2 Standby)                   │
│                                                      │
│ Point-in-Time Recovery: 35 days                    │
│ RTO: 1 hour                                        │
│ RPO: 15 minutes                                    │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## 11. Migration & Version Control

```
Schema Versions:
├── v1.0.0 (Initial)
│   ├── Users, Conversations, Messages, Participants
│   └── Basic fields
│
├── v1.1.0 (Added Features)
│   ├── Emoji reactions
│   ├── Message editing
│   └── Message deletion
│
├── v1.2.0 (Conversation Features)
│   ├── Group descriptions
│   ├── Conversation archives
│   └── Muted conversations
│
└── v2.0.0 (Planned)
    ├── Voice/Video calls (separate table)
    ├── File sharing (enhanced)
    └── Scheduled messages
```

---

## 12. Security Measures

```
┌────────────────────────────────────────────────────┐
│ Data Security                                       │
├────────────────────────────────────────────────────┤
│                                                    │
│ ✓ Encryption at rest (AWS KMS)                   │
│ ✓ Encryption in transit (TLS 1.2+)               │
│ ✓ Password hashing (bcryptjs)                    │
│ ✓ OTP for email verification                     │
│ ✓ Token expiration (short-lived)                 │
│ ✓ Access control (Role-based)                    │
│ ✓ Audit logging (All operations)                 │
│ ✓ Data masking (Sensitive fields)                │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## 13. Tổng Kết

**Database TixChat:**

| Aspect | Detail |
|--------|--------|
| **Database Type** | NoSQL (DynamoDB) |
| **Tables** | 4 (Users, Conversations, Messages, Participants) |
| **Total Indexes** | 15+ GSI |
| **Primary Keys** | All tables have UUID PK |
| **Relationships** | 1:N, M:N, Self-referencing |
| **Data Types** | String, Number, Boolean, Array, Object, ISO String |
| **Max Record Size** | 400 KB (DynamoDB limit) |
| **Capacity Mode** | On-demand (Pay per request) |
| **Backup** | Daily + Point-in-time recovery |
| **Security** | Encryption, Access control, Audit logging |

Mô hình này được tối ưu hóa cho:
- ✅ Real-time messaging
- ✅ High scalability
- ✅ Low latency queries
- ✅ Efficient pagination
- ✅ Complex relationships
- ✅ Security & compliance

