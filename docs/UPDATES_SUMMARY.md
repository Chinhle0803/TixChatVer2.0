# 📊 Sơ Đồ Lớp - Phiên Bản Cập Nhật (Chat Advanced)

## 🎯 Tóm Tắt Cập Nhật

Dựa trên yêu cầu của bạn, tôi đã cập nhật **CLASS_DIAGRAM.md** với các tính năng mới:

```
✨ Tính năng Text Message     - Đã hỗ trợ
✨ Tính năng Image Message    - Cập nhật
✨ Tính năng Voice Message    - THÊM MỚI
✨ Tính năng Emoji Reactions  - Đã hỗ trợ
✨ Tính năng Audio Call       - THÊM MỚI
✨ Tính năng Video Call       - THÊM MỚI (future)
```

---

## 📝 Các Tệp Được Cập Nhật

### 1. **CLASS_DIAGRAM.md** (Cập Nhật Chính)

**Thay đổi**:
- ✅ Sơ đồ UML mới thể hiện tất cả loại message
- ✅ Thêm lớp **CallSession** cho quản lý cuộc gọi
- ✅ Thêm fields cho **voiceMessage** và **callData** trong Message model
- ✅ Thêm **messageType** field để phân biệt loại tin nhắn
- ✅ Cập nhật sơ đồ luồng gửi voice message
- ✅ Cập nhật sơ đồ luồng cuộc gọi 1vs1 và nhóm
- ✅ Thêm Socket Events cho call signaling
- ✅ Cập nhật Technology Stack với WebRTC

**Nội dung chi tiết**:
- Message types (Text, Image, Voice, Call)
- VoiceMessage structure
- CallData structure
- CallSession lifecycle
- WebRTC signaling flow
- Socket events cho all features

---

### 2. **IMPLEMENTATION_GUIDE_VOICE_CALL.md** (Mới)

**Mục đích**: Hướng dẫn chi tiết cách implement voice message và call features

**Bao gồm**:
- Voice Message Implementation (Frontend & Backend)
- Audio/Video Call Implementation
- CallSession Model & Service
- WebRTC Setup
- Socket Handlers Update
- Database Migration
- Implementation Checklist
- Dependencies & Environment Variables

---

## 🏗️ Cấu Trúc Dữ Liệu Được Cập Nhật

### Message Table - Schema Cập Nhật

```javascript
{
  messageId: UUID,
  conversationId: UUID,
  senderId: UUID,
  
  // NEW: Phân biệt loại tin nhắn
  messageType: 'text' | 'image' | 'voice' | 'call',
  
  // Nội dung cơ bản
  content: String,
  
  // Cho image messages
  attachments: [{
    type: String,
    url: String,
    size: Number,
    name: String,
    mimeType: String
  }],
  
  // NEW: Cho voice messages
  voiceMessage: {
    url: String,        // S3 URL
    duration: Number,   // Giây
    mimeType: String,   // audio/mpeg
    size: Number,
    transcription: String (optional)
  },
  
  // NEW: Cho call messages
  callData: {
    callType: 'audio' | 'video',
    duration: Number,
    status: String,
    startedAt: ISO,
    endedAt: ISO,
    callerId: UUID,
    participantIds: [UUID]
  },
  
  // Status & Reactions (giữ nguyên)
  status: 'sent' | 'delivered' | 'seen',
  seenBy: [UUID],
  emoji: [{emoji: String, users: [UUID]}],
  
  // Metadata (giữ nguyên)
  replyTo: UUID,
  isEdited: Boolean,
  isDeleted: Boolean,
  createdAt: ISO,
  updatedAt: ISO
}
```

### NEW: CallSession Table

```javascript
{
  callSessionId: UUID,
  conversationId: UUID,
  callType: 'audio' | 'video',
  initiatorId: UUID,
  participants: [{
    userId: UUID,
    status: String,
    joinedAt: ISO,
    leftAt: ISO
  }],
  status: 'initiated' | 'ringing' | 'ongoing' | 'ended' | 'missed',
  startedAt: ISO,
  endedAt: ISO,
  duration: Number,
  recordingUrl: String (optional),
  iceServers: Array,
  createdAt: ISO,
  updatedAt: ISO
}
```

---

## 📚 Các Loại Tin Nhắn Chi Tiết

### 1️⃣ Text Message
```javascript
{
  messageType: "text",
  content: "Chào bạn!",
  emoji: [{emoji: "❤️", users: ["user-b"]}]
}
```

### 2️⃣ Image Message
```javascript
{
  messageType: "image",
  content: "Look at this photo!",
  attachments: [{
    type: "image/jpeg",
    url: "https://s3.../photo.jpg",
    size: 2500000,
    name: "photo.jpg"
  }]
}
```

### 3️⃣ Voice Message
```javascript
{
  messageType: "voice",
  content: "Voice message from User A",
  voiceMessage: {
    url: "https://s3.../voice-msg.mp3",
    duration: 45,
    mimeType: "audio/mpeg",
    size: 450000
  }
}
```

### 4️⃣ Call Message
```javascript
{
  messageType: "call",
  content: "Audio call",
  callData: {
    callType: "audio",
    duration: 120,
    status: "ended",
    startedAt: 1712348300000,
    endedAt: 1712348420000,
    participantIds: ["user-a", "user-b"]
  }
}
```

---

## 🎬 Luồng Hoạt Động

### Voice Message Flow
```
User A ghi âm → Upload to S3 → Create Message (voiceMessage)
                                    ↓
                        Broadcast via WebSocket
                                    ↓
User B nhận message → Display + Play button → Play voice
```

### 1vs1 Call Flow
```
User A: Click Call → Create CallSession → Send 'call-initiated'
                                              ↓
User B: Get notification → Accept → Update CallSession
                                              ↓
Both: Exchange WebRTC signals (offer/answer/ICE)
                                              ↓
Both: Establish P2P connection → Audio stream
                                              ↓
A: Click End → Update CallSession → Create Call Message
                                              ↓
Both: Close connection → Display call history
```

### Group Call Flow
```
User A: Click "Group Call" → Create CallSession
                                 ↓
Send notification to B, C, D
                                 ↓
B accepts → Add to CallSession → A streams to B
C accepts → Add to CallSession → A+B streams to C
D declines → Remove from notification
                                 ↓
All ongoing: Multi-party audio stream (SFU/Mesh)
                                 ↓
A: Click End → Close all connections → Create Message
```

---

## 🔧 Models Mới & Cập Nhật

### Models Mới:
- **CallSession.js** - Quản lý phiên gọi

### Models Cập Nhật:
- **Message.js** 
  - Thêm `messageType` field
  - Thêm `voiceMessage` object
  - Thêm `callData` object
  - Thêm methods: `isVoiceMessage()`, `isCallMessage()`

### Services Mới:
- **CallService.js** - Logic cuộc gọi
- **WebRTCService.js** - WebRTC signaling

### Repositories Mới:
- **CallSessionRepository.js** - CRUD CallSession

### Controllers Mới:
- **CallController.js** - Xử lý call endpoints

### Components Mới (Frontend):
- **VoiceRecorder.jsx** - Ghi âm
- **VoiceMessage.jsx** - Hiển thị voice message
- **CallWindow.jsx** - Giao diện cuộc gọi
- **CallNotification.jsx** - Thông báo gọi đến

---

## 🔌 Socket Events Mới

### Voice Message Events
```javascript
// Send voice message
socket.emit('voice-message-send', { conversationId, voiceUrl, duration })

// Receive voice message
socket.on('voice-message-received', (message) => {})
```

### Call Events
```javascript
// Initiate call
socket.emit('call-initiate', { conversationId, callType })

// Incoming call
socket.on('incoming-call', { callSessionId, caller, callType })

// Accept/Decline
socket.emit('call-accept', { callSessionId, userId })
socket.emit('call-decline', { callSessionId, userId })

// WebRTC Signaling
socket.emit('webrtc-offer', { callSessionId, offer })
socket.on('webrtc-offer', (data) => {})

socket.emit('webrtc-answer', { callSessionId, answer })
socket.on('webrtc-answer', (data) => {})

socket.emit('ice-candidate', { callSessionId, candidate })
socket.on('ice-candidate', (data) => {})

// Call ended
socket.emit('call-end', { callSessionId })
socket.on('call-ended', { callSessionId, duration })
```

---

## 📦 Dependencies Cần Thêm

### Frontend
```json
{
  "simple-peer": "^9.11.1",
  "wavesurfer.js": "^6.0.0"
}
```

### Backend
```json
{
  "uuid": "^9.0.0"
}
```

---

## 📊 Tóm Tắt So Sánh

| Tính Năng | Trước | Sau |
|-----------|-------|-----|
| Text Message | ✅ | ✅ (không đổi) |
| Image Message | ⚠️ Schema sẵn | ✅ Cập nhật UI |
| Voice Message | ❌ | ✅ Thêm mới |
| Emoji Reaction | ✅ | ✅ (không đổi) |
| Audio Call | ❌ | ✅ Thêm mới |
| Video Call | ❌ | ✅ (future) |
| Call History | ❌ | ✅ Thêm mới |
| CallSession Tracking | ❌ | ✅ Thêm mới |

---

## 🚀 Bước Tiếp Theo

1. **Đọc CLASS_DIAGRAM.md** để hiểu toàn bộ cấu trúc mới
2. **Đọc IMPLEMENTATION_GUIDE_VOICE_CALL.md** để biết cách implement
3. **Bắt đầu với Voice Message** (dễ nhất, 2-3 ngày)
4. **Rồi tới Call Features** (phức tạp hơn, 5-7 ngày)
5. **Test & Optimize**

---

## 📞 Hỗ Trợ

- Tất cả tài liệu đã được cập nhật
- Code examples sẵn sàng copy-paste
- Checklist implementation chi tiết

**Good luck! 🎉**

