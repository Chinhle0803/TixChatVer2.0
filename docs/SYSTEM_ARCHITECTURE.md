# 🏗️ Kiến Trúc Hệ Thống TixChat

## 1. Tổng Quan Kiến Trúc

```
┌──────────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER (React)                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Browser - React 18 + Vite                                │   │
│  │ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │   │
│  │ │  Components  │  │    Pages     │  │    Hooks     │    │   │
│  │ └──────────────┘  └──────────────┘  └──────────────┘    │   │
│  │ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │   │
│  │ │ Zustand Store│  │  Services    │  │   Context    │    │   │
│  │ └──────────────┘  └──────────────┘  └──────────────┘    │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────┬────────────────────┘
                        │                     │
        ┌───────────────┴─────────────────────┴──────────────┐
        │     HTTP REST API    │    WebSocket (Socket.IO)   │
        │                      │                             │
┌───────┴──────────────────────┴─────────────────────────────┐
│            SERVER LAYER (Node.js + Express)                │
│  ┌────────────────────────────────────────────────────┐   │
│  │ Express Server (Port 5000)                         │   │
│  │ ┌──────────────┐  ┌──────────────────────────┐    │   │
│  │ │  Routes      │  │  Socket.IO Handlers      │    │   │
│  │ ├──────────────┤  ├──────────────────────────┤    │   │
│  │ │ /api/auth    │  │ message:send             │    │   │
│  │ │ /api/users   │  │ user:typing              │    │   │
│  │ │ /api/messages│  │ conversation:update      │    │   │
│  │ │ /api/chat    │  │ user:online/offline      │    │   │
│  │ └──────────────┘  └──────────────────────────┘    │   │
│  │                                                     │   │
│  │ ┌────────────────────────────────────────────┐    │   │
│  │ │ Controllers (Request Handlers)              │    │   │
│  │ ├────────────────────────────────────────────┤    │   │
│  │ │ AuthController  │ ConversationController   │    │   │
│  │ │ UserController  │ MessageController        │    │   │
│  │ └────────────────────────────────────────────┘    │   │
│  │                                                     │   │
│  │ ┌────────────────────────────────────────────┐    │   │
│  │ │ Services (Business Logic + Event Emitter)  │    │   │
│  │ ├────────────────────────────────────────────┤    │   │
│  │ │ AuthService  │ ConversationService         │    │   │
│  │ │ UserService  │ MessageService              │    │   │
│  │ │ EmailService │ S3Service                   │    │   │
│  │ └────────────────────────────────────────────┘    │   │
│  │                  │                                 │   │
│  │                  ├─────────────────────────────┐  │   │
│  │                  ▼                             │  │   │
│  │ ┌────────────────────────────┐  ┌────────────┐│  │   │
│  │ │ Event Bus (EventEmitter)   │  │  Repositories
│  │ │ - USER_EVENTS              │  │            ││  │   │
│  │ │ - MESSAGE_EVENTS           │  │ UserRepo   ││  │   │
│  │ │ - CONVERSATION_EVENTS      │  │ MessageRepo││  │   │
│  │ └────────────────────────────┘  │ ConvRepo   ││  │   │
│  │                                  │ PartRepo   ││  │   │
│  │ ┌──────────────────────────────┐ └────────────┘│  │   │
│  │ │ Middleware Stack             │               │  │   │
│  │ ├──────────────────────────────┤               │  │   │
│  │ │ CORS                         │               │  │   │
│  │ │ Body Parser                  │               │  │   │
│  │ │ Authentication (JWT)         │               │  │   │
│  │ │ Validation (Joi)             │               │  │   │
│  │ │ Error Handler                │               │  │   │
│  │ │ File Upload (Multer)         │               │  │   │
│  │ └──────────────────────────────┘               │  │   │
│  │                                                │  │   │
│  │ ┌──────────────────────────────┐              │  │   │
│  │ │ External Services            │              │  │   │
│  │ ├──────────────────────────────┤              │  │   │
│  │ │ AWS S3 (File Storage)        │              │  │   │
│  │ │ AWS SES (Email)              │              │  │   │
│  │ │ Redis (Caching)              │              │  │   │
│  │ └──────────────────────────────┘              │  │   │
│  └──────────────────────────────────────────────────┘   │
└───────┬──────────────────────────────────────────────────┘
        │
        ├─────────────────────┬──────────────────┬────────────┐
        │                     │                  │            │
        ▼                     ▼                  ▼            ▼
   ┌──────────┐          ┌──────────┐      ┌──────────┐  ┌────────┐
   │  MongoDB │          │   Redis  │      │ AWS S3   │  │AWS SES │
   │          │          │          │      │          │  │        │
   │ Database │          │ Cache    │      │  Files   │  │ Email  │
   └──────────┘          └──────────┘      └──────────┘  └────────┘
```

---

## 2. Chi Tiết Các Lớp

### 2.1 Client Layer (React)

#### **Cấu Trúc Thư Mục**
```
frontend/src/
├── components/          # Reusable UI Components
│   ├── ChatWindow.jsx   # Giao diện chat chính
│   ├── ConversationList.jsx # Danh sách hội thoại
│   └── Message.jsx      # Component tin nhắn
├── pages/              # Các trang ứng dụng
│   ├── AuthContainer.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── VerifyEmailPage.jsx
│   ├── VerifyOTPPage.jsx
│   ├── ChatPage.jsx
│   └── ProfilePage.jsx
├── hooks/              # Custom React Hooks
│   ├── useAuth.js      # Auth logic
│   ├── useChat.js      # Chat logic
│   └── useSocket.js    # Socket.IO connection
├── services/           # API & Socket Services
│   ├── api.js          # HTTP Client (Axios)
│   └── socket.js       # WebSocket Client
├── store/              # Zustand State Management
│   ├── authStore.js    # User & Auth state
│   └── chatStore.js    # Chat & Message state
├── context/            # React Context Providers
├── styles/             # CSS Files
└── utils/              # Helper Functions
```

#### **Luồng Dữ Liệu**
```
User Interaction
    │
    ▼
Component Handler
    │
    ├─→ Zustand Store (State Update)
    │       │
    │       ├─→ Render UI
    │       └─→ Emit Event (via Socket/API)
    │
    ├─→ API Service / Socket Service
    │       │
    │       └─→ Send to Backend
    │
    └─→ (Backend Response)
            │
            ├─→ Update Store
            └─→ Re-render Component
```

---

### 2.2 Server Layer (Node.js + Express)

#### **Cấu Trúc Thư Mục**
```
backend/src/
├── config/              # Configuration
│   └── index.js        # Environment configs
├── routes/             # API Endpoints
│   ├── auth.js         # Authentication routes
│   ├── user.js         # User routes
│   ├── conversation.js # Conversation routes
│   ├── message.js      # Message routes
│   └── email.js        # Email routes
├── controllers/        # Request Handlers
│   ├── AuthController.js
│   ├── UserController.js
│   ├── ConversationController.js
│   └── MessageController.js
├── services/           # Business Logic (Event-Driven)
│   ├── AuthService.js
│   ├── UserService.js
│   ├── ConversationService.js
│   ├── MessageService.js
│   ├── EmailService.js
│   └── S3Service.js
├── models/             # Data Models (MongoDB Schemas)
│   ├── User.js
│   ├── Conversation.js
│   ├── Message.js
│   └── Participant.js
├── repositories/       # Data Access Layer
│   ├── UserRepository.js
│   ├── ConversationRepository.js
│   ├── MessageRepository.js
│   └── ParticipantRepository.js
├── middleware/         # Request Processing Pipeline
│   ├── auth.js         # JWT Authentication
│   ├── errorHandler.js # Global Error Handler
│   └── upload.js       # File Upload Handler
├── socket/             # WebSocket Handlers
│   └── handlers.js     # Socket.IO event handlers
├── events/             # Event-Driven System
│   ├── EventBus.js     # Event Emitter
│   └── EventTypes.js   # Event type definitions
├── db/                 # Database
│   ├── connection.js   # MongoDB connection
│   └── dynamodb.js     # AWS DynamoDB setup
├── utils/              # Helper Functions
│   ├── passwordUtils.js
│   ├── tokenUtils.js
│   └── validation.js
└── server.js           # Entry Point
```

#### **Luồng Xử Lý Request**

```
HTTP Request / WebSocket Event
    │
    ▼
├─────────────────────────────────────
│ Middleware Pipeline (Top to Bottom)
├─────────────────────────────────────
│ 1. CORS Handler
│ 2. Body Parser
│ 3. JWT Authentication
│ 4. Request Validation (Joi)
│ 5. File Upload Handler
└─────────────────────────────────────
    │
    ▼
Route Handler (Router)
    │
    ▼
Controller (Request Logic)
    │
    ▼
Service (Business Logic)
    │
    ├─→ Repository (Database Operations)
    │       │
    │       └─→ MongoDB / DynamoDB
    │
    ├─→ EventBus.emit()
    │       │
    │       └─→ Event Listeners
    │           │
    │           ├─→ EmailService (Send email)
    │           ├─→ S3Service (Upload file)
    │           └─→ Socket.IO (Real-time broadcast)
    │
    └─→ Response to Client
        ├─→ HTTP Response (JSON)
        └─→ WebSocket Emit (Real-time)
```

---

### 2.3 Data Layer

#### **MongoDB Collections**

```
┌─────────────────────────────────────┐
│           MongoDB                    │
├─────────────────────────────────────┤
│                                      │
│ ┌──────────────┐   ┌──────────────┐  │
│ │ users        │   │ conversations│  │
│ ├──────────────┤   ├──────────────┤  │
│ │ _id          │   │ _id          │  │
│ │ email        │   │ name         │  │
│ │ name         │   │ type         │  │
│ │ password     │   │ createdAt    │  │
│ │ profile      │   │ updatedAt    │  │
│ │ avatar       │   │ lastMessage  │  │
│ │ status       │   └──────────────┘  │
│ │ createdAt    │                      │
│ │ updatedAt    │   ┌──────────────┐  │
│ └──────────────┘   │ messages     │  │
│                    ├──────────────┤  │
│ ┌──────────────┐   │ _id          │  │
│ │ participants │   │ conversationId
│ ├──────────────┤   │ senderId     │  │
│ │ _id          │   │ content      │  │
│ │ conversationId
│ │ userId       │   │ attachments  │  │
│ │ joinedAt     │   │ createdAt    │  │
│ │ role         │   │ readBy       │  │
│ └──────────────┘   └──────────────┘  │
│                                      │
└─────────────────────────────────────┘
```

#### **Mối Quan Hệ (Relationships)**

```
User (1) ──┬─→ (n) Conversation [via Participant]
           │
           ├─→ (n) Message (senderId)
           │
           └─→ (n) Conversation (creator)

Conversation (1) ──┬─→ (n) Message
                   │
                   ├─→ (n) Participant
                   │
                   └─→ (n) User [via Participant]

Participant (n) ──→ User
            (n) ──→ Conversation

Message (n) ──┬─→ (1) User (senderId)
              └─→ (1) Conversation
```

---

### 2.4 Event-Driven Architecture

#### **Event Flow Diagram**

```
┌─────────────────────────────────────────────────────────────┐
│ Services (Emit Events)                                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ ┌──────────────────┐  ┌──────────────────┐                  │
│ │ AuthService      │  │ UserService      │                  │
│ ├──────────────────┤  ├──────────────────┤                  │
│ │ .register()      │  │ .updateProfile() │                  │
│ │   emit REGISTERED   emit PROFILE_UPDATED
│ │ .login()         │  │ .uploadAvatar()  │                  │
│ │   emit LOGGED_IN │  │   emit AVATAR_UPDATED
│ │ .logout()        │  │                  │                  │
│ │   emit LOGGED_OUT   └──────────────────┘                  │
│ └──────────────────┘                                         │
│                                                               │
│ ┌──────────────────┐  ┌──────────────────┐                  │
│ │MessageService    │  │ConversationService
│ ├──────────────────┤  ├──────────────────┤                  │
│ │.sendMessage()    │  │.createConversation
│ │ emit SENT        │  │  emit CREATED    │                  │
│ │.deleteMessage()  │  │.addParticipant() │                  │
│ │ emit DELETED     │  │  emit PARTICIPANT_ADDED
│ │.markAsRead()     │  │.updateConversation
│ │ emit READ        │  │  emit UPDATED    │                  │
│ └──────────────────┘  └──────────────────┘                  │
│                                                               │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼ (Emit to EventBus)
                    ┌──────────────────┐
                    │  EventBus        │
                    │  (EventEmitter)  │
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┬──────────┐
              │              │              │          │
              ▼              ▼              ▼          ▼
    ┌──────────────────┐  ┌─────────────┐  ┌────────┐ ┌──────────┐
    │  Socket.IO       │  │ EmailService│  │ Logger │ │ Analytics│
    │  Broadcasting    │  │             │  │        │ │          │
    ├──────────────────┤  ├─────────────┤  └────────┘ └──────────┘
    │Emit to rooms:    │  │ Send email  │
    │ - user:online    │  │ - Welcome   │
    │ - message:sent   │  │ - OTP       │
    │ - message:deleted│  │ - Password  │
    │ - user:typing    │  │   Reset     │
    │ - user:offline   │  │ - Notify    │
    └──────────────────┘  └─────────────┘
```

#### **Event Types**

```javascript
// AuthEvents
USER_REGISTERED
USER_LOGGED_IN
USER_LOGGED_OUT
PASSWORD_CHANGED

// UserEvents
PROFILE_UPDATED
AVATAR_UPLOADED
STATUS_CHANGED

// MessageEvents
MESSAGE_SENT
MESSAGE_DELETED
MESSAGE_READ
USER_TYPING

// ConversationEvents
CONVERSATION_CREATED
CONVERSATION_UPDATED
PARTICIPANT_ADDED
PARTICIPANT_REMOVED
CONVERSATION_ARCHIVED
```

---

## 3. Luồng Dữ Liệu Chính

### 3.1 Đăng Ký (Registration Flow)

```
Frontend                          Backend                       Database
   │                               │                              │
   ├─ Form Input                  │                              │
   │     │                         │                              │
   │     └─→ Validate Input        │                              │
   │         │                     │                              │
   │         ├─→ POST /api/auth/register                          │
   │         │     │                                              │
   │         │     ├─→ AuthController.register()                  │
   │         │     │     │                                        │
   │         │     │     ├─→ Validate data (Joi)                  │
   │         │     │     │     │                                  │
   │         │     │     │     ├─→ Check user exists              │
   │         │     │     │     │     │                            │
   │         │     │     │     │     └─→ UserRepository.findByEmail()
   │         │     │     │     │                                  │
   │         │     │     │     └─→ Hash password                  │
   │         │     │     │                                        │
   │         │     │     ├─→ AuthService.register()               │
   │         │     │     │     │                                  │
   │         │     │     │     ├─→ Create user document           │
   │         │     │     │     │     │                            │
   │         │     │     │     │     └─→ UserRepository.create()  │
   │         │     │     │     │             │                    │
   │         │     │     │     │             └──────────────────→ Insert
   │         │     │     │     │                                  │
   │         │     │     │     ├─→ emit(USER_REGISTERED)          │
   │         │     │     │     │     │                            │
   │         │     │     │     │     └─→ EventBus ─→ EmailService │
   │         │     │     │     │               │                  │
   │         │     │     │     │               └─→ Send Welcome Email
   │         │     │     │     │                                  │
   │         │     │     │     └─→ Generate OTP                   │
   │         │     │     │         │                              │
   │         │     │     │         └─→ Save OTP (Redis)           │
   │         │     │     │                                        │
   │         │     │     └─→ Return user + token                  │
   │         │     │                                              │
   │         │←────┴─ 200 OK {user, token}                        │
   │         │                                                    │
   │         └─→ Update Store (authStore)                         │
   │             │                                               │
   │             └─→ Re-render → VerifyEmailPage                │
   │                                                              │
```

### 3.2 Gửi Tin Nhắn (Message Flow)

```
Frontend (Chat Page)              Backend (Socket.IO)           Database
    │                                    │                          │
    ├─ User types message               │                          │
    │     │                             │                          │
    │     └─→ socket.emit('message:send', {
    │         conversationId,
    │         content
    │     })
    │         │                         │                          │
    │         │                    ┌────┴─→ Socket Handler         │
    │         │                    │     │                         │
    │         │                    │     ├─→ Validate data         │
    │         │                    │     │                         │
    │         │                    │     ├─→ MessageService.send()│
    │         │                    │     │     │                  │
    │         │                    │     │     ├─→ Create message  │
    │         │                    │     │     │     │             │
    │         │                    │     │     │     └──→ Insert   │
    │         │                    │     │     │                  │
    │         │                    │     │     ├─→ emit(MESSAGE_SENT)
    │         │                    │     │     │     │             │
    │         │                    │     │     │     └─→ EventBus  │
    │         │                    │     │     │           │       │
    │         │                    │     │     │           └─→ Socket broadcast
    │         │                    │     │     │                  │
    │         │                    │     │     └─→ Return message  │
    │         │                    │     │                         │
    │         │←───────────────────┴────┴─ socket.emit('message:sent', message)
    │         │                                                    │
    │         └─→ Update chatStore                                │
    │             ├─→ Add to messages array                        │
    │             └─→ Re-render ChatWindow                        │
    │                                                              │
    │ [All other users in room receive broadcast]                │
    │                                                              │
    └─→ More participants in same conversation receive           │
        'message:sent' event and update their UI               │
```

### 3.3 Real-time Typing Indicator

```
Frontend                          Socket.IO                  Other Clients
   │                                 │                          │
   ├─ User starts typing             │                          │
   │     │                           │                          │
   │     └─→ socket.emit('user:typing', {
   │         conversationId,
   │         userId
   │     })
   │         │                       │                          │
   │         │                  ┌────┴─→ broadcast to room      │
   │         │                  │         io.to(`conv:${id}`)   │
   │         │                  │             .emit('user:typing',
   │         │                  │                  {userId})    │
   │         │                  │                       │        │
   │         │                  │                       └───────→ Update UI
   │         │                  │                              │
   │         │                  │                              ├─ Show "typing..."
   │         │                  │                              │
   │         └─ [Timer: 3s]     │                              │
   │             │              │                              │
   │             └─→ auto-clear └─ broadcast 'user:stopped_typing'
   │                 if no more events                          │
                                                               └─ Hide "typing..."
```

---

## 4. Các Thành Phần Chính

### 4.1 Repositories (Data Access Layer)

```javascript
// UserRepository.js
├─ create(userData)          // Insert user
├─ findById(userId)          // Find by ID
├─ findByEmail(email)        // Find by email
├─ update(userId, updates)   // Update user
├─ delete(userId)            // Delete user
└─ search(query)             // Search users

// MessageRepository.js
├─ create(messageData)       // Insert message
├─ findById(messageId)       // Find by ID
├─ findByConversation(convId, limit, skip)  // Pagination
├─ update(messageId, updates)// Update
├─ delete(messageId)         // Delete
└─ markAsRead(messageIds)    // Mark read

// ConversationRepository.js
├─ create(conversationData)  // Create conversation
├─ findById(convId)          // Find by ID
├─ findUserConversations(userId, limit, skip)
├─ update(convId, updates)   // Update
├─ delete(convId)            // Delete
└─ search(userId, query)     // Search conversations

// ParticipantRepository.js
├─ create(participantData)   // Add participant
├─ findByConversation(convId)// Get all participants
├─ findByUser(userId)        // Get user's conversations
├─ update(participantId, updates)
├─ delete(participantId)     // Remove participant
└─ findUserRole(userId, convId)
```

### 4.2 Services (Business Logic)

```javascript
// AuthService.js
├─ register(email, password, name)
│   └─ emit(USER_REGISTERED)
├─ login(email, password)
│   └─ emit(USER_LOGGED_IN)
├─ logout(userId)
│   └─ emit(USER_LOGGED_OUT)
├─ resetPassword(email)
├─ changePassword(userId, oldPassword, newPassword)
└─ generateTokens(userId)

// UserService.js
├─ getProfile(userId)
├─ updateProfile(userId, updates)
│   └─ emit(PROFILE_UPDATED)
├─ uploadAvatar(userId, file)
│   └─ emit(AVATAR_UPLOADED)
│       └─ S3Service.uploadFile()
├─ setStatus(userId, status)
│   └─ emit(STATUS_CHANGED)
└─ deleteAccount(userId)

// MessageService.js
├─ sendMessage(convId, senderId, content)
│   └─ emit(MESSAGE_SENT)
├─ deleteMessage(messageId, userId)
│   └─ emit(MESSAGE_DELETED)
├─ getMessages(convId, limit, skip)
├─ markAsRead(convId, userId)
│   └─ emit(MESSAGE_READ)
└─ searchMessages(convId, query)

// ConversationService.js
├─ createConversation(userId, participantIds, name)
│   └─ emit(CONVERSATION_CREATED)
├─ getConversations(userId, limit, skip)
├─ updateConversation(convId, updates)
│   └─ emit(CONVERSATION_UPDATED)
├─ addParticipant(convId, userId)
│   └─ emit(PARTICIPANT_ADDED)
├─ removeParticipant(convId, userId)
│   └─ emit(PARTICIPANT_REMOVED)
└─ deleteConversation(convId)

// EmailService.js
├─ sendWelcomeEmail(email, name)
├─ sendOTPEmail(email, otp)
├─ sendPasswordResetEmail(email, resetLink)
└─ sendNotificationEmail(email, data)

// S3Service.js
├─ uploadFile(file, folder)
├─ deleteFile(key)
├─ generatePresignedUrl(key)
└─ getFileUrl(key)
```

---

## 5. Security & Authentication

### 5.1 Authentication Flow

```
┌─────────────────────────────────────┐
│ JWT Token Flow                       │
├─────────────────────────────────────┤
│                                      │
│ 1. User Login                        │
│    └─→ Generate JWT Token            │
│        ├─ Access Token (15 min)      │
│        └─ Refresh Token (7 days)     │
│                                      │
│ 2. Subsequent Requests               │
│    └─→ Include JWT in Header         │
│        Authorization: Bearer <token>│
│                                      │
│ 3. Middleware (authenticateToken)    │
│    └─→ Verify & Decode JWT           │
│        ├─ Valid → Next Middleware    │
│        └─ Invalid → 403 Forbidden    │
│                                      │
│ 4. Socket.IO Connection              │
│    └─→ Handshake with Token          │
│        ├─ Query: ?token=<jwt>        │
│        └─ Header: Authorization      │
│                                      │
└─────────────────────────────────────┘
```

### 5.2 Security Features

```
┌─────────────────────────────────────────────┐
│ Security Mechanisms                          │
├─────────────────────────────────────────────┤
│                                              │
│ ✓ JWT Authentication                        │
│   └─ Tokens signed with SECRET_KEY          │
│                                              │
│ ✓ Password Hashing                          │
│   └─ bcryptjs with salt rounds = 10         │
│                                              │
│ ✓ CORS Protection                           │
│   └─ Origin whitelist                       │
│                                              │
│ ✓ Request Validation                        │
│   └─ Joi schema validation                  │
│                                              │
│ ✓ Rate Limiting                             │
│   └─ Prevent brute force attacks            │
│                                              │
│ ✓ SQL Injection Protection                  │
│   └─ MongoDB parameterized queries          │
│                                              │
│ ✓ XSS Protection                            │
│   └─ No inline scripts in HTML              │
│                                              │
│ ✓ Error Handling                            │
│   └─ Generic error messages to client       │
│                                              │
│ ✓ HTTPS/WSS                                 │
│   └─ Encrypted communication                │
│                                              │
└─────────────────────────────────────────────┘
```

---

## 6. Scalability & Performance

### 6.1 Caching Strategy

```
┌──────────────────────────────────────┐
│ Redis Caching Layers                  │
├──────────────────────────────────────┤
│                                       │
│ Level 1: Session Cache               │
│ ├─ User session data                 │
│ ├─ JWT refresh tokens                │
│ └─ TTL: 7 days                       │
│                                       │
│ Level 2: Data Cache                  │
│ ├─ User profiles                     │
│ ├─ User online status                │
│ ├─ Conversation metadata             │
│ └─ TTL: 1 hour                       │
│                                       │
│ Level 3: OTP Cache                   │
│ ├─ Email OTPs                        │
│ ├─ Password reset codes              │
│ └─ TTL: 15 minutes                   │
│                                       │
│ Level 4: Rate Limiting               │
│ ├─ API call counts                   │
│ ├─ Login attempts                    │
│ └─ TTL: 15 minutes                   │
│                                       │
└──────────────────────────────────────┘
```

### 6.2 Performance Optimization

```
Frontend
├─ Code Splitting (Vite)
├─ Lazy Loading
├─ Image Optimization
├─ CSS Minification
├─ Component Memoization (React.memo)
└─ Virtual Scrolling (Message lists)

Backend
├─ Database Indexing
│  └─ userId, email, conversationId, createdAt
├─ Pagination (Messages, Conversations)
├─ Connection Pooling
├─ Gzip Compression
├─ Request Caching (Redis)
└─ Async/Await (Non-blocking I/O)

Infrastructure
├─ Load Balancing
├─ Horizontal Scaling
│  └─ Redis Adapter for Socket.IO
├─ CDN for Static Assets
├─ Database Replication
└─ Monitoring & Logging
```

---

## 7. API Endpoints

### 7.1 Authentication APIs

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/auth/register` | ✗ | Register user |
| POST | `/api/auth/login` | ✗ | Login user |
| POST | `/api/auth/logout` | ✓ | Logout user |
| POST | `/api/auth/verify-otp` | ✗ | Verify OTP |
| POST | `/api/auth/resend-otp` | ✗ | Resend OTP |
| POST | `/api/auth/forgot-password` | ✗ | Request password reset |
| POST | `/api/auth/reset-password` | ✗ | Reset password |
| POST | `/api/auth/refresh-token` | ✓ | Refresh JWT token |

### 7.2 User APIs

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/users/profile` | ✓ | Get current user |
| GET | `/api/users/:id` | ✓ | Get user profile |
| PUT | `/api/users/profile` | ✓ | Update profile |
| POST | `/api/users/avatar` | ✓ | Upload avatar |
| PUT | `/api/users/status` | ✓ | Update online status |
| GET | `/api/users/search` | ✓ | Search users |

### 7.3 Conversation APIs

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/conversations` | ✓ | Create conversation |
| GET | `/api/conversations` | ✓ | Get all conversations |
| GET | `/api/conversations/:id` | ✓ | Get conversation details |
| PUT | `/api/conversations/:id` | ✓ | Update conversation |
| DELETE | `/api/conversations/:id` | ✓ | Delete conversation |
| POST | `/api/conversations/:id/participants` | ✓ | Add participant |
| DELETE | `/api/conversations/:id/participants/:userId` | ✓ | Remove participant |

### 7.4 Message APIs

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/messages/:convId` | ✓ | Get messages |
| POST | `/api/messages` | ✓ | Send message (REST) |
| PUT | `/api/messages/:id` | ✓ | Edit message |
| DELETE | `/api/messages/:id` | ✓ | Delete message |
| PUT | `/api/messages/:id/read` | ✓ | Mark as read |
| GET | `/api/messages/search` | ✓ | Search messages |

---

## 8. Socket.IO Events

### 8.1 Client → Server

```javascript
// Connection
socket.emit('connection')

// Messaging
socket.emit('message:send', { conversationId, content })
socket.emit('message:edit', { messageId, content })
socket.emit('message:delete', { messageId })

// Presence
socket.emit('user:online', { userId })
socket.emit('user:offline', { userId })
socket.emit('user:typing', { conversationId })

// Conversation
socket.emit('conversation:create', { participantIds, name })
socket.emit('conversation:update', { conversationId, data })
socket.emit('participant:add', { conversationId, userId })
socket.emit('participant:remove', { conversationId, userId })
```

### 8.2 Server → Client

```javascript
// Messages
socket.emit('message:sent', { message })
socket.emit('message:edited', { message })
socket.emit('message:deleted', { messageId })
socket.emit('message:received', { message })

// Presence
socket.emit('user:online', { userId })
socket.emit('user:offline', { userId })
socket.emit('user:typing', { userId })

// Conversation
socket.emit('conversation:created', { conversation })
socket.emit('conversation:updated', { conversation })
socket.emit('participant:added', { participant })
socket.emit('participant:removed', { userId })
```

---

## 9. Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Production Environment (Cloud/On-Premise)               │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ┌──────────────────────────────────────────────────┐   │
│ │ CDN / Reverse Proxy (Nginx/CloudFront)          │   │
│ └────────────────┬─────────────────────────────────┘   │
│                  │                                       │
│     ┌────────────┼────────────┐                         │
│     │            │            │                         │
│     ▼            ▼            ▼                         │
│  ┌──────┐   ┌──────┐   ┌──────┐                       │
│  │Node1 │   │Node2 │   │Node3 │                       │
│  │App   │   │App   │   │App   │  (Load Balanced)     │
│  └──┬───┘   └──┬───┘   └──┬───┘                       │
│     │          │          │                           │
│     └──────────┼──────────┘                           │
│                │                                       │
│                ▼                                       │
│         ┌─────────────────┐                           │
│         │ Redis Cluster   │ (Session & Cache)        │
│         └─────────────────┘                           │
│                │                                       │
│                ▼                                       │
│         ┌─────────────────┐                           │
│         │ MongoDB Cluster │ (Primary + Replicas)     │
│         └─────────────────┘                           │
│                                                        │
│  ┌─────────────────────────────────────────────┐     │
│  │ External Services                            │     │
│  │ ├─ AWS S3 (File Storage)                     │     │
│  │ ├─ AWS SES (Email Service)                   │     │
│  │ └─ CloudWatch (Monitoring/Logging)           │     │
│  └─────────────────────────────────────────────┘     │
│                                                        │
└─────────────────────────────────────────────────────────┘
```

---

## 10. Technology Stack Summary

```
┌───────────────────────────────────────────────────────┐
│ FRONTEND                                               │
├───────────────────────────────────────────────────────┤
│ • React 18 (UI Library)                               │
│ • Vite (Build Tool)                                   │
│ • Socket.IO Client (Real-time Communication)          │
│ • Axios (HTTP Client)                                 │
│ • Zustand (State Management)                          │
│ • React Router (Navigation)                           │
│ • CSS3 (Styling)                                      │
└───────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────┐
│ BACKEND                                                │
├───────────────────────────────────────────────────────┤
│ • Node.js (Runtime)                                   │
│ • Express (Web Framework)                             │
│ • Socket.IO (Real-time Server)                        │
│ • MongoDB (Primary Database)                          │
│ • Mongoose (ODM)                                      │
│ • JWT (Authentication)                                │
│ • bcryptjs (Password Hashing)                         │
│ • Joi (Validation)                                    │
│ • Multer (File Upload)                                │
│ • Redis (Caching & Sessions)                          │
│ • AWS SDK (S3, SES)                                   │
│ • nodemailer (Email)                                  │
│ • cors (CORS Middleware)                              │
└───────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────┐
│ INFRASTRUCTURE                                         │
├───────────────────────────────────────────────────────┤
│ • MongoDB (NoSQL Database)                            │
│ • Redis (In-Memory Cache)                             │
│ • AWS S3 (Cloud Storage)                              │
│ • AWS SES (Email Service)                             │
│ • CloudWatch (Monitoring)                             │
│ • Docker (Containerization)                           │
│ • GitHub/GitLab (Version Control)                     │
└───────────────────────────────────────────────────────┘
```

---

## 11. Tổng Kết

Kiến trúc TixChat được thiết kế với các nguyên tắc:

✅ **Modular** - Phân chia rõ ràng giữa các lớp  
✅ **Scalable** - Hỗ trợ phân tán với Redis & Load Balancing  
✅ **Real-time** - Sử dụng Socket.IO cho giao tiếp tức thời  
✅ **Event-Driven** - Các thành phần liên lạc qua sự kiện  
✅ **Secure** - JWT, mã hóa mật khẩu, CORS, validation  
✅ **Maintainable** - Code sạch, dễ test, tài liệu đầy đủ  

