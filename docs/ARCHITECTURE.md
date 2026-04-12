# TixChat - Architecture & Design Patterns

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Client Layer (React)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  Components  │  │  Pages       │  │  Hooks       │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  Store       │  │  Services    │  │  Context     │   │
│  │  (Zustand)   │  │  (API/Socket)│  │  (Providers) │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────┘
          │                                    │
          │ HTTP (REST)      WebSocket (Socket.IO)
          │                                    │
┌─────────────────────────────────────────────────────────┐
│              Server Layer (Node.js + Express)            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  Routes      │  │  Controllers │  │  Services    │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  Middleware  │  │  Models      │  │  Events      │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  Socket IO   │  │  Validation  │  │  Utils       │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────┘
          │                    │                │
          │                    │                │
       MongoDB            JWT/Auth        Event Bus
```

---

## Design Patterns Used

### 1. **Event-Driven Architecture**

The application uses events for asynchronous operations:

```javascript
// Event Emitters (EventBus.js)
userEvents.emit(USER_EVENTS.REGISTERED, { userId, email })
messageEvents.emit(MESSAGE_EVENTS.SENT, { conversationId, message })

// Event Listeners
messageEvents.on(MESSAGE_EVENTS.SENT, (data) => {
  io.to(`conversation:${data.conversationId}`).emit('message:sent', ...)
})
```

**Benefits:**
- Decoupled services
- Easy to add new features
- Scalable with message queues (RabbitMQ, Redis)
- Real-time updates via Socket.IO

---

### 2. **Service Layer Pattern**

Separation of business logic from HTTP controllers:

```
Controller (HTTP handler)
    ↓
Service (Business Logic)
    ↓
Model (Database Operations)
```

**Example:**
```javascript
// Controller
async sendMessage(req, res) {
  const message = await messageService.sendMessage(...)
  res.json(message)
}

// Service (Business Logic)
async sendMessage(conversationId, senderId, content) {
  const message = new Message({ conversationId, senderId, content })
  await message.save()
  messageEvents.emit(MESSAGE_EVENTS.SENT, { message })
  return message
}

// Model (Database)
const Message = mongoose.model('Message', messageSchema)
```

**Benefits:**
- Testable
- Reusable logic
- Easy maintenance
- Clean separation of concerns

---

### 3. **Middleware Pattern**

Request processing pipeline:

```javascript
app.use(cors())                    // CORS
app.use(express.json())            // Body parser
app.use(authenticateToken)         // Authentication
app.use(errorHandler)              // Error handling
```

**Custom Middleware:**
```javascript
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]
  const decoded = verifyToken(token)
  if (decoded) {
    req.userId = decoded.userId
    next()
  } else {
    res.status(403).json({ error: 'Invalid token' })
  }
}
```

---

### 4. **State Management (Zustand)**

Lightweight state management for React:

```javascript
const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  setAuth: (user, token) => set({ user, accessToken: token }),
  logout: () => set({ user: null, accessToken: null })
}))

// Usage in component
const { user, setAuth } = useAuthStore()
```

**Benefits:**
- Simple API
- No boilerplate
- Works with React Hooks
- Minimal bundle size

---

### 5. **Custom Hooks Pattern**

Reusable logic in React components:

```javascript
// Hook
export const useChat = () => {
  const [messages, setMessages] = useState([])
  
  const sendMessage = async (content) => {
    const response = await messageService.sendMessage(content)
    setMessages([...messages, response])
  }
  
  return { messages, sendMessage }
}

// Component
function ChatWindow() {
  const { messages, sendMessage } = useChat()
  return <div>{messages.map(...)}</div>
}
```

---

### 6. **Socket.IO Room-Based Broadcasting**

Real-time messaging using Socket.IO rooms:

```javascript
// Join conversation room
socket.emit('conversation:join', { conversationId: '123' })

// Send message to all in room
io.to(`conversation:123`).emit('message:received', { message })

// Leave conversation room
socket.emit('conversation:leave', { conversationId: '123' })
```

**Benefits:**
- Efficient broadcasting
- Scalable with multiple servers
- Automatic cleanup

---

## Data Flow

### 1. User Login Flow

```
User Input (Email, Password)
    ↓
Frontend: useAuth().login()
    ↓
API Call: POST /api/auth/login
    ↓
Backend: AuthController.login()
    ↓
AuthService: Verify password, generate tokens
    ↓
Event: USER_EVENTS.LOGGED_IN emitted
    ↓
Socket.IO: User online status broadcast
    ↓
Frontend: Store tokens, redirect to /chat
    ↓
Socket.IO: Initialize connection with token
```

### 2. Message Sending Flow

```
User Types & Sends Message
    ↓
Frontend: socket.emit('send_message', {...})
    ↓
Backend: Socket handler receives message
    ↓
MessageService: Save to database
    ↓
Event: MESSAGE_EVENTS.SENT emitted
    ↓
Socket.IO: Broadcast to all in conversation room
    ↓
Frontend: socket.on('message:received') updates UI
    ↓
All participants see message in real-time
```

### 3. Typing Indicator Flow

```
User Starts Typing
    ↓
Frontend: socket.emit('typing:start', {...})
    ↓
Backend: Socket handler broadcasts
    ↓
Socket.IO: io.to(room).emit('typing:start')
    ↓
Frontend: socket.on('typing:start') shows indicator
    ↓
User Stops Typing
    ↓
Frontend: socket.emit('typing:stop', {...})
    ↓
Backend: Broadcasts stop event
    ↓
Frontend: Hides indicator
```

---

## Component Hierarchy

```
App
├── Router
│   ├── LoginPage
│   │   └── LoginForm
│   ├── RegisterPage
│   │   └── RegisterForm
│   └── ChatPage
│       ├── Sidebar
│       │   ├── SidebarHeader
│       │   ├── UserInfo
│       │   └── ConversationList
│       │       └── ConversationItem
│       └── ChatWindow
│           ├── ChatHeader
│           ├── MessageList
│           │   ├── Message
│           │   └── TypingIndicator
│           └── ChatInput
│               └── MessageForm
```

---

## Authentication Flow

### JWT Token Lifecycle

```
1. User Registers/Logs In
   ↓
2. Server generates:
   - Access Token (short-lived: 7 days)
   - Refresh Token (long-lived: 30 days)
   ↓
3. Client stores both tokens in localStorage
   ↓
4. Client sends Access Token in Authorization header
   ↓
5. Server validates token on each request
   ↓
6. If Access Token expired:
   - Client sends Refresh Token
   - Server issues new Access Token
   ↓
7. If Refresh Token expired:
   - User must re-login
```

### Security Measures

1. **Password Hashing**: bcryptjs with salt rounds
2. **JWT Signing**: HS256 algorithm
3. **CORS**: Restricted to frontend URL
4. **Request Validation**: Joi schemas
5. **Rate Limiting**: Prevent brute force (recommended)
6. **HTTPS**: Required for production

---

## Database Design Principles

### 1. Normalization vs Denormalization

**Normalized (User References):**
```javascript
{
  conversationId: "conv_id",
  participants: ["user_id1", "user_id2"],
  lastMessage: "msg_id"
}
```

**Denormalized (Embedded Data):**
```javascript
{
  conversationId: "conv_id",
  participants: [
    { _id: "id", username: "john", avatar: "url" }
  ]
}
```

**Decision**: Mixed approach
- Users array: Denormalized (for quick display)
- Message: Normalized (for efficiency)
- Last message: Reference + Denormalized (for list display)

### 2. Indexing Strategy

```javascript
// Frequently queried fields are indexed
userSchema.index({ username: 1 })
userSchema.index({ email: 1 })

conversationSchema.index({ participants: 1 })
conversationSchema.index({ lastMessageAt: -1 })

messageSchema.index({ conversationId: 1, createdAt: -1 })
messageSchema.index({ senderId: 1 })
```

---

## Scalability Considerations

### Horizontal Scaling

**Current Architecture (Single Server):**
```
Client ↔ Server + Socket.IO ↔ MongoDB
```

**Scaled Architecture (Multiple Servers):**
```
         ┌─── Server 1 (Socket.IO)
Client ──┼─── Server 2 (Socket.IO) ← Load Balancer (Nginx)
         └─── Server 3 (Socket.IO)
              ↓
         Redis Adapter (Socket.IO)
              ↓
         MongoDB Replica Set
```

### Redis Integration

For distributed Socket.IO:

```javascript
import { createAdapter } from '@socket.io/redis-adapter'
import { createClient } from 'redis'

const pubClient = createClient({ host: 'redis-host' })
const subClient = pubClient.duplicate()

io.adapter(createAdapter(pubClient, subClient))
```

### Load Balancing

Nginx configuration for multiple servers:

```nginx
upstream chat_servers {
    server localhost:5000;
    server localhost:5001;
    server localhost:5002;
}

server {
    listen 80;
    location / {
        proxy_pass http://chat_servers;
    }
}
```

---

## Performance Optimization

### Frontend

1. **Code Splitting**
   ```javascript
   const ChatPage = lazy(() => import('./pages/ChatPage'))
   ```

2. **Memoization**
   ```javascript
   const Message = React.memo(({ message }) => (...))
   ```

3. **Virtual Scrolling** (for large message lists)
   ```javascript
   import { FixedSizeList } from 'react-window'
   ```

### Backend

1. **Database Indexing** - Already done in models

2. **Caching with Redis**
   ```javascript
   const onlineUsers = await redis.get('online_users')
   ```

3. **Pagination**
   ```javascript
   // Load 50 messages at a time
   Message.find().limit(50).skip(skip)
   ```

4. **Compression**
   ```javascript
   app.use(compression())
   ```

---

## Testing Strategy

### Unit Tests
```javascript
// Test individual functions
describe('AuthService', () => {
  it('should hash password', async () => {
    const hash = await hashPassword('password')
    expect(hash).not.toBe('password')
  })
})
```

### Integration Tests
```javascript
// Test API endpoints
describe('POST /api/auth/login', () => {
  it('should return token on valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'pass' })
    expect(res.status).toBe(200)
    expect(res.body.accessToken).toBeDefined()
  })
})
```

### Socket.IO Tests
```javascript
// Test real-time events
describe('Socket.IO', () => {
  it('should broadcast message to all participants', (done) => {
    socket.emit('send_message', {...})
    socket.on('message:received', (data) => {
      expect(data.message).toBeDefined()
      done()
    })
  })
})
```

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database backups enabled
- [ ] HTTPS certificates installed
- [ ] CORS configured for production URL
- [ ] Rate limiting enabled
- [ ] Error logging configured
- [ ] Database indexes created
- [ ] Frontend build optimized
- [ ] Backend error handling complete
- [ ] Socket.IO adapter configured (Redis)
- [ ] Monitoring alerts setup
- [ ] Backup/recovery plan documented
