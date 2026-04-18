# 📱 TixChat - Tổng Quan Dự Án

**Phiên bản:** 1.1.0  
**Cập nhật lần cuối:** 13 tháng 4, 2026  
**Mục đích:** Tổng quan toàn diện về dự án để AI hiểu mà không cần đọc toàn bộ mã nguồn

---

## 🎯 Mô Tả Dự Án

**TixChat** là một ứng dụng chat thời gian thực tương tự Messenger/WhatsApp được xây dựng với công nghệ hiện đại. Nó cung cấp nhắn tin thời gian thực, xác thực người dùng, hồ sơ và quản lý cuộc trò chuyện.

### Các Tính Năng Lõi

#### ✅ **CÁC TÍNH NĂNG ĐÃ HOÀN THÀNH (Phiên bản 1.1.0)**

**Xác thực & Bảo mật**
- ✅ Đăng ký người dùng với xác minh email (OTP)
- ✅ Đăng nhập người dùng với JWT tokens (access + refresh)
- ✅ Băm mật khẩu với bcryptjs (10 salt rounds)
- ✅ Luồng đặt lại mật khẩu với xác minh email
- ✅ Thay đổi mật khẩu với xác minh mật khẩu hiện tại
- ✅ JWT middleware cho các tuyến được bảo vệ
- ✅ Cơ chế làm mới token
- ✅ Xác thực đầu vào với lược đồ Joi

**Quản lý Người dùng**
- ✅ Hồ sơ người dùng với tiểu sử có thể tùy chỉnh
- ✅ Tải lên avatar lên AWS S3 với lưu trữ URL
- ✅ Xóa và thay thế avatar
- ✅ Tìm kiếm người dùng theo tên/tên đăng nhập/email
- ✅ Theo dõi trạng thái trực tuyến/ngoại tuyến của người dùng
- ✅ Dấu thời gian lần cuối xem

**Nhắn tin Thời gian Thực**
- ✅ Nhắn tin thời gian thực với Socket.IO (không bỏ phiếu)
- ✅ Gửi, nhận và phát sóng tin nhắn
- ✅ Chỉnh sửa tin nhắn với theo dõi dấu thời gian
- ✅ Xóa tin nhắn (xóa mềm với cờ `isDeleted`)
- ✅ Trạng thái gửi tin nhắn (đã gửi → đã gửi → đã xem)
- ✅ Phản ứng tin nhắn với hỗ trợ emoji
- ✅ Trả lời/theo dõi tin nhắn (trường replyTo)
- ✅ Chỉ báo nhập liệu qua Socket.IO
- ✅ Tệp đính kèm tin nhắn (URL trong S3)

**Quản lý Cuộc trò chuyện**
- ✅ Tạo các cuộc trò chuyện riêng 1-trên-1
- ✅ Tạo các cuộc trò chuyện nhóm
- ✅ Phát hiện tự động cuộc trò chuyện 1-trên-1 trùng lặp
- ✅ Lấy danh sách cuộc trò chuyện của người dùng (phân trang)
- ✅ Lấy chi tiết cuộc trò chuyện với những người tham gia
- ✅ Cập nhật cuộc trò chuyện (tên, mô tả, avatar cho nhóm)
- ✅ Lưu trữ/xóa mềm cuộc trò chuyện
- ✅ Thêm/xóa những người tham gia khỏi nhóm
- ✅ Vai trò của những người tham gia (thành viên, quản trị viên, chủ sở hữu)
- ✅ Xem trước tin nhắn cuối cùng trong danh sách cuộc trò chuyện
- ✅ Dấu thời gian tin nhắn cuối cùng

**Tính năng Frontend**
- ✅ Các trang xác thực: Đăng nhập, Đăng ký, Quên mật khẩu, Xác minh email, Xác minh OTP
- ✅ Trang trò chuyện với cập nhật thời gian thực
- ✅ Trang hồ sơ người dùng với tải lên avatar
- ✅ Danh sách cuộc trò chuyện với modal tìm kiếm (🔍)
- ✅ Cửa sổ trò chuyện với hiển thị tin nhắn
- ✅ Nhập tin nhắn với hỗ trợ emoji
- ✅ Tìm kiếm người dùng theo tên/tên đăng nhập để bắt đầu cuộc trò chuyện mới
- ✅ Tự động phát hiện trò chuyện 1-1 hiện có hoặc tạo trò chuyện mới
- ✅ Luồng yêu cầu kết bạn (gửi, chấp nhận, từ chối, trạng thái chờ)
- ✅ Menu ngữ cảnh tin nhắn (chỉnh sửa, xóa, phản ứng)
- ✅ Tự động lấy tiêu điểm đầu vào khi mở cuộc trò chuyện
- ✅ Tải ban đầu 20 tin nhắn mới nhất
- ✅ Tải tin nhắn cũ theo yêu cầu bằng nút "Xem thêm tin nhắn cũ"
- ✅ Tự động cuộn đến tin nhắn mới nhất khi mở trò chuyện
- ✅ Chỉnh sửa tin nhắn trực tiếp từ thanh nhập liệu (không có hộp thoại xác nhận trình duyệt)
- ✅ Thành phần ErrorBoundary để xử lý lỗi một cách nhạy cảm
- ✅ Thiết kế đáp ứng cho di động/máy tính để bàn

**Dịch vụ Email**
- ✅ Xác minh email OTP (6 chữ số) qua AWS SES
- ✅ Email đặt lại mật khẩu với liên kết xác minh
- ✅ Email chào mừng đăng ký
- ✅ Chức năng gửi lại OTP

**Cơ sở dữ liệu & Cơ sở hạ tầng**
- ✅ Migration DynamoDB (từ MongoDB)
- ✅ Lược đồ bảng DynamoDB (Người dùng, Cuộc trò chuyện, Tin nhắn, Những người tham gia)
- ✅ Global Secondary Indexes cho các truy vấn
- ✅ Các tập lệnh tạo bảng tự động
- ✅ Các tập lệnh thiết lập chỉ mục

**Hệ thống Sự kiện**
- ✅ Kiến trúc hướng sự kiện với EventBus
- ✅ Các sự kiện tin nhắn (GỬI, CHỈNH SỬA, XÓA, REACTION_ADDED)
- ✅ Các sự kiện người dùng (REGISTERED, LOGGED_IN, PASSWORD_RESET)
- ✅ Các sự kiện cuộc trò chuyện

**Các bản sửa chữa được áp dụng**
- ✅ Đã sửa các truy vấn ParticipantRepository GSI (conversationId-userId-index)
- ✅ Đã sửa vấn đề Cuộc trò chuyện không tìm thấy (loại bỏ creatorId-index)
- ✅ Đã sửa sự không khớp _id vs conversationId trong frontend
- ✅ Đã sửa lỗi hiển thị thành phần Message (an toàn null)
- ✅ Đã sửa cảnh báo prop key trong danh sách cuộc trò chuyện/tin nhắn
- ✅ Thêm ErrorBoundary để xử lý lỗi React

---

### Danh sách Tính năng Lõi Gốc
- ✅ Nhắn tin thời gian thực với Socket.IO
- ✅ Xác thực người dùng (Đăng ký, Đăng nhập, JWT)
- ✅ Hồ sơ người dùng với tải lên avatar lên S3
- ✅ Quản lý cuộc trò chuyện (1-trên-1, nhóm)
- ✅ Các tính năng tin nhắn (chỉnh sửa, xóa, trả lời, phản ứng emoji)
- ✅ Theo dõi trạng thái trực tuyến
- ✅ Xác minh email với OTP
- ✅ Đặt lại và thay đổi mật khẩu
- ✅ Trạng thái gửi tin nhắn (đã gửi, đã gửi, đã xem)
- ✅ Modal tìm kiếm/cuộc trò chuyện mới (🔍) trong thanh bên
- ✅ Tìm kiếm người dùng theo tên/tên đăng nhập và bắt đầu cuộc trò chuyện từ kết quả tìm kiếm
- ✅ Mở trò chuyện 1-1 hiện có nếu đã tồn tại, nếu không hãy tự động tạo trò chuyện mới
- ✅ Luồng yêu cầu kết bạn trong UI trò chuyện (gửi yêu cầu, chấp nhận, từ chối, trạng thái chờ)
- ✅ Cải thiện UX trò chuyện:
    - Tự động lấy tiêu điểm đầu vào khi mở cuộc trò chuyện
    - Tải ban đầu chỉ 20 tin nhắn mới nhất
    - Tải tin nhắn cũ theo yêu cầu qua "Xem thêm tin nhắn cũ"
    - Tự động cuộn đến tin nhắn mới nhất khi mở trò chuyện
    - Chỉnh sửa tin nhắn trực tiếp từ thanh nhập tin nhắn (không có lời nhắc trình duyệt)

---

## 📚 Ngăn xếp công nghệ

### Frontend
- **Framework:** React 18 + Vite (công cụ xây dựng)
- **Quản lý trạng thái:** Zustand
- **Định tuyến:** React Router v6
- **Máy khách HTTP:** Axios
- **Giao tiếp thời gian thực:** Socket.IO Client
- **Tạo kiểu:** CSS

### Backend
- **Runtime:** Node.js với mô-đun ES6
- **Framework:** Express.js
- **Cơ sở dữ liệu:** DynamoDB (AWS) - thay thế MongoDB
- **Thời gian thực:** Socket.IO
- **Xác thực:** JWT (jsonwebtoken)
- **Băm mật khẩu:** bcryptjs
- **Tải tệp lên:** Multer + AWS S3
- **Dịch vụ Email:** AWS SES
- **Bộ nhớ đệm/Phiên:** Redis (tùy chọn)
- **Xác thực:** Joi
- **Tạo ID:** UUID v4

### Cơ sở hạ tầng & Công cụ
- **Công cụ xây dựng:** Vite (frontend)
- **Máy chủ phát triển:** Nodemon
- **Linting:** ESLint
- **Thử nghiệm:** Jest (được cấu hình nhưng chưa triển khai đầy đủ)
- **Dịch vụ đám mây:** AWS (DynamoDB, S3, SES)

---

## 🏗️ Kiến trúc hệ thống

### Kiến trúc cao cấp
```
┌─────────────────────────────────────────────┐
│      Frontend (React + Vite)                 │
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
│      Lớp dữ liệu (DynamoDB + S3)             │
│  ├─ DynamoDB (cơ sở dữ liệu chính)           │
│  ├─ S3 (lưu trữ tệp/avatar)                  │
│  ├─ SES (dịch vụ email)                      │
│  └─ Redis (bộ nhớ đệm tùy chọn)              │
└─────────────────────────────────────────────┘
```

### Mô hình thiết kế

#### 1. **Kiến trúc hướng sự kiện**
- Sử dụng EventBus cho các dịch vụ không liên kết
- Các sự kiện: `USER_REGISTERED`, `MESSAGE_SENT`, `PASSWORD_RESET`, v.v.
- Ưu điểm: Có thể mở rộng, dễ thêm tính năng, hỗ trợ hàng đợi tin nhắn

#### 2. **Mô hình lớp dịch vụ**
- **Controller** → Trình xử lý yêu cầu HTTP → Phản hồi
- **Service** → Logic kinh doanh, xác thực, sự kiện
- **Model** → Các hoạt động cơ sở dữ liệu
- Ưu điểm: Có thể kiểm tra, có thể tái sử dụng, tách biệt rõ ràng

#### 3. **Mô hình kho lưu trữ** (Được lên kế hoạch/Một phần)
- Trừu tượng hóa các hoạt động cơ sở dữ liệu
- Cho phép dễ dàng chuyển đổi giữa các cơ sở dữ liệu
- Hiện tại: Sử dụng DynamoDB trực tiếp trong dịch vụ/mô hình

---

## 📁 Cấu Trúc Dự Án

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

## 🗄️ Lược Đồ Cơ Sở Dữ Liệu (DynamoDB)

### Các Bảng Chính

#### 1. Bảng **Người dùng** (Users)
- **Khóa phân vùng:** `userId` (UUID)
- **Sắp xếp khóa:** Không có
- **Global Secondary Indexes (GSI):**
  - `email-index` (truy vấn theo email)
  - `username-index` (truy vấn theo tên đăng nhập)

**Các trường chính:**
```javascript
{
  userId: "uuid",              // Khóa chính
  email: "string",             // Duy nhất
  username: "string",          // Duy nhất
  password: "string",          // Được hash (bcrypt)
  fullName: "string",
  avatar: "string",            // URL S3
  bio: "string",               // Tối đa 500 ký tự
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

#### 2. Bảng **Cuộc trò chuyện** (Conversations)
- **Khóa phân vùng:** `conversationId` (UUID)
- **Sắp xếp khóa:** Không có

**Các trường chính:**
```javascript
{
  conversationId: "uuid",      // Khóa chính
  type: "private|group",
  name: "string",              // Cho nhóm
  avatar: "string",            // URL S3
  description: "string",       // Cho nhóm
  creatorId: "userId",         // Người tạo
  participants: ["userId"],    // ID những người tham gia
  lastMessage: "string",       // Xem trước
  lastMessageAt: "ISO string",
  isArchived: boolean,
  createdAt: "ISO string",
  updatedAt: "ISO string"
}
```

#### 3. Bảng **Tin nhắn** (Messages)
- **Khóa phân vùng:** `conversationId` (UUID)
- **Sắp xếp khóa:** `messageId` (UUID) - cho phép nhiều tin nhắn trên mỗi cuộc trò chuyện
- **Global Secondary Index:** `senderId-index` (truy vấn tin nhắn theo người gửi)

**Các trường chính:**
```javascript
{
  conversationId: "uuid",      // Khóa phân vùng
  messageId: "uuid",           // Sắp xếp khóa
  senderId: "userId",
  content: "string",
  status: "sent|delivered|seen",
  seenBy: ["userId"],          // Mảng những người đã xem
  replyTo: "messageId",        // Trả lời tin nhắn tùy chọn
  attachments: ["url"],        // URL S3
  emoji: ["emoji"],            // Phản ứng emoji
  isEdited: boolean,
  editedAt: "ISO string",
  isDeleted: boolean,
  deletedAt: "ISO string",
  createdAt: "ISO string",
  updatedAt: "ISO string"
}
```

#### 4. Bảng **Những người tham gia** (Participants)
- **Khóa phân vùng:** `conversationId` (UUID)
- **Sắp xếp khóa:** `userId` (UUID)

**Các trường chính:**
```javascript
{
  conversationId: "uuid",      // Khóa phân vùng
  userId: "uuid",              // Sắp xếp khóa
  role: "member|admin|owner",
  isMuted: boolean,
  lastReadAt: "ISO string",    // Lần cuối họ đọc tin nhắn
  joinedAt: "ISO string",
  leftAt: "ISO string",        // Nếu họ rời đi
  createdAt: "ISO string",
  updatedAt: "ISO string"
}
```

---

## 🔐 Xác thực & Bảo mật

### Luồng xác thực
1. **Đăng ký:** Người dùng tạo tài khoản → Gửi OTP xác minh email
2. **Xác minh email:** Người dùng nhập OTP
3. **Đăng nhập:** Email + Mật khẩu → JWT tokens (access + refresh)
4. **Yêu cầu được bảo vệ:** Bao gồm `Authorization: Bearer <token>` header
5. **Làm mới Token:** Sử dụng token làm mới để lấy token truy cập mới

### Mã thông báo (Tokens)
- **Token truy cập:** Sống ngắn (15-30 phút), bao gồm trong Authorization header
- **Token làm mới:** Sống lâu (7 ngày), được lưu trữ trong cookie an toàn
- **Payload JWT:** `{ userId, email, username, iat, exp }`

### Bảo mật mật khẩu
- **Băm:** bcryptjs với salt rounds = 10
- **Lưu trữ:** Không bao giờ lưu trữ văn bản thuần túy, chỉ mật khẩu được hash
- **Thay đổi mật khẩu:** Yêu cầu xác minh mật khẩu hiện tại
- **Đặt lại mật khẩu:** Quy trình 3 bước với xác minh email

### Xác minh email
- **Phương pháp OTP:** OTP 6 chữ số được gửi qua AWS SES
- **Hết hạn:** OTP hợp lệ trong 15 phút
- **Bắt buộc:** Người dùng mới phải xác minh email trước khi truy cập đầy đủ

---

## 🔌 Các sự kiện Socket.IO

### Giao tiếp Thời gian Thực
Socket.IO xử lý các cập nhật thời gian thực mà không cần bỏ phiếu. Các sự kiện phổ biến:

#### Sự kiện Kết nối
- `connect` - Máy khách kết nối với máy chủ
- `disconnect` - Máy khách ngắt kết nối
- `connect_error` - Lỗi kết nối

#### Sự kiện Cuộc trò chuyện
- `conversation:join` - Tham gia phòng cuộc trò chuyện
- `conversation:leave` - Rời phòng cuộc trò chuyện
- `typing` - Chỉ báo người dùng đang gõ
- `stop_typing` - Dừng chỉ báo gõ

#### Sự kiện Tin nhắn
- `send_message` - Gửi tin nhắn mới
- `message:delivered` - Tin nhắn được gửi tới người nhận
- `message:seen` - Tin nhắn được xem bởi người nhận
- `message:edit` - Chỉnh sửa tin nhắn hiện có
- `message:delete` - Xóa tin nhắn
- `message:reaction` - Thêm phản ứng emoji

#### Sự kiện Người dùng
- `user:online` - Người dùng đã trực tuyến
- `user:offline` - Người dùng đã ngoại tuyến
- `user:typing` - Người dùng gõ trong cuộc trò chuyện
- `presence:update` - Cập nhật thông tin hiện diện

---

## 📡 Các điểm cuối API

### Các Tuyến Xác thực (`/api/auth`)
- `POST /register` - Đăng ký người dùng mới
- `POST /login` - Đăng nhập người dùng
- `POST /logout` - Đăng xuất người dùng
- `POST /refresh-token` - Làm mới token truy cập
- `POST /verify-email` - Xác minh email với OTP
- `POST /send-otp` - Gửi lại OTP sang email
- `POST /forgot-password` - Bắt đầu đặt lại mật khẩu
- `POST /reset-password` - Hoàn thành đặt lại mật khẩu
- `GET /me` - Lấy thông tin người dùng hiện tại

### Các Tuyến Người dùng (`/api/users`)
- `GET /profile/current` - Lấy hồ sơ người dùng hiện tại
- `GET /profile/:userId` - Lấy hồ sơ người dùng theo ID
- `PUT /profile` - Cập nhật hồ sơ người dùng
- `POST /password/change` - Thay đổi mật khẩu
- `POST /avatar` - Tải lên/cập nhật avatar
- `GET /search` - Tìm kiếm người dùng theo tên đăng nhập/email
- `POST /friend-request` - Gửi yêu cầu kết bạn
- `GET /friends` - Lấy danh sách bạn của người dùng
- `POST /block` - Chặn người dùng

### Các Tuyến Cuộc trò chuyện (`/api/conversations`)
- `GET /` - Lấy tất cả cuộc trò chuyện
- `POST /` - Tạo cuộc trò chuyện mới
- `GET /:conversationId` - Lấy chi tiết cuộc trò chuyện
- `PUT /:conversationId` - Cập nhật cuộc trò chuyện
- `DELETE /:conversationId` - Lưu trữ/xóa cuộc trò chuyện
- `POST /:conversationId/participants` - Thêm người tham gia vào nhóm
- `DELETE /:conversationId/participants/:userId` - Xóa người tham gia

### Các Tuyến Tin nhắn (`/api/messages`)
- `GET /conversation/:conversationId` - Lấy tin nhắn trong cuộc trò chuyện
- `POST /` - Gửi tin nhắn
- `PUT /:messageId` - Chỉnh sửa tin nhắn
- `DELETE /:messageId` - Xóa tin nhắn
- `POST /:messageId/reaction` - Thêm phản ứng emoji
- `DELETE /:messageId/reaction` - Xóa phản ứng emoji

### Các Tuyến Email (`/api/email`)
- `POST /send-otp` - Gửi OTP sang email

---

## 🎨 Các Thành phần & Trang Frontend

### Các Trang Chính
1. **AuthContainer** - Bộ định tuyến cho các trang xác thực (Đăng nhập/Đăng ký/Đặt lại)
2. **LoginPage** - Đăng nhập người dùng bằng email/mật khẩu
3. **RegisterPage** - Đăng ký người dùng mới
4. **ForgotPasswordPage** - Luồng phục hồi mật khẩu
5. **VerifyEmailPage** - Xác minh email sau khi đăng ký
6. **VerifyOTPPage** - Nhập OTP cho các luồng khác nhau
7. **ChatPage** - Giao diện nhắn tin chính
8. **ProfilePage** - Quản lý hồ sơ người dùng

### Các Thành phần Chính
1. **ChatWindow** - Giao diện nhắn tin chính
2. **ConversationList** - Danh sách các cuộc trò chuyện hoạt động
3. **Message** - Hiển thị tin nhắn riêng lẻ với phản ứng

### Quản lý Trạng thái (Zustand)
- **authStore** - Trạng thái xác thực người dùng, tokens, đăng nhập/đăng xuất
- **chatStore** - Cuộc trò chuyện, tin nhắn, cập nhật thời gian thực

### Custom Hooks
- **useAuth** - Các hoạt động xác thực (đăng nhập, đăng ký, đăng xuất)
- **useChat** - Các hoạt động trò chuyện (lấy cuộc trò chuyện, gửi tin nhắn)
- **useSocket** - Kết nối Socket.IO và xử lý sự kiện

---

## ⚡ Các Tính năng Chính được Giải thích

### 1. Nhắn tin Thời gian Thực
- Sử dụng Socket.IO để gửi tin nhắn tức thì
- Không cần bỏ phiếu
- Trạng thái tin nhắn: đã gửi → đã gửi → đã xem
- Chỉ báo gõ

### 2. Hồ sơ Người dùng
- Tải lên avatar lên AWS S3
- Bio/trạng thái
- Trạng thái trực tuyến với dấu thời gian lần cuối xem
- Khả năng hiển thị hồ sơ (công khai/riêng tư)

### 3. Các loại Cuộc trò chuyện
- **Riêng tư (1-trên-1):** Trò chuyện trực tiếp giữa hai người dùng
- **Nhóm:** Nhiều người dùng với vai trò quản trị viên/thành viên

### 4. Các Tính năng Tin nhắn
- **Chỉnh sửa:** Sửa nội dung tin nhắn (hiển thị dấu "đã chỉnh sửa")
- **Xóa:** Loại bỏ tin nhắn khỏi cuộc trò chuyện
- **Trả lời:** Trích dẫn tin nhắn trước đó
- **Phản ứng Emoji:** Phản ứng tin nhắn bằng emoji
- **Tệp đính kèm:** Chia sẻ tệp/hình ảnh (qua S3)
- **Trạng thái gửi:** Theo dõi luồng tin nhắn

### 5. Các Tính năng Bảo mật
- Xác thực dựa trên JWT
- Băm mật khẩu với bcryptjs
- Xác minh email với OTP
- Bảo vệ CORS
- Giới hạn tốc độ (có thể được thêm)
- Xác thực đầu vào với Joi

---

## 🚀 Tổng quan về Các Dịch vụ Backend

### AuthService
- Đăng ký người dùng → Xác thực → Băm mật khẩu → Tạo người dùng
- Đăng nhập → Xác minh mật khẩu → Tạo tokens
- Làm mới token → Xác thực token làm mới → Token truy cập mới
- Đặt lại mật khẩu → Xác minh email → Băm mật khẩu mới
- Phát sự kiện: `USER_REGISTERED`, `PASSWORD_RESET`

### UserService
- Lấy hồ sơ người dùng
- Cập nhật hồ sơ (tên, bio, v.v.)
- Thay đổi mật khẩu → Xác minh mật khẩu cũ → Băm mật khẩu mới
- Cập nhật avatar → Tải lên S3 → Xóa cũ → Lưu URL
- Lấy người dùng theo ID/tên đăng nhập/email

### ConversationService
- Tạo cuộc trò chuyện (1-trên-1 hoặc nhóm)
- Lấy cuộc trò chuyện của người dùng (phân trang)
- Thêm/xóa những người tham gia
- Cập nhật chi tiết cuộc trò chuyện
- Lưu trữ/xóa cuộc trò chuyện
- Lấy tin nhắn cuối cùng cho xem trước

### MessageService
- Gửi tin nhắn → Xác thực → Tạo → Phát sự kiện
- Lấy tin nhắn cho cuộc trò chuyện (phân trang)
- Chỉnh sửa tin nhắn → Cập nhật → Phát sự kiện
- Xóa tin nhắn → Đánh dấu là đã xóa
- Thêm phản ứng emoji → Cập nhật mảng
- Đánh dấu là đã xem/gửi

### EmailService
- Gửi email qua AWS SES
- Tạo OTP (6 chữ số ngẫu nhiên)
- Luồng xác minh email
- Email đặt lại mật khẩu với liên kết
- Email chào mừng khi đăng ký

### S3Service
- Tải lên avatar → Xác thực tệp → Tải lên → Trả lại URL
- Xóa avatar → Loại bỏ khỏi S3
- Thay thế avatar → Xóa cũ → Tải lên mới
- Xử lý MIME types cho hình ảnh

---

## 🔄 Ví dụ Luồng Dữ liệu

### Luồng Gửi Tin nhắn
```
Frontend (ChatPage)
    ↓
socket.emit('send_message', { conversationId, content })
    ↓
Backend (socket handler)
    ↓
MessageService.sendMessage(conversationId, senderId, content)
    ↓
Tạo Tin nhắn trong DynamoDB
    ↓
Phát sự kiện MESSAGE_EVENTS.SENT
    ↓
Trình nghe EventBus phát sóng tới phòng Socket.IO
    ↓
io.to(`conversation:${conversationId}`).emit('message:new', messageData)
    ↓
Tất cả máy khách được kết nối nhận tin nhắn thời gian thực
```

### Luồng Đăng nhập
```
Frontend (LoginPage)
    ↓
api.post('/auth/login', { email, password })
    ↓
AuthController.login()
    ↓
AuthService.login()
    ├─ Tìm người dùng theo email
    ├─ So sánh mật khẩu với bcrypt
    ├─ Tạo access & refresh tokens
    └─ Phát sự kiện USER_LOGGED_IN
    ↓
Trả về { user, accessToken, refreshToken }
    ↓
Frontend lưu trữ tokens trong localStorage/Zustand
    ↓
Bao gồm accessToken trong các yêu cầu trong tương lai
```

### Luồng Tải lên Tệp
```
Frontend (ProfilePage)
    ↓
Dữ liệu biểu mẫu với tệp + axios POST tới /api/users/avatar
    ↓
Middleware Multer xử lý tệp (trong bộ nhớ)
    ↓
UserController.updateAvatar()
    ↓
S3Service.replaceAvatar()
    ├─ Tải lên tệp lên S3 → Nhận URL
    ├─ Xóa avatar cũ khỏi S3 (nếu tồn tại)
    └─ Lưu trữ URL S3 mới trong mô hình User
    ↓
Cập nhật người dùng trong DynamoDB
    ↓
Trả về { user, avatarUrl }
    ↓
Frontend cập nhật trạng thái người dùng
```

---

## 🔧 Phát triển & Cấu hình

### Các biến môi trường (Backend .env)
```
# Máy chủ
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

# Redis (Tùy chọn)
REDIS_URL=redis://localhost:6379

# CORS
FRONTEND_URL=http://localhost:5173

# OTP
OTP_EXPIRY=15m
OTP_LENGTH=6
```

### Các biến môi trường (Frontend .env)
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🚀 Thiết lập & Chạy

### Thiết lập Backend
```bash
cd backend
npm install
# Tạo tệp .env với các biến ở trên
npm run dev  # Phát triển với Nodemon
# hoặc
npm start    # Sản xuất
```

### Thiết lập Frontend
```bash
cd frontend
npm install
npm run dev  # Phát triển với Vite hot reload
# hoặc
npm run build  # Xây dựng sản xuất
npm run preview
```

### Thiết lập Cơ sở dữ liệu (Lần đầu)
```bash
cd backend
npm run setup:dynamodb   # Tạo bảng
npm run setup:indexes    # Tạo chỉ mục
```

---

## 📊 Các cập nhật gần đây & Trạng thái

### Các tính năng phiên bản 1.0.0
- ✅ Xác thực (Đăng ký, Đăng nhập, JWT)
- ✅ Hồ sơ người dùng với tải lên avatar S3
- ✅ Cuộc trò chuyện (1-trên-1 & Nhóm)
- ✅ Nhắn tin thời gian thực với Socket.IO
- ✅ Các tính năng tin nhắn (Chỉnh sửa, Xóa, Trả lời, Phản ứng)
- ✅ Xác minh email với OTP
- ✅ Đặt lại mật khẩu & Thay đổi
- ✅ Theo dõi trạng thái trực tuyến
- ✅ Migration DynamoDB (từ MongoDB)

### Cải tiến phiên bản 1.1.0 (Hiện tại)
- ✅ Đã sửa các truy vấn bảng DynamoDB Participant GSI
- ✅ Đã sửa lấy cuộc trò chuyện và phát hiện trùng lặp
- ✅ Xử lý lỗi frontend với ErrorBoundary
- ✅ Chuẩn hóa tên trường cuộc trò chuyện/tin nhắn (_id/conversationId, userId/senderId)
- ✅ Cải thiện phân trang tin nhắn và tải
- ✅ Các thông báo lỗi và ghi nhật ký tốt hơn
- ✅ Các bản sửa chữa prop key tin nhắn và kết xuất

### Các tính năng được lên kế hoạch (Phiên bản 2.0+)
- 🔄 Cuộc gọi thoại/video (tích hợp Jitsi hoặc tương tự)
- 🔄 Chỉ báo nhập liệu nâng cao và sự hiện diện
- 🔄 Tìm kiếm toàn văn bản tin nhắn với bộ lọc
- 🔄 Chia sẻ tệp (tài liệu, hình ảnh trong thư mục)
- 🔄 Quản lý danh sách chặn người dùng
- 🔄 Cài đặt âm thanh/thông báo trò chuyện nhóm
- 🔄 Bảng điều khiển quản trị viên để quản lý người dùng
- 🔄 Phân tích người dùng và nhật ký hoạt động
- 🔄 Mã hóa tin nhắn khi lưu (AES-256)
- 🔄 Mã hóa đầu cuối (Signal Protocol)
- 🔄 Hàng đợi tin nhắn ngoại tuyến và đồng bộ
- 🔄 Thông báo đẩy (di động & web)
- 🔄 Biên lai đọc tin nhắn với dấu thời gian
- 🔄 Trạng thái sẵn có/bận của người dùng
- 🔄 Lịch sử và nhật ký cuộc gọi

### Các vấn đề đã biết & Danh sách TODO
- [ ] Triển khai phân trang cho tin nhắn/cuộc trò chuyện
- [ ] Thêm giới hạn tốc độ cho các điểm cuối API
- [ ] Thêm mã hóa tin nhắn khi lưu
- [ ] Triển khai mã hóa đầu cuối
- [ ] Thêm xử lý lỗi toàn diện cho các lỗi mạng
- [ ] Triển khai chế độ ngoại tuyến với bộ nhớ đệm cục bộ
- [ ] Thêm thông báo đẩy

---

## 🧪 Thử nghiệm

### Hiện được cấu hình nhưng chưa triển khai
- Khung thử nghiệm Jest được cài đặt
- Các bài kiểm tra đơn vị cho các dịch vụ được khuyến khích
- Các bài kiểm tra tích hợp cho các điểm cuối API được khuyến khích
- Các bài kiểm tra E2E cho các luồng quan trọng được khuyến khích

### Chạy các bài kiểm tra
```bash
npm test                    # Chạy tất cả các bài kiểm tra
npm test -- --coverage     # Với báo cáo bao phủ
npm test -- --watch        # Chế độ xem
```

---

## 📝 Tham chiếu các tệp tài liệu

| Tài liệu | Mục đích |
|----------|---------|
| `SETUP.md` | Cài đặt và thiết lập lần đầu |
| `ARCHITECTURE.md` | Kiến trúc chi tiết và mô hình thiết kế |
| `DATABASE_MODEL.md` | Lược đồ DynamoDB và mối quan hệ |
| `API.md` | Tài liệu điểm cuối API hoàn chỉnh |
| `SOCKET_EVENTS.md` | Tham chiếu sự kiện Socket.IO |
| `AUTH_SUMMARY.md` | Chi tiết hệ thống xác thực |
| `PROFILE_FEATURES_SUMMARY.md` | Các tính năng hồ sơ người dùng |
| `DATABASE_UPGRADE_ANALYSIS.md` | Migration MongoDB → DynamoDB |
| `TESTING_GUIDE.md` | Các thủ tục thử nghiệm và ví dụ |
| `EMAIL_OTP_API.md` | Tài liệu luồng email và OTP |

---

## 💡 Các tác vụ phát triển phổ biến

### Thêm một điểm cuối API mới
1. Tạo tuyến trong `routes/example.js`
2. Tạo phương thức bộ điều khiển trong `controllers/ExampleController.js`
3. Tạo phương thức dịch vụ trong `services/ExampleService.js`
4. Thêm lược đồ xác thực trong `utils/validation.js`
5. Gắn kèn tuyến trong `server.js`
6. Tài liệu trong `docs/API.md`

### Thêm sự kiện thời gian thực
1. Xác định loại sự kiện trong `events/EventTypes.js`
2. Phát sự kiện trong dịch vụ: `exampleEvents.emit(EVENT_TYPE, data)`
3. Lắng nghe trong `socket/handlers.js`
4. Phát sóng đến máy khách với `socket.emit()` hoặc `io.to(room).emit()`

### Thêm truy vấn cơ sở dữ liệu
1. Tạo phương thức mô hình trong `models/Example.js`
2. Sử dụng mô hình kho lưu trữ: `ExampleRepository.findById()`
3. Gọi từ dịch vụ, xử lý lỗi
4. Bộ nhớ đệm nếu có thể sử dụng Redis

### Luồng thành phần Frontend
1. Tạo tệp thành phần trong `components/` hoặc `pages/`
2. Tạo hook tùy chỉnh trong `hooks/` nếu cần
3. Kết nối với cửa hàng Zustand hoặc sử dụng dịch vụ API
4. Thêm kiểu dáng vào `styles/`
5. Nhập và sử dụng trong thành phần cha

---

## 🎓 Các điểm học tập chính cho nhà phát triển

### Các khái niệm Backend được sử dụng
1. **Kiến trúc hướng sự kiện** - Các dịch vụ không liên kết qua các sự kiện
2. **Lớp dịch vụ** - Tách biệt logic kinh doanh
3. **Mô hình kho lưu trữ** - Các hoạt động cơ sở dữ liệu trừu tượng
4. **Xác thực JWT** - Bảo mật dựa trên mã thông báo
5. **Socket.IO** - Giao tiếp hai chiều thời gian thực
6. **DynamoDB** - Cơ sở dữ liệu NoSQL với GSI cho các truy vấn
7. **AWS S3** - Lưu trữ và truy xuất tệp
8. **Xử lý lỗi** - Middleware cho các phản hồi lỗi nhất quán

### Các khái niệm Frontend được sử dụng
1. **React Hooks** - Trạng thái và tác dụng phụ
2. **Zustand** - Thay thế quản lý trạng thái đơn giản cho Redux
3. **Socket.IO Client** - Xử lý sự kiện thời gian thực
4. **Axios** - Máy khách HTTP có bộ đánh chặn
5. **Vite** - Công cụ xây dựng nhanh và máy chủ phát triển
6. **Thành phần Composition** - Các thành phần có thể tái sử dụng, mô-đun

---

## 🤝 Đóng góp

### Phong cách mã
- Sử dụng các tính năng ES6+
- Tuân thủ các quy tắc ESLint
- Sử dụng các tên biến/hàm có ý nghĩa
- Thêm nhận xét cho logic phức tạp
- Giữ các hàm nhỏ và tập trung

### Quy trình Git
1. Tạo nhánh tính năng: `git checkout -b feature/feature-name`
2. Thực hiện các thay đổi và kiểm tra
3. Cam kết với các thông báo rõ ràng: `git commit -m "feat: add feature description"`
4. Đẩy vào nhánh: `git push origin feature/feature-name`
5. Tạo Yêu cầu kéo

---

## 📞 Hỗ trợ & Tài nguyên

### Tài liệu
- Tất cả tài liệu trong thư mục `docs/`
- Các quyết định kiến trúc được tài liệu hóa
- Các ví dụ API được cung cấp

### Vấn đề phổ biến
- Kiểm tra tệp `.env` được cấu hình đúng
- Đảm bảo DynamoDB đang chạy/có thể truy cập
- Xác minh JWT secret được đặt
- Kiểm tra thông tin xác thực AWS cho S3/SES/DynamoDB

### Vấn đề đã biết & Bản sửa chữa

#### Vấn đề: "Lỗi không thể lấy người tham gia cuộc trò chuyện: Query condition missed key schema element: participantId"
**Nguyên nhân gốc:** Bảng Participants DynamoDB có `participantId` làm khóa chính (HASH), nhưng kho lưu trữ đã cố gắng truy vấn với `conversationId + userId` làm khóa tổng hợp mà không sử dụng GSI.

**Giải pháp được áp dụng (ParticipantRepository.js):**
1. Thêm tạo `participantId` trong phương thức `create()` bằng UUID
2. Cập nhật `findById()` để sử dụng GSI `conversationId-userId-index`
3. Cập nhật `findByConversationId()` để sử dụng GSI thay vì truy vấn khóa chính
4. Sửa tất cả các lệnh UpdateCommand và DeleteCommand để sử dụng `participantId` được tìm nạp trước tiên
5. Cập nhật `getParticipantCount()` và `getAdmins()` để sử dụng GSI

**Các thay đổi chính:**
- `findById(conversationId, userId)` → Sử dụng GSI `conversationId-userId-index`
- `create()` → Bây giờ tạo `participantId` làm khóa chính
- `updateRole()`, `markAsLeft()`, `delete()` → Tìm nạp người tham gia trước tiên để lấy `participantId`

**Tham chiếu lược đồ cơ sở dữ liệu:**
- Khóa chính: `participantId` (HASH)
- GSI: `conversationId-userId-index` (HASH: conversationId, RANGE: userId)
- GSI: `userId-index` (HASH: userId)

---

#### Vấn đề: "Không tìm thấy cuộc trò chuyện"
**Nguyên nhân gốc:** `ConversationRepository.getByCreator()` đã cố gắng sử dụng chỉ mục không tồn tại `creatorId-index`, gây ra các truy vấn không thành công và thiếu cuộc trò chuyện.

**Giải pháp được áp dụng:**

1. **ConversationRepository.js:**
   - Loại bỏ sự phụ thuộc vào `creatorId-index` không tồn tại
   - `getByCreator()` bây giờ sử dụng SCAN với FilterExpression thay vì truy vấn
   - Thêm phương thức mới `getByParticipant()` để truy vấn các cuộc trò chuyện bằng cách sử dụng `participants-index` GSI

2. **ConversationService.js:**
   - Nâng cao `getUserConversations()` với xử lý lỗi và logic dự phòng
   - Thêm try-catch để xử lý các cuộc trò chuyện bị thiếu một cách nhạy cảm
   - Nếu truy vấn chính không thành công, sẽ cố gắng tìm nạp cuộc trò chuyện trực tiếp
   - Cải thiện `getConversationById()` với các thông báo lỗi tốt hơn
   - Thêm ghi nhật ký chi tiết để gỡ lỗi

3. **Các chỉ mục được cập nhật (setupIndexes.js):**
   - `tixchat-conversations`: Chỉ `participants-index` (HASH: participants)
   - `tixchat-participants`: `conversationId-index`, `conversationId-userId-index`, `userId-index`
   - `tixchat-users`: `email-index`, `username-index`

**Các thay đổi chính:**
- `getByCreator()` → Sử dụng SCAN + FilterExpression (vì không có creatorId-index)
- `getUserConversations()` → Bây giờ xử lý các cuộc trò chuyện bị thiếu một cách nhạy cảm
- Các thông báo lỗi tốt hơn để gỡ lỗi
- Thêm ghi nhật ký cho các lần tìm nạp cuộc trò chuyện không thành công

---

#### Vấn đề: "Không tìm thấy cuộc trò chuyện với ID undefined" + "Mỗi thành phần con trong danh sách phải có prop 'key' duy nhất"
**Nguyên nhân gốc:**
1. Frontend sử dụng `_id` nhưng backend trả về `conversationId`
2. `key={conv._id}` undefined trong ConversationList → cảnh báo React
3. `openConversation(conversation._id)` nhận undefined → truy vấn API với undefined

**Giải pháp được áp dụng:**

1. **Backend (ConversationController.js):**
   - Thêm hàm trợ giúp `normalizeConversation()` để thêm bí danh `_id` cho frontend
   - Tất cả các phương thức phản hồi sử dụng `normalizeConversation()` hoặc `normalizeConversations()`
   - Giữ `conversationId` trong cơ sở dữ liệu nhưng phản hồi có cả `_id` để frontend sử dụng

2. **Frontend (ConversationList.jsx):**
   - Sửa `key={conv._id}` → `key={conv._id || conv.conversationId}`
   - Đảm bảo key luôn có giá trị hợp lệ

3. **Frontend (ChatPage.jsx):**
   - Sửa `handleSelectConversation()` → `conversation._id || conversation.conversationId`

4. **Frontend (useChat.js hook):**
   - `sendMessage()` → Sử dụng `const conversationId = currentConversation._id || currentConversation.conversationId`
   - `loadMoreMessages()` → Sử dụng conversationId dự phòng

**Các thay đổi chính:**
- Backend normalize: `conversation._id = conversation.conversationId`
- Frontend dự phòng: Luôn kiểm tra cả `_id` và `conversationId`
- Sửa prop key: Sử dụng `key={conv._id || conv.conversationId}`

---

#### Vấn đề: "MessageRepository.findByConversationId không phải là hàm"
**Nguyên nhân gốc:**
1. `MessageService` gọi `MessageRepository.findByConversationId()` nhưng phương thức không tồn tại
2. `MessageRepository` chỉ có phương thức `getByConversation()`
3. Các truy vấn tin nhắn cần cả `conversationId` + `messageId` nhưng các tuyến không chuyển `conversationId`

**Giải pháp được áp dụng:**

1. **Backend Routes (routes/message.js):**
   - Thêm `conversationId` vào các tham số tuyến cho tất cả các hoạt động tin nhắn:
   - `PUT /:conversationId/:messageId` (chỉnh sửa)
   - `DELETE /:conversationId/:messageId` (xóa)
   - `POST /:conversationId/:messageId/delivered`
   - `POST /:conversationId/:messageId/emoji`
   - `DELETE /:conversationId/:messageId/emoji`

2. **Backend Controller (MessageController.js):**
   - Cập nhật tất cả các phương thức để lấy `conversationId` từ các tham số
   - Chuyển `conversationId` + `messageId` tới dịch vụ

3. **Backend Service (MessageService.js):**
   - `getConversationMessages()` → Sử dụng `getByConversation()` thay vì `findByConversationId()`
   - `editMessage(conversationId, messageId, senderId, newContent)`
   - `deleteMessage(conversationId, messageId, senderId)`
   - `markAsDeliveredInConversation(conversationId, messageId, userId)`
   - `markAsSeen(conversationId, userId)` → Sử dụng `getByConversation()` + `update(conversationId, messageId, ...)`
   - `addEmoji(conversationId, messageId, userId, emoji)`
   - `removeEmoji(conversationId, messageId, userId, emoji)`
   - Tất cả các lệnh gọi `MessageRepository.update()` sửa từ `update(messageId, ...)` → `update(conversationId, messageId, ...)`

4. **Frontend API (api.js):**
   - `editMessage(conversationId, messageId, content)` → `PUT /messages/:conversationId/:messageId`
   - `deleteMessage(conversationId, messageId)` → `DELETE /messages/:conversationId/:messageId`
   - `markAsDelivered(conversationId, messageId)` → `POST /messages/:conversationId/:messageId/delivered`
   - `addEmoji(conversationId, messageId, emoji)` → `POST /messages/:conversationId/:messageId/emoji`
   - `removeEmoji(conversationId, messageId, emoji)` → `DELETE /messages/:conversationId/:messageId/emoji`

**Các thay đổi chính:**
- Các hoạt động tin nhắn bắt buộc cần cả conversationId + messageId
- Khóa tổng hợp DynamoDB: (conversationId, messageId)
- Tất cả các truy vấn tin nhắn phải thông qua GSI `getByConversation()`
- Các tuyến và dịch vụ đồng bộ về chữ ký tham số

---

#### Vấn đề: "Mỗi thành phần con trong danh sách phải có prop 'key' duy nhất" + "Không thể đọc các thuộc tính của undefined (đọc '_id')"
**Nguyên nhân gốc:**
1. ChatWindow map tin nhắn nhưng không chuyển prop `key` cho Message
2. Thành phần Message cố gắng truy cập `message.senderId._id` nhưng backend trả về `message.userId` (chuỗi)
3. Sự không khớp giữa các tên trường backend (`userId`) và kỳ vọng frontend (`senderId._id`)

**Giải pháp được áp dụng:**

1. **Frontend - Message.jsx:**
   - Thêm kiểm tra an toàn null: `if (!message) return null`
   - Chuẩn hóa tên trường:
     - `const senderId = message.senderId || message.userId`
     - `const messageId = message._id || message.messageId`
   - Sửa so sánh: `senderId === currentUserId` thay vì `message.senderId._id === currentUserId`

2. **Frontend - ChatWindow.jsx:**
   - Sửa prop key: `key={message._id || message.messageId}` (dự phòng cho cả hai)
   - Sửa tra cứu senderInfo: `p._id === (message.senderId || message.userId)`
   - Biểu thức bộ lọc khớp userId/senderId tin nhắn

3. **Frontend - ErrorBoundary.jsx (MỚI):**
   - Tạo thành phần ErrorBoundary để bắt lỗi React
   - Hiển thị các thông báo lỗi thân thiện với người dùng
   - Cho phép hành động thử lại

4. **Frontend - ChatPage.jsx:**
   - Nhập và bao bọc ChatWindow với `<ErrorBoundary>`
   - Ngăn chặn sự cố ứng dụng đầy đủ khi thành phần Message có lỗi

**Các thay đổi chính:**
- Thành phần Message: Chuẩn hóa senderId & messageId với dự phòng
- ChatWindow: Thêm prop key thích hợp + trường dự phòng
- Xử lý lỗi: Thêm ErrorBoundary cho màn hình lỗi một cách nhạy cảm
- An toàn null: Kiểm tra tin nhắn tồn tại trước khi kết xuất

### Mẹo hiệu suất
- Sử dụng phân trang cho các danh sách
- Bộ nhớ đệm dữ liệu được truy cập thường xuyên trong Redis
- Tối ưu hóa các sự kiện Socket.IO (chỉ gửi dữ liệu cần thiết)
- Sử dụng các chỉ mục trong DynamoDB cho các truy vấn
- Tải một cách lười biếng các thành phần trong React

---

## 📋 NHẬT KÝ THAY ĐỔI

### Phiên bản 1.1.0 (13 tháng 4, 2026)
**Các bản sửa chữa & Cải tiến lớn:**
- ✅ Đã sửa các truy vấn DynamoDB ParticipantRepository - sử dụng GSI thích hợp
- ✅ Đã sửa lấy cuộc trò chuyện - loại bỏ phụ thuộc creatorId-index bị hỏng
- ✅ Đã sửa sự không khớp _id/conversationId frontend - chuẩn hóa trường thích hợp
- ✅ Đã sửa kết xuất thành phần Message - kiểm tra an toàn null
- ✅ Thêm thành phần ErrorBoundary - xử lý lỗi React một cách nhạy cảm
- ✅ Đã sửa cảnh báo prop key trong danh sách cuộc trò chuyện và tin nhắn
- ✅ Cải thiện các thông báo lỗi và ghi nhật ký trên toàn bộ backend
- ✅ Xử lý lỗi tốt hơn trong dịch vụ cuộc trò chuyện và tin nhắn
- ✅ Cơ chế dự phòng cho các cuộc trò chuyện bị thiếu
- ✅ Tài liệu toàn diện về tất cả các bản sửa chữa trong phần Vấn đề đã biết

**Tối ưu hóa cơ sở dữ liệu:**
- Sử dụng GSI DynamoDB thích hợp cho các truy vấn phức tạp
- Giảm quét không cần thiết
- Thiết kế chỉ mục tốt hơn cho các truy vấn phổ biến

**Cải tiến Frontend:**
- Chuẩn hóa tên trường thích hợp (userId/senderId, _id/conversationId)
- Xử lý lỗi nhạy cảm với ErrorBoundary
- Kiểm tra an toàn null tốt hơn trong thành phần Message
- Các prop key React thích hợp cho kết xuất danh sách

---

### Phiên bản 1.0.0 (Phát hành trước đó)
**Các tính năng ban đầu:**
- Hệ thống xác thực người dùng với JWT
- Tích hợp cơ sở dữ liệu DynamoDB
- Nhắn tin thời gian thực với Socket.IO
- Hồ sơ người dùng với tải lên avatar S3
- Quản lý cuộc trò chuyện
- Xác minh email với OTP
- Chức năng đặt lại mật khẩu

---

**Kết thúc Tổng quan Dự án**

Tài liệu này phục vụ như một hướng dẫn tham khảo nhanh để hiểu TixChat mà không cần đọc toàn bộ mã nguồn. Để biết thêm thông tin chi tiết, vui lòng tham khảo các tệp tài liệu cụ thể trong thư mục `docs/`.
