# Sơ Đồ Lớp TixChat

## 1. Sơ Đồ UML Tổng Quát

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      TIXCHAT CLASS DIAGRAM (Updated)                        │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────────┐
                              │      User        │
                              ├──────────────────┤
                              │ - userId: UUID   │
                              │ - username: str  │
                              │ - email: str     │
                              │ - password: str  │
                              │ - fullName: str  │
                              │ - avatar: URL    │
                              │ - bio: str       │
                              │ - isOnline: bool │
                              │ - lastSeen: ISO  │
                              │ - friends: []    │
                              │ - blockedUsers:[]│
                              │ - isEmailVerified│
                              │ + validate()     │
                              │ + toDynamoDB()   │
                              └──────────────────┘
                                      △
                                      │ uses
                         ┌────────────┴────────────┐
                         │                         │
                    ┌────▼──────┐         ┌────────▼───┐
                    │ Participant│         │Conversation│
                    ├────────────┤         ├────────────┤
                    │ - participantId│ - conversationId│
                    │ - conversationId│ - type: 1-1/group
                    │ - userId    │ - name: str
                    │ - role      │ - avatar: URL
                    │ - isMuted   │ - participants:[]
                    │ - lastReadAt│ - admin: UUID
                    │ + validate()│ - lastMessage: UUID
                    │ + toDynamoDB│ - isArchived: bool
                    └────┬──────┘ │ - description: str
                         │        │ + validate()
                         │        │ + toDynamoDB()
                         │        └────┬───────────┘
                         │             │
                    ┌────┴─────────────┴──┐
                    │                     │
                ┌───▼────────────────┐   │
                │    Message         │   │
                ├────────────────────┤   │
                │ - messageId: UUID  │   │
                │ - conversationId   │   │
                │ - senderId: UUID   │   │
                │ - messageType      │◄──┘
                │   (text/image/     │
                │   voice/call)      │
                │ - content: str     │
                │ - attachments: []  │ ┌──────────────┐
                │ - voiceMessage: {} │◄┤VoiceMessage │
                │ - callData: {}     │ ├──────────────┤
                │ - status: str      │ │ - url: str  │
                │ - seenBy: []       │ │ - duration  │
                │ - emoji: []        │ │ - mimeType  │
                │ - replyTo: UUID    │ │ - size      │
                │ + validate()       │ │ - transcript│
                │ + toDynamoDB()     │ └──────────────┘
                │ + isTextMessage()  │
                │ + isImageMessage() │ ┌──────────────┐
                │ + isVoiceMessage() │◄┤CallData     │
                │ + isCallMessage()  │ ├──────────────┤
                └────────────────────┘ │ - callType  │
                                        │ - duration  │
                                        │ - status    │
                                        │ - startedAt │
                                        │ - endedAt   │
                                        │ - participants
                                        └──────────────┘

              ┌─────────────────────────┐
              │    CallSession          │
              ├─────────────────────────┤
              │ - callSessionId: UUID   │
              │ - conversationId: UUID  │
              │ - callType: str         │
              │ - initiatorId: UUID     │
              │ - participants: Array   │
              │ - status: str           │
              │ - startedAt: ISO        │
              │ - endedAt: ISO          │
              │ - duration: Number      │
              │ - recordingUrl: str     │
              │ + validate()            │
              │ + isActive()            │
              │ + addParticipant()      │
              │ + removeParticipant()   │
              │ + endCall()             │
              └─────────────────────────┘
                        △
                        │ creates when
                        │ callType='call'
                        │
                    Message
```

## 2. Chi Tiết Các Lớp Model

### 2.1 User (Người Dùng)
**Mục đích**: Đại diện cho một người dùng trong hệ thống

| Thuộc tính | Kiểu | Mô tả |
|-----------|------|-------|
| userId | UUID | ID duy nhất của người dùng |
| username | String | Tên người dùng (duy nhất, 3-30 ký tự) |
| email | String | Email (duy nhất, hợp lệ) |
| password | String | Mật khẩu (đã mã hóa) |
| fullName | String | Họ tên đầy đủ |
| avatar | String/URL | Ảnh đại diện |
| bio | String | Tiểu sử (tối đa 500 ký tự) |
| isOnline | Boolean | Trạng thái online |
| lastSeen | ISO String | Lần cuối cùng active |
| friends | Array<UUID> | Danh sách bạn bè |
| blockedUsers | Array<UUID> | Danh sách người dùng bị chặn |
| isEmailVerified | Boolean | Email đã xác nhận |
| emailVerificationOtp | String | Mã OTP xác nhận |
| emailVerificationOtpExpires | ISO String | Thời gian hết hạn OTP |
| resetPasswordToken | String | Token reset mật khẩu |
| resetPasswordExpires | ISO String | Hết hạn token reset |
| createdAt | ISO String | Ngày tạo tài khoản |
| updatedAt | ISO String | Ngày cập nhật lần cuối |

**Phương thức**:
- `validate()`: Kiểm tra dữ liệu hợp lệ
- `toDynamoDB()`: Chuyển đổi sang định dạng DynamoDB
- `fromDynamoDB()`: Chuyển đổi từ DynamoDB

---

### 2.2 Conversation (Cuộc Hội Thoại)
**Mục đích**: Đại diện cho một cuộc trò chuyện (1-1 hoặc group)

| Thuộc tính | Kiểu | Mô tả |
|-----------|------|-------|
| conversationId | UUID | ID duy nhất của cuộc hội thoại |
| type | String | Loại: '1-1' hoặc 'group' |
| name | String | Tên cuộc hội thoại (bắt buộc cho group) |
| avatar | String/URL | Ảnh đại diện cuộc trò chuyện |
| participants | Array<UUID> | Danh sách userId của người tham gia |
| admin | UUID | userId của quản trị viên (bắt buộc cho group) |
| lastMessage | UUID | ID tin nhắn cuối cùng |
| lastMessageAt | ISO String | Thời gian tin nhắn cuối cùng |
| isArchived | Boolean | Đã lưu trữ hay không |
| description | String | Mô tả cuộc hội thoại (tối đa 500 ký tự) |
| createdAt | ISO String | Ngày tạo |
| updatedAt | ISO String | Ngày cập nhật lần cuối |

**Phương thức**:
- `validate()`: Kiểm tra dữ liệu hợp lệ
- `toDynamoDB()`: Chuyển đổi sang định dạng DynamoDB
- `fromDynamoDB()`: Chuyển đổi từ DynamoDB

---

### 2.3 Message (Tin Nhắn)
**Mục đích**: Đại diện cho một tin nhắn trong cuộc hội thoại (hỗ trợ nhiều loại nội dung)

| Thuộc tính | Kiểu | Mô tả |
|-----------|------|-------|
| messageId | UUID | ID duy nhất của tin nhắn |
| conversationId | UUID | ID cuộc hội thoại chứa tin nhắn |
| senderId | UUID | ID người gửi |
| messageType | String | Loại tin nhắn: 'text', 'image', 'voice', 'call' |
| content | String | Nội dung tin nhắn (tối đa 5000 ký tự) |
| attachments | Array | Danh sách file đính kèm {type, url, size, name, mimeType} |
| voiceMessage | Object | Voice message: {url, duration, mimeType, size} |
| callData | Object | Dữ liệu cuộc gọi: {callType, duration, status, startedAt, endedAt} |
| status | String | Trạng thái: 'sent', 'delivered', 'seen' |
| seenBy | Array<UUID> | Danh sách người đã xem |
| deliveredTo | Array<UUID> | Danh sách người đã nhận |
| replyTo | UUID | ID tin nhắn được trả lời (nếu có) |
| emoji | Array | Danh sách reaction emoji {emoji, users:[]} |
| isEdited | Boolean | Đã chỉnh sửa hay không |
| editedAt | ISO String | Lần chỉnh sửa cuối cùng |
| isDeleted | Boolean | Đã xóa hay không |
| deletedAt | ISO String | Thời gian xóa |
| createdAt | ISO String | Ngày tạo |
| updatedAt | ISO String | Ngày cập nhật lần cuối |

**Phương thức**:
- `validate()`: Kiểm tra dữ liệu hợp lệ
- `toDynamoDB()`: Chuyển đổi sang định dạng DynamoDB
- `fromDynamoDB()`: Chuyển đổi từ DynamoDB
- `isTextMessage()`: Kiểm tra loại text
- `isImageMessage()`: Kiểm tra loại hình ảnh
- `isVoiceMessage()`: Kiểm tra loại voice
- `isCallMessage()`: Kiểm tra loại cuộc gọi

---

### 2.3.1 Voice Message (Tin Nhắn Giọng Nói)
**Mục đích**: Đại diện cho tin nhắn voice memo

| Thuộc tính | Kiểu | Mô tả |
|-----------|------|-------|
| url | String | URL file voice message (lưu trên S3) |
| duration | Number | Thời lượng voice message (giây) |
| mimeType | String | Loại file: 'audio/mpeg', 'audio/wav', 'audio/ogg' |
| size | Number | Kích thước file (bytes) |
| transcription | String | Chữ hóa voice message (optional) |

---

### 2.3.2 Call Data (Dữ Liệu Cuộc Gọi)
**Mục đích**: Lưu thông tin về cuộc gọi thoại

| Thuộc tính | Kiểu | Mô tả |
|-----------|------|-------|
| callType | String | Loại gọi: 'audio' hoặc 'video' |
| duration | Number | Thời lượng gọi (giây) |
| status | String | Trạng thái: 'initiated', 'ongoing', 'ended', 'missed', 'declined' |
| startedAt | ISO String | Thời gian bắt đầu gọi |
| endedAt | ISO String | Thời gian kết thúc gọi |
| callerId | UUID | ID người gọi |
| participantIds | Array<UUID> | ID những người tham gia gọi |

---

### 2.4 CallSession (Phiên Gọi)
**Mục đích**: Quản lý phiên gọi thoại/video trong hệ thống

| Thuộc tính | Kiểu | Mô tả |
|-----------|------|-------|
| callSessionId | UUID | ID duy nhất của phiên gọi |
| conversationId | UUID | ID cuộc hội thoại chứa cuộc gọi |
| callType | String | Loại gọi: 'audio' hoặc 'video' |
| initiatorId | UUID | ID người bắt đầu cuộc gọi |
| participants | Array | Danh sách người tham gia {userId, joinedAt, leftAt, status} |
| status | String | Trạng thái: 'initiated', 'ringing', 'ongoing', 'ended', 'missed' |
| startedAt | ISO String | Thời gian bắt đầu |
| endedAt | ISO String | Thời gian kết thúc |
| duration | Number | Thời lượng cuộc gọi (giây) |
| recordingUrl | String | URL file ghi âm (nếu có) |
| iceServers | Array | Danh sách TURN/STUN servers |
| createdAt | ISO String | Ngày tạo |
| updatedAt | ISO String | Ngày cập nhật lần cuối |

**Phương thức**:
- `validate()`: Kiểm tra dữ liệu hợp lệ
- `toDynamoDB()`: Chuyển đổi sang định dạng DynamoDB
- `fromDynamoDB()`: Chuyển đổi từ DynamoDB
- `isActive()`: Kiểm tra cuộc gọi còn hoạt động
- `addParticipant()`: Thêm người tham gia
- `removeParticipant()`: Xóa người tham gia
- `endCall()`: Kết thúc cuộc gọi

---

### 2.5 Participant (Người Tham Gia)
**Mục đích**: Đại diện cho một người tham gia trong cuộc hội thoại (junction table)

| Thuộc tính | Kiểu | Mô tả |
|-----------|------|-------|
| participantId | UUID | ID duy nhất |
| conversationId | UUID | ID cuộc hội thoại |
| userId | UUID | ID người dùng |
| role | String | Vai trò: 'admin' hoặc 'member' |
| isMuted | Boolean | Cuộc hội thoại bị tắt tiếng hay không |
| lastReadMessageId | UUID | ID tin nhắn cuối cùng được đọc |
| lastReadAt | ISO String | Lần cuối cùng đọc |
| joinedAt | ISO String | Thời gian tham gia |
| leftAt | ISO String | Thời gian rời khỏi (null nếu vẫn tham gia) |
| createdAt | ISO String | Ngày tạo |
| updatedAt | ISO String | Ngày cập nhật lần cuối |

**Phương thức**:
- `validate()`: Kiểm tra dữ liệu hợp lệ
- `toDynamoDB()`: Chuyển đổi sang định dạng DynamoDB
- `fromDynamoDB()`: Chuyển đổi từ DynamoDB

---

## 3. Các Tầng Kiến Trúc

### 3.1 Kiến Trúc 3 Tầng

```
┌─────────────────────────────────────────────────────┐
│              Frontend (React + Vite)                │
│  ├─ Pages: AuthContainer, ChatPage, etc.           │
│  ├─ Components: ChatWindow, ConversationList, etc. │
│  ├─ Services: api.js, socket.js                    │
│  └─ Store: authStore, chatStore                    │
└─────────────────────────────┬───────────────────────┘
                              │ HTTP/WebSocket
┌─────────────────────────────▼───────────────────────┐
│           Backend (Node.js + Express)              │
│  ├─ Routes: auth, conversation, message, user      │
│  ├─ Controllers: AuthController, etc.              │
│  ├─ Services: AuthService, ConversationService, etc│
│  ├─ Repositories: UserRepository, etc.             │
│  ├─ Models: User, Conversation, Message, Participant│
│  └─ Socket: handlers.js (real-time events)         │
└─────────────────────────────┬───────────────────────┘
                              │ 
┌─────────────────────────────▼───────────────────────┐
│      Database Layer (DynamoDB + S3)                 │
│  ├─ DynamoDB Tables: Users, Conversations, etc.    │
│  └─ S3: File storage for avatars & attachments     │
└─────────────────────────────────────────────────────┘
```

### 3.2 Mối Quan Hệ Giữa Các Lớp

```
┌──────────────────────────────────────────────────────────┐
│                    Repository Pattern                     │
└──────────────────────────────────────────────────────────┘

UserRepository
  ├─ create(userData)
  ├─ findById(userId)
  ├─ findByEmail(email)
  ├─ findByUsername(username)
  ├─ update(userId, data)
  └─ delete(userId)

ConversationRepository
  ├─ create(data)
  ├─ findById(conversationId)
  ├─ findByParticipant(userId)
  ├─ update(conversationId, data)
  └─ delete(conversationId)

MessageRepository
  ├─ create(messageData)
  ├─ findById(messageId)
  ├─ findByConversation(conversationId)
  ├─ update(messageId, data)
  └─ delete(messageId)

ParticipantRepository
  ├─ create(data)
  ├─ findById(participantId)
  ├─ findByConversation(conversationId)
  ├─ update(participantId, data)
  └─ delete(participantId)
```

---

## 4. Loại Tin Nhắn Hỗ Trợ

### 4.1 Text Message (Tin Nhắn Text)
```javascript
{
  messageId: "msg-1",
  conversationId: "conv-123",
  senderId: "user-a",
  messageType: "text",
  content: "Chào bạn!",
  emoji: [
    { emoji: "❤️", users: ["user-b"] },
    { emoji: "😄", users: ["user-c", "user-d"] }
  ],
  status: "seen",
  seenBy: ["user-b", "user-c"],
  replyTo: null,
  createdAt: 1712348000000
}
```

### 4.2 Image Message (Tin Nhắn Hình Ảnh)
```javascript
{
  messageId: "msg-2",
  conversationId: "conv-123",
  senderId: "user-a",
  messageType: "image",
  content: "Look at this photo!",
  attachments: [
    {
      type: "image/jpeg",
      url: "https://s3.../photo1.jpg",
      size: 2500000,
      name: "photo1.jpg",
      mimeType: "image/jpeg",
      width: 1920,
      height: 1080
    },
    {
      type: "image/png",
      url: "https://s3.../photo2.png",
      size: 1800000,
      name: "photo2.png",
      mimeType: "image/png"
    }
  ],
  status: "delivered",
  createdAt: 1712348100000
}
```

### 4.3 Voice Message (Tin Nhắn Giọng Nói)
```javascript
{
  messageId: "msg-3",
  conversationId: "conv-123",
  senderId: "user-a",
  messageType: "voice",
  content: "Voice message from User A",
  voiceMessage: {
    url: "https://s3.../voice-msg-123.mp3",
    duration: 45,           // 45 giây
    mimeType: "audio/mpeg",
    size: 450000,
    transcription: "Lời chép từ giọng nói (nếu có)"
  },
  status: "delivered",
  createdAt: 1712348200000
}
```

### 4.4 Call Message (Tin Nhắn Cuộc Gọi)
```javascript
{
  messageId: "msg-4",
  conversationId: "conv-123",
  senderId: "user-a",
  messageType: "call",
  content: "Audio call",
  callData: {
    callType: "audio",           // hoặc "video"
    duration: 120,               // 120 giây
    status: "ended",             // initiated, ongoing, ended, missed, declined
    startedAt: 1712348300000,
    endedAt: 1712348420000,
    callerId: "user-a",
    participantIds: ["user-a", "user-b"]
  },
  status: "delivered",
  createdAt: 1712348300000
}
```

---

## 5. Quy Trình Cuộc Gọi Thoại/Video

### 5.1 Luồng Cuộc Gọi 1vs1

```
User A (Caller)                          User B (Receiver)
    │                                         │
    ├─► Initiate Call ───────────────────────►│
    │   (Create CallSession)                  │
    │                                    ┌────▼────┐
    │                                    │Ringing  │
    │                                    └────┬────┘
    │   ◄─────── Accept Call ────────────────┤
    │   (Add to CallSession)                  │
    │                                    ┌────▼────┐
    │   ◄─────── Establish WebRTC ───────────►│
    │   (Exchange SDP/ICE)                    │
    │                                    ┌────▼────┐
    │   ◄───────── Ongoing Call ──────────────►│
    │   (Send/receive audio/video)            │
    │                                         │
    │   ◄─────── End Call ────────────────────┤
    │   (Update CallSession status)           │
    │                                    ┌────▼────┐
    └─► Save Call Record ─────────────────────►│
        (Create Message with callData)        │
```

### 5.2 Luồng Cuộc Gọi Nhóm

```
Initiator (User A)
    │
    ├─► Initiate Group Call
    │   (Create CallSession)
    │   (Send invitation to User B, C, D)
    │
    ├─► User B accepts ──► Join CallSession
    ├─► User C accepts ──► Join CallSession
    ├─► User D declines ─► Decline CallSession
    │
    ├─► Establish WebRTC mesh/SFU
    │   (Connect all participants)
    │
    ├─► Ongoing Group Call
    │   (All participants send/receive audio/video)
    │
    └─► End Call
        (Remove all participants)
        (Save Call Record with all participants)
```

### 5.3 CallSession Lifecycle

```
INITIATED ──► RINGING ──► ONGOING ──► ENDED
    │                           │
    ├──► MISSED (timeout)       │
    │                           │
    └──► DECLINED (user reject) │

Participants join during ONGOING state
Participants can leave anytime before END state
```

---

## 6. Danh Sách Các Model Được Update

### Models:
- ✅ `User.js` - Người dùng (không thay đổi)
- ✅ `Conversation.js` - Cuộc hội thoại (không thay đổi)
- ✅ `Message.js` - **Cập nhật**: Thêm `messageType`, `voiceMessage`, `callData`
- ✅ `Participant.js` - Người tham gia (không thay đổi)
- ✅ **NEW**: `CallSession.js` - Phiên gọi thoại/video (mới)

### Tables DynamoDB:
- `tixchat-users` (không thay đổi)
- `tixchat-conversations` (không thay đổi)
- `tixchat-messages` (cập nhật schema)
- `tixchat-participants` (không thay đổi)
- **NEW**: `tixchat-callsessions` - Lưu thông tin phiên gọi

---

## 7. Quy Trình Tương Tác Giữa Các Lớp

### 7.1 Quy Trình Đăng Ký
```
RegisterPage (Frontend)
    │
    ├─► AuthController.register()
    │      │
    │      └─► AuthService.register()
    │             │
    │             ├─► UserRepository.findByEmail() / findByUsername()
    │             ├─► UserRepository.create(User)
    │             ├─► EmailService.sendEmailVerificationOtp()
    │             └─► return User + OTP token
    │
    └─► Store user session
```

### 7.2 Quy Trình Tạo Cuộc Hội Thoại
```
ChatPage (Frontend)
    │
    ├─► ConversationController.create()
    │      │
    │      └─► ConversationService.create()
    │             │
    │             ├─► ConversationRepository.create(Conversation)
    │             ├─► ParticipantRepository.create(Participant) for each user
    │             └─► return Conversation
    │
    └─► Broadcast via WebSocket
```

### 7.3 Quy Trình Gửi Tin Nhắn (Text + Image)
```
ChatWindow (Frontend)
    │
    ├─► MessageController.create()
    │      │
    │      └─► MessageService.create()
    │             │
    │             ├─► MessageRepository.create(Message)
    │             ├─► ConversationRepository.update(lastMessage)
    │             └─► Emit 'message-created' event
    │
    ├─► WebSocket: handlers.js
    │      │
    │      └─► Broadcast to all conversation participants
    │
    └─► Real-time update in ChatWindow
```

### 7.3 Quy Trình Gửi Tin Nhắn (Text + Image)
```
ChatWindow (Frontend)
    │
    ├─► MessageController.create()
    │      │
    │      └─► MessageService.create()
    │             │
    │             ├─► MessageRepository.create(Message)
    │             ├─► ConversationRepository.update(lastMessage)
    │             └─► Emit 'message-created' event
    │
    ├─► WebSocket: handlers.js
    │      │
    │      └─► Broadcast to all conversation participants
    │
    └─► Real-time update in ChatWindow
```

### 7.4 Quy Trình Gửi Voice Message
```
ChatWindow (Frontend) - Voice Recording
    │
    ├─► Record audio ──► Compress ──► Convert to Audio File
    │
    ├─► S3Service.uploadVoiceMessage()
    │      │
    │      └─► Upload to S3 ──► Get URL
    │
    ├─► MessageController.create()
    │      │
    │      └─► MessageService.create()
    │             │
    │             ├─► Create Message with:
    │             │   - messageType: "voice"
    │             │   - voiceMessage: {url, duration, mimeType, size}
    │             │
    │             ├─► MessageRepository.create(Message)
    │             ├─► ConversationRepository.update(lastMessage)
    │             └─► Emit 'voice-message-created' event
    │
    ├─► WebSocket: Broadcast to all participants
    │
    └─► Real-time update in ChatWindow with play button
```

### 7.5 Quy Trình Gọi Thoại/Video (Audio Call)
```
User A (Caller)                       User B (Receiver)
    │                                       │
    ├─► Click "Call" Button                 │
    │      │                                 │
    │      └─► CallController.initiate()    │
    │             │                          │
    │             ├─► Create CallSession    │
    │             │   (status: initiated)   │
    │             │                          │
    │             ├─► CallRepository.create()
    │             │                          │
    │             └─► Emit 'call-initiated'─┼──► Receive Call Notification
    │                                       │
    │                                  ┌────▼─────┐
    │                                  │ User B   │
    │                                  │ Answers? │
    │                                  └────┬─────┘
    │                                       │
    │◄─────────── 'call-accepted' ─────────┤
    │                                       │
    │   Update CallSession                  │
    │   (Add User B to participants)        │
    │                                       │
    │   ┌──────────────────────────────┐   │
    │   │ WebRTC Connection Established│   │
    │   │ Exchange SDP + ICE candidates│   │
    │   └──────────────────────────────┘   │
    │      (via WebSocket signals)          │
    │◄────────────────────────────────────►│
    │      (audio/video data)               │
    │                                       │
    │   Update CallSession (status: ongoing)
    │                                       │
    │   ┌─────────────────────────────────┐│
    │   │  Both Can See Call Duration     ││
    │   │  Track Participants Status      ││
    │   └─────────────────────────────────┘│
    │                                       │
    │   Click "End Call" ◄─────── Click "End Call"
    │      │                           │
    │      └─► CallController.endCall()
    │             │
    │             ├─► Update CallSession
    │             │   (status: ended)
    │             │
    │             ├─► Calculate duration
    │             │
    │             ├─► Create Message with callData
    │             │   {callType, duration, status, participants}
    │             │
    │             ├─► MessageRepository.create()
    │             │
    │             └─► Emit 'call-ended'───────────┤
    │                                              │
    │◄───── Close WebRTC Connection ──────────────┤
    │
    └─► Display Call Summary in Chat
        (Duration, Status, Participants)
```

### 7.6 Quy Trình Gọi Nhóm
```
Group Chat Window
    │
    ├─► Initiator clicks "Group Call"
    │      │
    │      └─► Create CallSession
    │          - callType: "audio" or "video"
    │          - status: "initiated"
    │          - participants: [initiator_id]
    │
    ├─► Emit 'group-call-initiated' to all members
    │      │
    │      ├─► Member B: Notification appears
    │      ├─► Member C: Notification appears
    │      ├─► Member D: Notification appears
    │
    ├─► Members can accept/decline
    │      │
    │      ├─► B accepts ──► Add to CallSession
    │      ├─► C accepts ──► Add to CallSession
    │      ├─► D declines ──► Notify initiator
    │
    ├─► WebRTC Connection (SFU/Mesh)
    │      │
    │      └─► Connect: Initiator + B + C
    │          Stream audio/video
    │
    ├─► Call ongoing with dynamic participants
    │      │
    │      ├─► New member joins ──► Add to stream
    │      └─► Member leaves ──► Remove from stream
    │
    └─► End call (by initiator or last member)
        ├─► Close all WebRTC connections
        ├─► Calculate duration
        ├─► Create Message with callData
        │   (participants: [A, B, C])
        └─► Display call summary
```

---

## 8. Sơ Đồ Mối Quan Hệ Dữ Liệu (ER Diagram)

```
User (1) ──────────────┐
                       │
                  (0..*) 
                       │
                  Participant
                       │
                  (0..*)│
                       │
Conversation ──────────┴──────── (1)
     │                 
     │ (1)        (0..*)
     └──────────────────── Message
                               │
                               │
                            (N) Sender → User (1)
```

**Giải Thích**:
- 1 User có thể tham gia vào nhiều Conversation thông qua Participant
- 1 Conversation có thể chứa nhiều Message
- 1 Message được gửi bởi 1 User (Sender)
- 1 Conversation có thể có nhiều Participant
- 1 Participant liên kết 1 User với 1 Conversation

---

## 9. Danh Sách Các Lớp Đầy Đủ (Cập Nhật)

### Backend Models:
- ✅ `User.js` - Người dùng
- ✅ `Conversation.js` - Cuộc hội thoại
- ✅ `Message.js` - Tin nhắn (hỗ trợ text, image, voice, call)
- ✅ `Participant.js` - Người tham gia
- ✅ **NEW** `CallSession.js` - Phiên gọi thoại/video

### Backend Repositories:
- `UserRepository.js`
- `ConversationRepository.js`
- `MessageRepository.js`
- `ParticipantRepository.js`
- **NEW** `CallSessionRepository.js`

### Backend Services:
- `AuthService.js`
- `UserService.js`
- `ConversationService.js`
- `MessageService.js`
- `EmailService.js`
- `S3Service.js`
- **NEW** `CallService.js` - Quản lý cuộc gọi
- **NEW** `WebRTCService.js` - Xử lý WebRTC signals

### Backend Controllers:
- `AuthController.js`
- `UserController.js`
- `ConversationController.js`
- `MessageController.js`
- **NEW** `CallController.js` - Xử lý cuộc gọi

### Frontend Components:
- `ChatWindow.jsx` - Cửa sổ chat (hỗ trợ text, image, voice, call)
- `ConversationList.jsx`
- `Message.jsx` - Hiển thị tin nhắn
- **NEW** `VoiceMessage.jsx` - Hiển thị voice message + play
- **NEW** `CallMessage.jsx` - Hiển thị lịch sử cuộc gọi
- **NEW** `CallWindow.jsx` - Giao diện cuộc gọi
- **NEW** `VoiceRecorder.jsx` - Ghi âm voice message

### Frontend Pages:
- `AuthContainer.jsx`
- `ChatPage.jsx`
- `LoginPage.jsx`
- `RegisterPage.jsx`
- `ForgotPasswordPage.jsx`
- `VerifyEmailPage.jsx`
- `VerifyOTPPage.jsx`

---

## 10. Công Nghệ Sử Dụng (Cập Nhật)

```
┌──────────────────────────────────────────────────────┐
│           TECHNOLOGY STACK (Cập Nhật)               │
├──────────────────────────────────────────────────────┤
│ Frontend:                                            │
│  • React 18                                          │
│  • Vite                                              │
│  • Socket.io (WebSocket)                             │
│  • WebRTC (Audio/Video Call) ✨ NEW                 │
│  • MediaRecorder API (Voice Recording) ✨ NEW       │
│  • TwilioJS / simple-peer (WebRTC Library)          │
│                                                      │
│ Backend:                                             │
│  • Node.js + Express                                 │
│  • Socket.io (Real-time communication)               │
│  • JWT (Authentication)                              │
│  • Nodemailer (Email)                                │
│  • AWS S3 (File storage)                             │
│  • AWS DynamoDB (Database)                           │
│  • UUID (Unique identifiers)                         │
│  • WebRTC Signaling (via Socket.io) ✨ NEW          │
│  • TURN/STUN Servers (Coturn / Twilio) ✨ NEW      │
│                                                      │
│ Database:                                            │
│  • AWS DynamoDB (NoSQL)                              │
│    - Tables: users, conversations, messages          │
│             participants, callsessions ✨ NEW        │
│  • AWS S3 (Object storage)                           │
│    - Audio files (voice messages)                    │
│    - Images (chat attachments)                       │
│                                                      │
│ WebRTC Infrastructure ✨ NEW:                       │
│  • STUN Servers: For NAT traversal                   │
│  • TURN Servers: For relay when P2P not possible    │
│  • Signal Server: Socket.io (SDP exchange)          │
└──────────────────────────────────────────────────────┘
```

---

## Ghi Chú

- **DynamoDB**: Sử dụng NoSQL, nên các quan hệ không được định nghĩa ở mức cơ sở dữ liệu mà ở mức ứng dụng
- **Indexes**: Sử dụng Global Secondary Indexes (GSI) để truy vấn nhanh
- **UUID**: Tất cả các ID sử dụng UUID để đảm bảo tính duy nhất và an toàn
- **Timestamps**: Sử dụng ISO 8601 format cho tất cả các ngày giờ
- **Validation**: Mỗi lớp model có phương thức validate() riêng để kiểm tra dữ liệu

---

## 11. Socket Events (Real-time Communication)

### Message Events
```javascript
// Client → Server
socket.emit('message-send', {
  conversationId, senderId, content, messageType
})

// Server → All Participants
socket.on('message-received', (message) => {
  // Update chat window
})

socket.emit('message-seen', { messageId, userId })
socket.on('message-status-updated', (message) => {})
```

### Voice Message Events
```javascript
// Client → Server
socket.emit('voice-message-send', {
  conversationId, senderId, voiceUrl, duration
})

// Server → All Participants
socket.on('voice-message-received', (message) => {
  // Display voice message with play button
})
```

### Call Events
```javascript
// === Initiator Side ===
socket.emit('call-initiate', {
  conversationId, initiatorId, callType ('audio'/'video')
})

// === Receiver Side ===
socket.on('incoming-call', { callSessionId, caller, callType })

socket.emit('call-accept', { callSessionId, userId })
socket.emit('call-decline', { callSessionId, userId, reason })

// === Both Sides - WebRTC Signaling ===
socket.emit('webrtc-offer', { callSessionId, offer })
socket.on('webrtc-offer', (data) => {})

socket.emit('webrtc-answer', { callSessionId, answer })
socket.on('webrtc-answer', (data) => {})

socket.emit('ice-candidate', { callSessionId, candidate })
socket.on('ice-candidate', (data) => {})

// === Call Status ===
socket.on('participant-joined', { callSessionId, userId })
socket.on('participant-left', { callSessionId, userId })

socket.emit('call-end', { callSessionId, userId })
socket.on('call-ended', { callSessionId, duration })

// === Group Call Specific ===
socket.on('group-call-initiated', { callSessionId, initiator })
socket.emit('group-call-member-joined', { callSessionId, userId })
socket.on('call-participants-updated', { participants: [] })
```

### Emoji Reaction Events
```javascript
socket.emit('emoji-react', { messageId, emoji, userId })
socket.on('emoji-reaction-added', { messageId, emoji, userId })

socket.emit('emoji-react-remove', { messageId, emoji, userId })
socket.on('emoji-reaction-removed', { messageId, emoji, userId })
```

---

## 12. Tính Năng Chi Tiết Theo Loại Tin Nhắn

### Text Message Features
- ✅ Gửi tin nhắn văn bản
- ✅ Emoji reactions (❤️, 😄, 👍, etc.)
- ✅ Reply to message
- ✅ Edit message
- ✅ Delete message
- ✅ Mention users (@user)
- ✅ Hashtag support (#topic)
- ✅ Link preview

### Image Message Features
- ✅ Gửi hình ảnh (PNG, JPEG, WebP)
- ✅ Multiple images in one message
- ✅ Image compression
- ✅ Thumbnail preview
- ✅ Full screen view
- ✅ Download image
- ✅ Image reactions

### Voice Message Features
- ✅ Ghi âm voice message
- ✅ Xem thời lượng
- ✅ Play/pause voice message
- ✅ Download voice file
- ✅ Transcription (AI future feature)
- ✅ Voice message reactions

### Call Features
- ✅ Audio call (1vs1)
- ✅ Video call (1vs1) - future
- ✅ Group audio call
- ✅ Call history
- ✅ Call duration tracking
- ✅ Missed call notification
- ✅ Call recording (optional)
- ✅ Screen sharing (future)

---

## 13. Database Schema Changes

### Bảng Messages - Cập Nhật

```javascript
{
  messageId: UUID (Primary Key),
  conversationId: UUID (GSI),
  senderId: UUID (GSI),
  
  // === Loại tin nhắn ===
  messageType: String (text/image/voice/call),
  
  // === Nội dung cơ bản ===
  content: String (max 5000),
  
  // === Đối với Image Messages ===
  attachments: [{
    type: String,
    url: String (S3),
    size: Number,
    name: String,
    mimeType: String
  }],
  
  // === Đối với Voice Messages ===
  voiceMessage: {
    url: String (S3),
    duration: Number,
    mimeType: String,
    size: Number,
    transcription: String
  },
  
  // === Đối với Call Messages ===
  callData: {
    callType: String (audio/video),
    duration: Number,
    status: String,
    startedAt: ISO,
    endedAt: ISO,
    callerId: UUID,
    participantIds: [UUID]
  },
  
  // === Trạng thái tin nhắn ===
  status: String (sent/delivered/seen),
  seenBy: [UUID],
  deliveredTo: [UUID],
  
  // === Interactions ===
  replyTo: UUID,
  emoji: [{
    emoji: String,
    users: [UUID]
  }],
  
  // === Chỉnh sửa & xóa ===
  isEdited: Boolean,
  editedAt: ISO,
  isDeleted: Boolean,
  deletedAt: ISO,
  
  // === Timestamps ===
  createdAt: ISO,
  updatedAt: ISO
}
```

### Bảng CallSessions - Mới

```javascript
{
  callSessionId: UUID (Primary Key),
  conversationId: UUID (GSI),
  
  callType: String (audio/video),
  status: String (initiated/ringing/ongoing/ended/missed),
  
  initiatorId: UUID,
  participants: [{
    userId: UUID,
    status: String (invited/accepted/declined/ongoing/left),
    joinedAt: ISO,
    leftAt: ISO
  }],
  
  startedAt: ISO,
  endedAt: ISO,
  duration: Number,
  
  recordingUrl: String (S3),
  iceServers: [{
    urls: [String],
    username: String,
    credential: String
  }],
  
  createdAt: ISO,
  updatedAt: ISO
}
```

