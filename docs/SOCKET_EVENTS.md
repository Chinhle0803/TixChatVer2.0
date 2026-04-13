# Socket.IO Events Documentation

## Connection & Authentication

### Client → Server

#### `connect`
Automatic event when client connects to socket server.

**Payload:**
```javascript
// Auth passed in handshake
auth: {
  token: "jwt_access_token"
}
```

---

## Conversation Management

### Client → Server

#### `conversation:join`
Join a conversation room to receive real-time updates.

```javascript
socket.emit('conversation:join', {
  conversationId: "conv_id"
})
```

#### `conversation:leave`
Leave a conversation room.

```javascript
socket.emit('conversation:leave', {
  conversationId: "conv_id"
})
```

---

## Message Events

### Client → Server

#### `send_message`
Send a message in real-time.

```javascript
socket.emit('send_message', {
  conversationId: "conv_id",
  content: "Hello!",
  replyTo: "message_id" // optional
})
```

#### `message:delivered`
Mark a message as delivered.

```javascript
socket.emit('message:delivered', {
  messageId: "msg_id"
})
```

#### `message:seen`
Mark all messages in conversation as seen.

```javascript
socket.emit('message:seen', {
  conversationId: "conv_id"
})
```

#### `message:edit`
Edit a message.

```javascript
socket.emit('message:edit', {
  messageId: "msg_id",
  content: "Edited message"
})
```

#### `message:delete`
Delete a message.

```javascript
socket.emit('message:delete', {
  messageId: "msg_id"
})
```

#### `message:emoji`
Add emoji reaction to a message.

```javascript
socket.emit('message:emoji', {
  messageId: "msg_id",
  emoji: "😂"
})
```

### Server → Client

#### `message:received`
New message received (for all participants in conversation).

```javascript
socket.on('message:received', (data) => {
  console.log(data.message) // Full message object
})
```

**Payload:**
```javascript
{
  message: {
    _id: "msg_id",
    conversationId: "conv_id",
    senderId: { _id, username, fullName, avatar },
    content: "Hello!",
    status: "sent",
    createdAt: "2024-01-01T12:00:00Z"
  }
}
```

#### `message:delivered`
Message marked as delivered.

```javascript
socket.on('message:delivered', (data) => {
  // Update message status in UI
})
```

#### `message:seen`
Message marked as seen.

```javascript
socket.on('message:seen', (data) => {
  // Update message status in UI
})
```

#### `message:edited`
Message was edited.

```javascript
socket.on('message:edited', (data) => {
  console.log(data.message) // Updated message
})
```

#### `message:deleted`
Message was deleted.

```javascript
socket.on('message:deleted', (data) => {
  console.log(data.messageId) // Delete from UI
})
```

#### `message:emoji`
Emoji reaction added.

```javascript
socket.on('message:emoji', (data) => {
  console.log(data.message) // Updated message with emoji
})
```

---

## Typing Indicators

### Client → Server

#### `typing:start`
User started typing.

```javascript
socket.emit('typing:start', {
  conversationId: "conv_id"
})
```

#### `typing:stop`
User stopped typing.

```javascript
socket.emit('typing:stop', {
  conversationId: "conv_id"
})
```

### Server → Client

#### `typing:start`
Someone is typing in the conversation.

```javascript
socket.on('typing:start', (data) => {
  console.log(`User ${data.userId} is typing`)
})
```

**Payload:**
```javascript
{
  conversationId: "conv_id",
  userId: "user_id"
}
```

#### `typing:stop`
Someone stopped typing.

```javascript
socket.on('typing:stop', (data) => {
  console.log(`User ${data.userId} stopped typing`)
})
```

---

## Friend Request Events

### Server → Client

#### `friend_request:new`
Fired to the receiver when a new friend request arrives.

```javascript
socket.on('friend_request:new', ({ fromUserId }) => {
  // Increase pending friend-request badge
})
```

#### `friend_request:sent`
Fired to the sender after sending a friend request.

```javascript
socket.on('friend_request:sent', ({ toUserId }) => {
  // Optional: update sent-request state
})
```

#### `friend_request:accepted`
Fired when a friend request is accepted.

```javascript
socket.on('friend_request:accepted', ({ byUserId }) => {
  // Refresh friend list / pending badge
})
```

#### `friend_request:rejected`
Fired to request sender when the request is rejected.

```javascript
socket.on('friend_request:rejected', ({ byUserId }) => {
  // Optional: update sent-request state
})
```

---

## Presence & Online Status

### Client → Server

#### `set_presence`
Update user presence status.

```javascript
socket.emit('set_presence', {
  status: 'online' // 'online', 'away', 'offline'
})
```

### Server → Client

#### `user:online`
User came online.

```javascript
socket.on('user:online', (data) => {
  console.log(`User ${data.userId} is online`)
})
```

**Payload:**
```javascript
{
  userId: "user_id"
}
```

#### `user:offline`
User went offline.

```javascript
socket.on('user:offline', (data) => {
  console.log(`User ${data.userId} is offline`)
})
```

#### `user:presence`
User presence status changed.

```javascript
socket.on('user:presence', (data) => {
  console.log(`User ${data.userId} is ${data.status}`)
})
```

**Payload:**
```javascript
{
  userId: "user_id",
  status: 'away' // or 'online', 'offline'
}
```

---

## Participant Management

### Server → Client

#### `participant:added`
New participant added to group.

```javascript
socket.on('participant:added', (data) => {
  console.log(`User ${data.participantId} joined`)
})
```

#### `participant:removed`
Participant removed from group.

```javascript
socket.on('participant:removed', (data) => {
  console.log(`User ${data.participantId} left`)
})
```

---

## Error Handling

### Server → Client

#### `error`
Socket error occurred.

```javascript
socket.on('error', (data) => {
  console.error(`Socket error: ${data.message}`)
})
```

**Payload:**
```javascript
{
  message: "Error description"
}
```

---

## Socket Rooms

The server automatically manages socket rooms:

- **Conversation room**: `conversation:${conversationId}`
  - All participants receive messages sent to this room
  - Used for real-time message delivery, typing indicators, etc.

---

## Example Usage

### Sending a Message
```javascript
// Client
socket.emit('send_message', {
  conversationId: '123',
  content: 'Hello world!',
  replyTo: null
})

// Server responds to all in conversation
socket.on('message:received', (data) => {
  console.log('New message:', data.message)
})
```

### Typing Indicator
```javascript
// User typing
socket.emit('typing:start', { conversationId: '123' })

// Other users see
socket.on('typing:start', (data) => {
  showTypingIndicator(data.userId)
})

// User stops typing
socket.emit('typing:stop', { conversationId: '123' })

// Other users see
socket.on('typing:stop', (data) => {
  hideTypingIndicator(data.userId)
})
```

### Message Status Flow
```javascript
// 1. Send message
socket.emit('send_message', {...})

// 2. Receive on all clients
socket.on('message:received', (data) => {
  // Status: 'sent'
})

// 3. Mark as delivered
socket.emit('message:delivered', { messageId: '...' })

// 4. Update on all clients
socket.on('message:delivered', (data) => {
  // Status: 'delivered'
})

// 5. Mark as seen
socket.emit('message:seen', { conversationId: '...' })

// 6. Update on all clients
socket.on('message:seen', (data) => {
  // Status: 'seen'
})
```

---

## Broadcasting Behavior

### Message Events
- **Scope**: All users in the conversation room
- **Broadcast**: Yes (sent to all except sender)
- **Include Sender**: Yes (sender gets confirmation)

### Typing Indicators
- **Scope**: All users in the conversation room
- **Broadcast**: Yes
- **Include Sender**: No (sender doesn't need to know they're typing)

### Presence
- **Scope**: All connected users
- **Broadcast**: Yes
- **Include User**: Yes

### Participant Management
- **Scope**: All users in the conversation room
- **Broadcast**: Yes

---

## Connection Best Practices

1. **Reconnection**: Enable automatic reconnection with exponential backoff
2. **Error Handling**: Always handle connection errors gracefully
3. **Token Refresh**: Refresh JWT before expiration to maintain connection
4. **Cleanup**: Remove event listeners on component unmount
5. **Multiple Conversations**: Join/leave conversation rooms as needed

```javascript
// Recommended setup
const socket = io(SOCKET_URL, {
  auth: { token },
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
})

// Cleanup on unmount
return () => {
  socket.off('message:received')
  socket.off('typing:start')
  // ... other cleanup
}
```
