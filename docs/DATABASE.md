# TixChat - Database Schema

## Collections

### Users
```javascript
{
  _id: ObjectId,
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  fullName: String (required),
  avatar: String (URL, optional),
  bio: String (max 500 chars),
  isOnline: Boolean (default: false),
  lastSeen: Date,
  friends: [ObjectId] (references to User),
  blockedUsers: [ObjectId] (references to User),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `username` (unique)
- `email` (unique)
- `isOnline`

---

### Conversations
```javascript
{
  _id: ObjectId,
  type: String (enum: '1-1', 'group'),
  name: String (required if type='group'),
  avatar: String (URL, optional),
  participants: [ObjectId] (references to User),
  admin: ObjectId (references to User, required if type='group'),
  lastMessage: ObjectId (references to Message),
  lastMessageAt: Date,
  isArchived: Boolean (default: false),
  description: String (max 500 chars),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `participants` (compound)
- `lastMessageAt` (descending)
- `type`

---

### Messages
```javascript
{
  _id: ObjectId,
  conversationId: ObjectId (references to Conversation, required),
  senderId: ObjectId (references to User, required),
  content: String (max 5000 chars, required),
  attachments: [
    {
      type: String (URL),
      mimeType: String,
      size: Number,
      name: String
    }
  ],
  status: String (enum: 'sent', 'delivered', 'seen', default: 'sent'),
  seenBy: [ObjectId] (references to User),
  deliveredTo: [ObjectId] (references to User),
  replyTo: ObjectId (references to Message, optional),
  emoji: [
    {
      emoji: String,
      users: [ObjectId]
    }
  ],
  isEdited: Boolean (default: false),
  editedAt: Date,
  isDeleted: Boolean (default: false),
  deletedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `conversationId` + `createdAt` (compound, descending)
- `senderId`
- `status`

---

### Participants
```javascript
{
  _id: ObjectId,
  conversationId: ObjectId (references to Conversation, required),
  userId: ObjectId (references to User, required),
  role: String (enum: 'admin', 'member', default: 'member'),
  isMuted: Boolean (default: false),
  lastReadMessageId: ObjectId (references to Message),
  lastReadAt: Date,
  joinedAt: Date,
  leftAt: Date (null if still member),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `conversationId` + `userId` (unique compound)

---

## Data Relationships

```
User
├── friends: [User]
├── blockedUsers: [User]
├── conversations: [Conversation] (via Participant)
└── messages: [Message]

Conversation
├── participants: [User] (direct array)
├── admin: User (if type='group')
├── messages: [Message]
├── lastMessage: Message
└── participantRecords: [Participant]

Message
├── senderId: User
├── conversationId: Conversation
├── seenBy: [User]
├── deliveredTo: [User]
├── replyTo: Message (if reply)
└── emoji.users: [User]

Participant
├── conversationId: Conversation
├── userId: User
└── lastReadMessageId: Message
```

---

## Database Queries

### Get user's conversations with latest message
```javascript
Conversation.find({ participants: userId })
  .populate('participants', 'username fullName avatar isOnline')
  .populate('lastMessage')
  .sort({ lastMessageAt: -1 })
```

### Get conversation messages with pagination
```javascript
Message.find({
  conversationId: convId,
  isDeleted: false
})
  .populate('senderId', 'username fullName avatar')
  .populate('replyTo')
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
```

### Get unread messages count
```javascript
Message.countDocuments({
  conversationId: convId,
  status: { $ne: 'seen' },
  senderId: { $ne: userId }
})
```

### Get online friends
```javascript
User.find({
  _id: { $in: userFriends },
  isOnline: true
})
```

### Find or create 1-1 conversation
```javascript
Conversation.findOne({
  type: '1-1',
  participants: { $all: [userId1, userId2], $size: 2 }
})
```

---

## Indexing Strategy

### Performance Optimization
1. **Message queries** - Most frequent operations
   - `(conversationId, createdAt)` - Load messages by conversation
   - `(senderId)` - Find user's messages

2. **Conversation queries** - Frequent operations
   - `(participants)` - Get user's conversations
   - `(lastMessageAt)` - Sort conversations

3. **User queries** - Less frequent
   - `(username)` - Search/authentication
   - `(email)` - Authentication
   - `(isOnline)` - Get online users

4. **Participant queries** - Moderate
   - `(conversationId, userId)` - Track user in conversation

---

## Data Validation

### Username
- Required, unique
- Length: 3-30 characters
- Alphanumeric only

### Email
- Required, unique
- Valid email format
- Lowercase

### Password
- Required
- Minimum 6 characters
- Hashed with bcrypt

### Message Content
- Required
- Maximum 5000 characters

### Conversation Name (group)
- Required for groups
- Maximum 100 characters

---

## Data Retention

- **Messages**: Kept indefinitely (can be soft-deleted)
- **Conversations**: Archived can be hidden but not deleted
- **User Data**: Deleted on user request (soft delete recommended)
- **Attachments**: Based on storage provider policy

---

## Scalability Considerations

1. **Message Archiving**: Archive old messages to separate collection
2. **Sharding**: By conversationId for messages collection
3. **TTL Indexes**: For temporary data (e.g., OTP codes)
4. **Caching**: Redis for user online status, recent conversations
5. **Read Replicas**: For read-heavy operations
