# 📱 TixChat - Project Overview

**Version:** 1.1.0  
**Last Updated:** April 12, 2026  
**Purpose:** Comprehensive project overview for AI to understand without reading entire source code

---

## 🎯 Project Description

**TixChat** is a real-time chat application similar to Messenger/WhatsApp built with modern technologies. It provides real-time messaging, user authentication, profiles, and conversation management.

### Core Features
- ✅ Real-time messaging with Socket.IO
- ✅ User authentication (Register, Login, JWT)
- ✅ User profiles with avatar upload to S3
- ✅ Conversation management (1-on-1, groups)
- ✅ Message features (edit, delete, reply, emoji reactions)
- ✅ Online status tracking
- ✅ Email verification with OTP
- ✅ Password reset and change
- ✅ Message delivery status (sent, delivered, seen)
- ✅ New conversation/search modal (🔍) in sidebar
- ✅ Search users by name/username and start conversation from search results
- ✅ Open existing 1-1 chat if already exists, otherwise create a new one automatically
- ✅ Friend request flow in chat UI (send request, accept, reject, pending states)
- ✅ Chat UX improvements:
    - Auto-focus input when opening conversation
    - Initial load only 20 latest messages
    - Load older messages on demand via "Xem thêm tin nhắn cũ"
    - Auto-scroll to newest messages when opening chat
    - Edit message directly from chat input bar (no browser prompt)

---

## 📚 Tech Stack

### Frontend
- **Framework:** React 18 + Vite (build tool)
- **State Management:** Zustand
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Real-time Communication:** Socket.IO Client
- **Styling:** CSS

### Backend
- **Runtime:** Node.js with ES6 modules
- **Framework:** Express.js
- **Database:** DynamoDB (AWS) - replaced MongoDB
- **Real-time:** Socket.IO
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **File Upload:** Multer + AWS S3
- **Email Service:** AWS SES
- **Caching/Sessions:** Redis (optional)
- **Validation:** Joi
- **ID Generation:** UUID v4

### Infrastructure & Tools
- **Build Tool:** Vite (frontend)
- **Development Server:** Nodemon
- **Linting:** ESLint
- **Testing:** Jest (configured but not fully implemented)
- **Cloud Services:** AWS (DynamoDB, S3, SES)

---

## 🏗️ System Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────┐
│         Frontend (React + Vite)              │
│  ├─ Components (ChatWindow, Messages, etc)   │
│  ├─ Pages (Chat, Auth, Profile)              │
│  ├─ Hooks (useAuth, useChat, useSocket)      │
│  └─ Services (api.js, socket.js)             │
└────────────────┬────────────────────────────┘
                 │ HTTP & WebSocket
┌────────────────┴────────────────────────────┐
│      Backend (Node.js + Express)             │
│  ├─ Routes (auth, chat, users, messages)     │
│  ├─ Controllers (request handlers)           │
│  ├─ Services (business logic)                │
│  ├─ Models (schema definitions)              │
│  ├─ Socket.IO handlers (real-time events)    │
│  └─ Middleware (auth, validation, errors)    │
└────────────────┬────────────────────────────┘
                 │
┌────────────────┴────────────────────────────┐
│      Data Layer (DynamoDB + S3)              │
│  ├─ DynamoDB (main database)                 │
│  ├─ S3 (file/avatar storage)                 │
│  ├─ SES (email service)                      │
│  └─ Redis (optional caching)                 │
└─────────────────────────────────────────────┘
```

### Design Patterns

#### 1. **Event-Driven Architecture**
- Uses EventBus for decoupled services
- Events: `USER_REGISTERED`, `MESSAGE_SENT`, `PASSWORD_RESET`, etc.
- Advantages: Scalable, easy to add features, supports message queues

#### 2. **Service Layer Pattern**
- **Controller** → HTTP request handler → Response
- **Service** → Business logic, validation, events
- **Model** → Database operations
- Advantage: Testable, reusable, clean separation of concerns

#### 3. **Repository Pattern** (Planned/Partial)
- Abstracts database operations
- Allows easy switching between databases
- Current: Using DynamoDB directly in services/models

---

## 📁 Project Structure

```
TixChat/
├── backend/
│   ├── src/
│   │   ├── config/                # Configuration (DB, env variables)
│   │   │   └── index.js           # Load environment variables
│   │   │
│   │   ├── controllers/            # HTTP request handlers
│   │   │   ├── AuthController.js   # Login, register, token refresh
│   │   │   ├── UserController.js   # Profile, settings, avatar
│   │   │   ├── ConversationController.js  # Conversation CRUD
│   │   │   └── MessageController.js       # Message CRUD
│   │   │
│   │   ├── services/               # Business logic layer
│   │   │   ├── AuthService.js      # Auth logic
│   │   │   ├── UserService.js      # User profile, password, avatar
│   │   │   ├── ConversationService.js   # Conversation management
│   │   │   ├── MessageService.js   # Message operations
│   │   │   ├── EmailService.js     # Email sending (SES)
│   │   │   └── S3Service.js        # Avatar upload/delete to AWS S3
│   │   │
│   │   ├── models/                 # DynamoDB schema definitions
│   │   │   ├── User.js             # User schema
│   │   │   ├── Conversation.js     # Conversation schema
│   │   │   ├── Message.js          # Message schema
│   │   │   └── Participant.js      # Participant schema
│   │   │
│   │   ├── repositories/           # Database abstraction layer
│   │   │   ├── UserRepository.js
│   │   │   ├── ConversationRepository.js
│   │   │   ├── MessageRepository.js
│   │   │   └── ParticipantRepository.js
│   │   │
│   │   ├── db/                     # Database connections
│   │   │   ├── connection.js       # DynamoDB client setup
│   │   │   └── dynamodb.js         # DynamoDB utilities
│   │   │
│   │   ├── routes/                 # API endpoint definitions
│   │   │   ├── auth.js             # /api/auth/* routes
│   │   │   ├── user.js             # /api/users/* routes
│   │   │   ├── conversation.js     # /api/conversations/* routes
│   │   │   ├── message.js          # /api/messages/* routes
│   │   │   └── email.js            # /api/email/* routes (if any)
│   │   │
│   │   ├── middleware/             # Express middleware
│   │   │   ├── auth.js             # JWT verification
│   │   │   ├── errorHandler.js     # Global error handling
│   │   │   └── upload.js           # Multer file upload config
│   │   │
│   │   ├── socket/                 # Socket.IO event handlers
│   │   │   └── handlers.js         # Connection, message, typing events
│   │   │
│   │   ├── events/                 # Event system
│   │   │   ├── EventBus.js         # EventEmitter instance
│   │   │   └── EventTypes.js       # Event constants
│   │   │
│   │   ├── utils/                  # Helper functions
│   │   │   ├── passwordUtils.js    # Hash, compare password
│   │   │   ├── tokenUtils.js       # Generate JWT tokens
│   │   │   └── validation.js       # Input validation schemas
│   │   │
│   │   └── server.js               # Express app entry point
│   │
│   ├── scripts/
│   │   ├── setupDynamoDB.js        # Initialize DynamoDB tables
│   │   └── setupIndexes.js         # Create DynamoDB indexes
│   │
│   ├── package.json                # Dependencies & scripts
│   ├── .env.example                # Environment variables template
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   ├── ChatWindow.jsx      # Main chat interface
│   │   │   ├── ConversationList.jsx # List of conversations
│   │   │   ├── Message.jsx         # Individual message component
│   │   │   └── NewConversationModal.jsx # Search users, friend requests, start chat
│   │   │
│   │   ├── pages/                  # Page-level components
│   │   │   ├── AuthContainer.jsx   # Auth page router
│   │   │   ├── LoginPage.jsx       # Login form
│   │   │   ├── RegisterPage.jsx    # Registration form
│   │   │   ├── ForgotPasswordPage.jsx # Password reset
│   │   │   ├── VerifyEmailPage.jsx # Email verification
│   │   │   ├── VerifyOTPPage.jsx   # OTP verification
│   │   │   ├── ChatPage.jsx        # Main chat page
│   │   │   └── ProfilePage.jsx     # User profile
│   │   │
│   │   ├── hooks/                  # Custom React hooks
│   │   │   ├── useAuth.js          # Authentication logic
│   │   │   ├── useChat.js          # Chat state management
│   │   │   └── useSocket.js        # Socket.IO connection
│   │   │
│   │   ├── context/                # React Context (if used)
│   │   │   └── (context providers)
│   │   │
│   │   ├── services/               # API & external services
│   │   │   ├── api.js              # Axios instance + API calls
│   │   │   └── socket.js           # Socket.IO client setup
│   │   │
│   │   ├── store/                  # Zustand state stores
│   │   │   ├── authStore.js        # Authentication state
│   │   │   └── chatStore.js        # Chat/conversation state
│   │   │
│   │   ├── styles/                 # CSS files
│   │   │   ├── App.css             # Global styles
│   │   │   ├── Auth.css            # Auth pages styling
│   │   │   ├── Chat.css            # Chat page styling
│   │   │   └── (component styles)
│   │   │
│   │   ├── utils/                  # Helper functions
│   │   ├── types/                  # TypeScript types (if any)
│   │   ├── App.jsx                 # Root component
│   │   └── main.jsx                # Vite entry point
│   │
│   ├── public/                     # Static assets
│   ├── index.html                  # HTML template
│   ├── package.json                # Dependencies & scripts
│   ├── vite.config.js              # Vite configuration
│   └── .gitignore
│
├── docs/                           # Documentation files
│   ├── README.md                   # Project overview
│   ├── SETUP.md                    # Installation & setup guide
│   ├── ARCHITECTURE.md             # Detailed architecture
│   ├── DATABASE_MODEL.md           # Database schema & ERD
│   ├── DATABASE.md                 # Database connection details
│   ├── API.md                      # API documentation
│   ├── SOCKET_EVENTS.md            # Socket.IO events reference
│   ├── AUTH_SUMMARY.md             # Authentication system
│   ├── PROFILE_FEATURES_SUMMARY.md # User profile features
│   ├── DATABASE_UPGRADE_ANALYSIS.md # Migration from MongoDB to DynamoDB
│   ├── DESIGN_UPDATES.md           # Design patterns & updates
│   ├── CLASS_DIAGRAM.md            # Class/entity relationships
│   ├── USE_CASE_DIAGRAM.md         # Use case diagrams
│   ├── SYSTEM_ARCHITECTURE.md      # System architecture
│   ├── TESTING_GUIDE.md            # Testing instructions
│   ├── EMAIL_OTP_API.md            # Email OTP flow
│   ├── IMPLEMENTATION_GUIDE_VOICE_CALL.md # Voice call feature (planned)
│   └── IMPLEMENTATION_SUMMARY.md   # Recent implementations summary
│
└── PROJECT_OVERVIEW.md             # THIS FILE - Quick reference
```

---

## 🗄️ Database Schema (DynamoDB)

### Main Tables

#### 1. **Users** Table
- **Partition Key:** `userId` (UUID)
- **Sort Key:** None
- **Global Secondary Indexes (GSI):**
  - `email-index` (query by email)
  - `username-index` (query by username)

**Key Fields:**
```javascript
{
  userId: "uuid",              // Primary key
  email: "string",             // Unique
  username: "string",          // Unique
  password: "string",          // Hashed (bcrypt)
  fullName: "string",
  avatar: "string",            // S3 URL
  bio: "string",               // Max 500 chars
  isOnline: boolean,
  lastSeen: "ISO string",
  friends: ["userId"],
  blockedUsers: ["userId"],
  isEmailVerified: boolean,
  emailVerificationOtp: "string",
  emailVerificationOtpExpires: "ISO string",
  createdAt: "ISO string",
  updatedAt: "ISO string"
}
```

#### 2. **Conversations** Table
- **Partition Key:** `conversationId` (UUID)
- **Sort Key:** None

**Key Fields:**
```javascript
{
  conversationId: "uuid",      // Primary key
  type: "private|group",
  name: "string",              // For groups
  avatar: "string",            // S3 URL
  description: "string",       // For groups
  creatorId: "userId",         // Creator
  participants: ["userId"],    // Participant IDs
  lastMessage: "string",       // Preview
  lastMessageAt: "ISO string",
  isArchived: boolean,
  createdAt: "ISO string",
  updatedAt: "ISO string"
}
```

#### 3. **Messages** Table
- **Partition Key:** `conversationId` (UUID)
- **Sort Key:** `messageId` (UUID) - allows multiple messages per conversation
- **Global Secondary Index:** `senderId-index` (query messages by sender)

**Key Fields:**
```javascript
{
  conversationId: "uuid",      // Partition key
  messageId: "uuid",           // Sort key
  senderId: "userId",
  content: "string",
  status: "sent|delivered|seen",
  seenBy: ["userId"],          // Array of users who saw it
  replyTo: "messageId",        // Optional reply-to message
  attachments: ["url"],        // S3 URLs
  emoji: ["emoji"],            // Emoji reactions
  isEdited: boolean,
  editedAt: "ISO string",
  isDeleted: boolean,
  deletedAt: "ISO string",
  createdAt: "ISO string",
  updatedAt: "ISO string"
}
```

#### 4. **Participants** Table
- **Partition Key:** `conversationId` (UUID)
- **Sort Key:** `userId` (UUID)

**Key Fields:**
```javascript
{
  conversationId: "uuid",      // Partition key
  userId: "uuid",              // Sort key
  role: "member|admin|owner",
  isMuted: boolean,
  lastReadAt: "ISO string",    // Last time they read messages
  joinedAt: "ISO string",
  leftAt: "ISO string",        // If they left
  createdAt: "ISO string",
  updatedAt: "ISO string"
}
```

---

## 🔐 Authentication & Security

### Authentication Flow
1. **Register:** User creates account → Email verification OTP sent
2. **Email Verification:** User enters OTP
3. **Login:** Email + Password → JWT tokens (access + refresh)
4. **Protected Requests:** Include `Authorization: Bearer <token>` header
5. **Token Refresh:** Use refresh token to get new access token

### Tokens
- **Access Token:** Short-lived (15-30 min), included in Authorization header
- **Refresh Token:** Long-lived (7 days), stored in secure cookies
- **JWT Payload:** `{ userId, email, username, iat, exp }`

### Password Security
- **Hashing:** bcryptjs with salt rounds = 10
- **Storage:** Never store plain text, only hashed passwords
- **Password Change:** Requires verification of current password
- **Password Reset:** 3-step process with email verification

### Email Verification
- **OTP Method:** 6-digit OTP sent via AWS SES
- **Expiration:** OTP valid for 15 minutes
- **Required:** New users must verify email before full access

---

## 🔌 Socket.IO Events

### Real-Time Communication
Socket.IO handles real-time updates without polling. Common events:

#### Connection Events
- `connect` - Client connects to server
- `disconnect` - Client disconnects
- `connect_error` - Connection error

#### Conversation Events
- `conversation:join` - Join conversation room
- `conversation:leave` - Leave conversation room
- `typing` - User is typing indicator
- `stop_typing` - Stop typing indicator

#### Message Events
- `send_message` - Send new message
- `message:delivered` - Message delivered to recipient
- `message:seen` - Message seen by recipient
- `message:edit` - Edit existing message
- `message:delete` - Delete message
- `message:reaction` - Add emoji reaction

#### User Events
- `user:online` - User came online
- `user:offline` - User went offline
- `user:typing` - User typing in conversation
- `presence:update` - Update presence info

---

## 📡 API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `POST /logout` - Logout user
- `POST /refresh-token` - Refresh access token
- `POST /verify-email` - Verify email with OTP
- `POST /send-otp` - Resend OTP to email
- `POST /forgot-password` - Start password reset
- `POST /reset-password` - Complete password reset
- `GET /me` - Get current user info

### User Routes (`/api/users`)
- `GET /profile/current` - Get current user profile
- `GET /profile/:userId` - Get user profile by ID
- `PUT /profile` - Update user profile
- `POST /password/change` - Change password
- `POST /avatar` - Upload/update avatar
- `GET /search` - Search users by username/email
- `POST /friend-request` - Send friend request
- `GET /friends` - Get user's friend list
- `POST /block` - Block user

### Conversation Routes (`/api/conversations`)
- `GET /` - Get all conversations
- `POST /` - Create new conversation
- `GET /:conversationId` - Get conversation details
- `PUT /:conversationId` - Update conversation
- `DELETE /:conversationId` - Archive/delete conversation
- `POST /:conversationId/participants` - Add participant to group
- `DELETE /:conversationId/participants/:userId` - Remove participant

### Message Routes (`/api/messages`)
- `GET /conversation/:conversationId` - Get messages in conversation
- `POST /` - Send message
- `PUT /:messageId` - Edit message
- `DELETE /:messageId` - Delete message
- `POST /:messageId/reaction` - Add emoji reaction
- `DELETE /:messageId/reaction` - Remove emoji reaction

### Email Routes (`/api/email`)
- `POST /send-otp` - Send OTP to email

---

## 🎨 Frontend Components & Pages

### Main Pages
1. **AuthContainer** - Router for auth pages (Login/Register/Reset)
2. **LoginPage** - User login with email/password
3. **RegisterPage** - New user registration
4. **ForgotPasswordPage** - Password recovery flow
5. **VerifyEmailPage** - Email verification after registration
6. **VerifyOTPPage** - OTP entry for various flows
7. **ChatPage** - Main chat interface
8. **ProfilePage** - User profile management

### Key Components
1. **ChatWindow** - Main messaging interface
2. **ConversationList** - List of active conversations
3. **Message** - Individual message display with reactions

### State Management (Zustand)
- **authStore** - User auth state, tokens, login/logout
- **chatStore** - Conversations, messages, real-time updates

### Custom Hooks
- **useAuth** - Auth operations (login, register, logout)
- **useChat** - Chat operations (get conversations, send messages)
- **useSocket** - Socket.IO connection and event handling

---

## ⚡ Key Features Explained

### 1. Real-Time Messaging
- Uses Socket.IO for instant message delivery
- No polling needed
- Message status: sent → delivered → seen
- Typing indicators

### 2. User Profile
- Avatar upload to AWS S3
- Bio/status
- Online status with last seen timestamp
- Profile visibility (public/private)

### 3. Conversation Types
- **Private (1-on-1):** Direct chat between two users
- **Group:** Multiple users with admin/member roles

### 4. Message Features
- **Edit:** Modify message content (shows "edited" marker)
- **Delete:** Remove message from conversation
- **Reply:** Quote previous message
- **Emoji Reactions:** React to messages with emojis
- **Attachments:** Share files/images (via S3)
- **Delivery Status:** Track message flow

### 5. Security Features
- JWT-based authentication
- Password hashing with bcryptjs
- Email verification with OTP
- CORS protection
- Rate limiting (can be added)
- Input validation with Joi

---

## 🚀 Backend Services Overview

### AuthService
- Register user → Validate → Hash password → Create user
- Login → Verify password → Generate tokens
- Token refresh → Validate refresh token → New access token
- Password reset → Email verification → Hash new password
- Emit events: `USER_REGISTERED`, `PASSWORD_RESET`

### UserService
- Get user profile
- Update profile (name, bio, etc)
- Change password → Verify old password → Hash new
- Update avatar → Upload to S3 → Delete old → Store URL
- Get user by ID/username/email

### ConversationService
- Create conversation (1-on-1 or group)
- Get user's conversations (paginated)
- Add/remove participants
- Update conversation details
- Archive/delete conversation
- Get last messages for preview

### MessageService
- Send message → Validate → Create → Emit event
- Get messages for conversation (paginated)
- Edit message → Update → Emit event
- Delete message → Mark as deleted
- Add emoji reaction → Update array
- Mark as seen/delivered

### EmailService
- Send email via AWS SES
- OTP generation (6-digit random)
- Email verification flow
- Password reset email with link
- Welcome email on registration

### S3Service
- Upload avatar → Validate file → Upload → Return URL
- Delete avatar → Remove from S3
- Replace avatar → Delete old → Upload new
- Handle MIME types for images

---

## 🔄 Data Flow Examples

### Message Sending Flow
```
Frontend (ChatPage)
    ↓
socket.emit('send_message', { conversationId, content })
    ↓
Backend (socket handler)
    ↓
MessageService.sendMessage(conversationId, senderId, content)
    ↓
Create Message in DynamoDB
    ↓
Emit MESSAGE_EVENTS.SENT event
    ↓
EventBus listener broadcasts to Socket.IO room
    ↓
io.to(`conversation:${conversationId}`).emit('message:new', messageData)
    ↓
All connected clients receive message in real-time
```

### Login Flow
```
Frontend (LoginPage)
    ↓
api.post('/auth/login', { email, password })
    ↓
AuthController.login()
    ↓
AuthService.login()
    ├─ Find user by email
    ├─ Compare password with bcrypt
    ├─ Generate access & refresh tokens
    └─ Emit USER_LOGGED_IN event
    ↓
Return { user, accessToken, refreshToken }
    ↓
Frontend stores tokens in localStorage/Zustand
    ↓
Include accessToken in future requests
```

### File Upload Flow
```
Frontend (ProfilePage)
    ↓
Form data with file + axios POST to /api/users/avatar
    ↓
Multer middleware processes file (in-memory)
    ↓
UserController.updateAvatar()
    ↓
S3Service.replaceAvatar()
    ├─ Upload file to S3 → Get URL
    ├─ Delete old avatar from S3 (if exists)
    └─ Store new S3 URL in User model
    ↓
Update user in DynamoDB
    ↓
Return { user, avatarUrl }
    ↓
Frontend updates user state
```

---

## 🔧 Development & Configuration

### Environment Variables (Backend .env)
```
# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# DynamoDB
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
DYNAMODB_TABLE_USERS=users
DYNAMODB_TABLE_CONVERSATIONS=conversations
DYNAMODB_TABLE_MESSAGES=messages
DYNAMODB_TABLE_PARTICIPANTS=participants

# S3
S3_BUCKET_NAME=your-bucket-name
S3_REGION=us-east-1
S3_AVATAR_FOLDER=avatars

# SES (Email)
SES_REGION=us-east-1
SES_FROM_EMAIL=noreply@tixchat.com

# Redis (Optional)
REDIS_URL=redis://localhost:6379

# CORS
FRONTEND_URL=http://localhost:5173

# OTP
OTP_EXPIRY=15m
OTP_LENGTH=6
```

### Environment Variables (Frontend .env)
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🚀 Setup & Running

### Backend Setup
```bash
cd backend
npm install
# Create .env file with variables above
npm run dev  # Development with Nodemon
# or
npm start    # Production
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev  # Development with Vite hot reload
# or
npm run build  # Production build
npm run preview
```

### Database Setup (First Time)
```bash
cd backend
npm run setup:dynamodb   # Create tables
npm run setup:indexes    # Create indexes
```

---

## 📊 Recent Updates & Status

### Version 1.0.0 Features
- ✅ Authentication (Register, Login, JWT)
- ✅ User Profiles with S3 Avatar Upload
- ✅ Conversations (1-on-1 & Groups)
- ✅ Real-time Messaging with Socket.IO
- ✅ Message Features (Edit, Delete, Reply, Reactions)
- ✅ Email Verification with OTP
- ✅ Password Reset & Change
- ✅ Online Status Tracking
- ✅ DynamoDB Migration (from MongoDB)

### Planned Features
- 🔄 Voice/Video Calls (Jitsi integration or similar)
- 🔄 Typing Indicators (via Socket.IO)
- 🔄 Message Search
- 🔄 File Sharing (documents)
- 🔄 User Blocking
- 🔄 Admin Panel
- 🔄 User Analytics

### Known Issues & TODOs
- [ ] Implement pagination for messages/conversations
- [ ] Add rate limiting for API endpoints
- [ ] Add message encryption at rest
- [ ] Implement end-to-end encryption
- [ ] Add comprehensive error handling for network failures
- [ ] Implement offline mode with local caching
- [ ] Add push notifications

---

## 🧪 Testing

### Currently Configured But Not Implemented
- Jest test framework installed
- Unit tests for services recommended
- Integration tests for API endpoints recommended
- E2E tests for critical flows

### Running Tests
```bash
npm test                    # Run all tests
npm test -- --coverage     # With coverage report
npm test -- --watch        # Watch mode
```

---

## 📝 Documentation Files Reference

| Document | Purpose |
|----------|---------|
| `SETUP.md` | Installation and first-run setup |
| `ARCHITECTURE.md` | Detailed architecture and design patterns |
| `DATABASE_MODEL.md` | DynamoDB schema and relationships |
| `API.md` | Complete API endpoint documentation |
| `SOCKET_EVENTS.md` | Socket.IO events reference |
| `AUTH_SUMMARY.md` | Authentication system details |
| `PROFILE_FEATURES_SUMMARY.md` | User profile features |
| `DATABASE_UPGRADE_ANALYSIS.md` | MongoDB → DynamoDB migration |
| `TESTING_GUIDE.md` | Testing procedures and examples |
| `EMAIL_OTP_API.md` | Email and OTP flow documentation |

---

## 💡 Common Development Tasks

### Adding a New API Endpoint
1. Create route in `routes/example.js`
2. Create controller method in `controllers/ExampleController.js`
3. Create service method in `services/ExampleService.js`
4. Add validation schema in `utils/validation.js`
5. Mount route in `server.js`
6. Document in `docs/API.md`

### Adding Real-Time Event
1. Define event type in `events/EventTypes.js`
2. Emit event in service: `exampleEvents.emit(EVENT_TYPE, data)`
3. Listen in `socket/handlers.js`
4. Broadcast to clients with `socket.emit()` or `io.to(room).emit()`

### Adding Database Query
1. Create model method in `models/Example.js`
2. Use repository pattern: `ExampleRepository.findById()`
3. Call from service, handle errors
4. Cache if applicable using Redis

### Frontend Component Flow
1. Create component file in `components/` or `pages/`
2. Create custom hook in `hooks/` if needed
3. Connect to Zustand store or use API service
4. Add styling to `styles/`
5. Import and use in parent component

---

## 🎓 Key Learning Points for Developers

### Backend Concepts Used
1. **Event-Driven Architecture** - Decoupled services via events
2. **Service Layer** - Separation of business logic
3. **Repository Pattern** - Abstract database operations
4. **JWT Authentication** - Token-based security
5. **Socket.IO** - Real-time bidirectional communication
6. **DynamoDB** - NoSQL database with GSI for queries
7. **AWS S3** - File storage and retrieval
8. **Error Handling** - Middleware for consistent error responses

### Frontend Concepts Used
1. **React Hooks** - State and side effects
2. **Zustand** - Simple state management alternative to Redux
3. **Socket.IO Client** - Real-time event handling
4. **Axios** - HTTP client with interceptors
5. **Vite** - Fast build tool and dev server
6. **Component Composition** - Reusable, modular components

---

## 🤝 Contributing

### Code Style
- Use ES6+ features
- Follow ESLint rules
- Use meaningful variable/function names
- Add comments for complex logic
- Keep functions small and focused

### Git Workflow
1. Create feature branch: `git checkout -b feature/feature-name`
2. Make changes and test
3. Commit with clear messages: `git commit -m "feat: add feature description"`
4. Push to branch: `git push origin feature/feature-name`
5. Create Pull Request

---

## 📞 Support & Resources

### Documentation
- All documentation in `docs/` folder
- Architecture decisions documented
- API examples provided

### Common Issues
- Check `.env` file is configured correctly
- Ensure DynamoDB is running/accessible
- Verify JWT secret is set
- Check AWS credentials for S3/SES/DynamoDB

### Known Issues & Fixes

#### Issue: "Failed to get conversation participants: Query condition missed key schema element: participantId"
**Root Cause:** DynamoDB Participants table has `participantId` as primary key (HASH), but repository was trying to query with `conversationId + userId` as composite key without using GSI.

**Solution Applied (ParticipantRepository.js):**
1. Added `participantId` generation in `create()` method using UUID
2. Updated `findById()` to use `conversationId-userId-index` GSI for lookups
3. Updated `findByConversationId()` to use GSI instead of primary key query
4. Fixed all UpdateCommand and DeleteCommand calls to use `participantId` from fetched participant first
5. Updated `getParticipantCount()` and `getAdmins()` to use GSI

**Key Changes:**
- `findById(conversationId, userId)` → Uses GSI `conversationId-userId-index`
- `create()` → Now generates `participantId` as primary key
- `updateRole()`, `markAsLeft()`, `delete()` → Fetch participant first to get `participantId`

**Database Schema Reference:**
- Primary Key: `participantId` (HASH)
- GSI: `conversationId-userId-index` (HASH: conversationId, RANGE: userId)
- GSI: `userId-index` (HASH: userId)

---

#### Issue: "Conversation not found"
**Root Cause:** `ConversationRepository.getByCreator()` was trying to use non-existent index `creatorId-index`, causing failed queries and missing conversations.

**Solution Applied:**

1. **ConversationRepository.js:**
   - Removed dependency on non-existent `creatorId-index`
   - `getByCreator()` now uses SCAN with FilterExpression instead of query
   - Added new method `getByParticipant()` to query conversations using `participants-index` GSI

2. **ConversationService.js:**
   - Enhanced `getUserConversations()` with error handling and fallback logic
   - Added try-catch to handle missing conversations gracefully
   - If main query fails, attempts to fetch conversation directly
   - Improved `getConversationById()` with better error messages
   - Added detailed logging for debugging

3. **Updated indexes (setupIndexes.js):**
   - `tixchat-conversations`: Only `participants-index` (HASH: participants)
   - `tixchat-participants`: `conversationId-index`, `conversationId-userId-index`, `userId-index`
   - `tixchat-users`: `email-index`, `username-index`

**Key Changes:**
- `getByCreator()` → Uses SCAN + FilterExpression (since no creatorId-index)
- `getUserConversations()` → Now handles missing conversations gracefully
- Better error messages for debugging
- Added logging for failed conversation fetches

---

#### Issue: "Conversation with ID undefined not found" + "Each child in a list should have a unique 'key' prop"
**Root Cause:** 
1. Frontend sử dụng `_id` nhưng backend trả về `conversationId` 
2. `key={conv._id}` undefined trong ConversationList → lỗi React warning
3. `openConversation(conversation._id)` nhận undefined → query API với undefined

**Solution Applied:**

1. **Backend (ConversationController.js):**
   - Thêm helper function `normalizeConversation()` để thêm `_id` alias cho frontend
   - Tất cả response methods sử dụng `normalizeConversation()` hoặc `normalizeConversations()`
   - Giữ `conversationId` trong database nhưng response có cả `_id` để frontend sử dụng

2. **Frontend (ConversationList.jsx):**
   - Sửa `key={conv._id}` → `key={conv._id || conv.conversationId}`
   - Đảm bảo key luôn có value valid

3. **Frontend (ChatPage.jsx):**
   - Sửa `handleSelectConversation()` → `conversation._id || conversation.conversationId`

4. **Frontend (useChat.js hook):**
   - `sendMessage()` → Sử dụng `const conversationId = currentConversation._id || currentConversation.conversationId`
   - `loadMoreMessages()` → Sử dụng fallback conversationId

**Key Changes:**
- Backend normalize: `conversation._id = conversation.conversationId`
- Frontend fallback: Luôn check cả `_id` và `conversationId`
- Key prop fix: Sử dụng `key={conv._id || conv.conversationId}`

---

#### Issue: "MessageRepository.findByConversationId is not a function"
**Root Cause:**
1. `MessageService` gọi `MessageRepository.findByConversationId()` nhưng method không tồn tại
2. `MessageRepository` chỉ có `getByConversation()` method
3. Message queries cần cả `conversationId` + `messageId` nhưng routes không pass `conversationId`

**Solution Applied:**

1. **Backend Routes (routes/message.js):**
   - Thêm `conversationId` vào route params tất cả message operations:
   - `PUT /:conversationId/:messageId` (edit)
   - `DELETE /:conversationId/:messageId` (delete)
   - `POST /:conversationId/:messageId/delivered`
   - `POST /:conversationId/:messageId/emoji`
   - `DELETE /:conversationId/:messageId/emoji`

2. **Backend Controller (MessageController.js):**
   - Update tất cả methods để lấy `conversationId` từ params
   - Pass `conversationId` + `messageId` tới service

3. **Backend Service (MessageService.js):**
   - `getConversationMessages()` → Sử dụng `getByConversation()` thay vì `findByConversationId()`
   - `editMessage(conversationId, messageId, senderId, newContent)`
   - `deleteMessage(conversationId, messageId, senderId)`
   - `markAsDeliveredInConversation(conversationId, messageId, userId)`
   - `markAsSeen(conversationId, userId)` → Sử dụng `getByConversation()` + `update(conversationId, messageId, ...)`
   - `addEmoji(conversationId, messageId, userId, emoji)`
   - `removeEmoji(conversationId, messageId, userId, emoji)`
   - Tất cả `MessageRepository.update()` calls sửa từ `update(messageId, ...)` → `update(conversationId, messageId, ...)`

4. **Frontend API (api.js):**
   - `editMessage(conversationId, messageId, content)` → `PUT /messages/:conversationId/:messageId`
   - `deleteMessage(conversationId, messageId)` → `DELETE /messages/:conversationId/:messageId`
   - `markAsDelivered(conversationId, messageId)` → `POST /messages/:conversationId/:messageId/delivered`
   - `addEmoji(conversationId, messageId, emoji)` → `POST /messages/:conversationId/:messageId/emoji`
   - `removeEmoji(conversationId, messageId, emoji)` → `DELETE /messages/:conversationId/:messageId/emoji`

**Key Changes:**
- Message operations nhất thiết cần cả conversationId + messageId
- DynamoDB composite key: (conversationId, messageId)
- Tất cả message queries phải qua `getByConversation()` GSI
- Routes và services đồng bộ về signature params

---

#### Issue: "Each child in a list should have a unique 'key' prop" + "Cannot read properties of undefined (reading '_id')"
**Root Cause:**
1. ChatWindow map messages nhưng không pass `key` prop cho Message
2. Message component cố access `message.senderId._id` nhưng backend trả về `message.userId` (string)
3. Mismatch giữa backend field names (`userId`) và frontend expectations (`senderId._id`)

**Solution Applied:**

1. **Frontend - Message.jsx:**
   - Thêm null safety check: `if (!message) return null`
   - Normalize field names:
     - `const senderId = message.senderId || message.userId`
     - `const messageId = message._id || message.messageId`
   - Fix comparison: `senderId === currentUserId` thay vì `message.senderId._id === currentUserId`

2. **Frontend - ChatWindow.jsx:**
   - Sửa key prop: `key={message._id || message.messageId}` (fallback cho cả hai)
   - Sửa senderInfo lookup: `p._id === (message.senderId || message.userId)`
   - Filter expression match message userId/senderId

3. **Frontend - ErrorBoundary.jsx (NEW):**
   - Tạo component ErrorBoundary để catch React errors
   - Display user-friendly error messages
   - Allow retry action

4. **Frontend - ChatPage.jsx:**
   - Import và wrap ChatWindow với `<ErrorBoundary>`
   - Prevent full app crash khi Message component có error

**Key Changes:**
- Message component: Normalize senderId & messageId với fallback
- ChatWindow: Add proper key prop + fallback fields
- Error handling: Add ErrorBoundary cho graceful error display
- Null safety: Check message exists trước khi render

### Performance Tips
- Use pagination for lists
- Cache frequently accessed data in Redis
- Optimize Socket.IO events (send only necessary data)
- Use indexes in DynamoDB for queries
- Lazy load components in React

---

**End of Project Overview**

This document serves as a quick reference guide for understanding TixChat without reading all source code. For detailed information, refer to specific documentation files in the `docs/` folder.
