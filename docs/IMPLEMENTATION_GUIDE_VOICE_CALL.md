# Hướng Dẫn Implement Tính Năng Chat Nâng Cấp

## 📌 Tính Năng Mới (Updated)

```
✅ Chat Text Message      - Đã có cơ bản
✅ Chat Image Message     - Cần cập nhật UI
✅ Chat Voice Message     - CẦN IMPLEMENT
✅ Audio/Video Call       - CẦN IMPLEMENT
✅ Emoji Reactions        - Đã có cơ bản
```

---

## 1. Voice Message Implementation

### 1.1 Frontend - Voice Recording Component

```jsx
// components/VoiceRecorder.jsx
import React, { useState, useRef } from 'react'

export function VoiceRecorder({ conversationId, onVoiceSend }) {
  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const timerRef = useRef(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      
      audioChunksRef.current = []
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' })
        await onVoiceSend(audioBlob, duration)
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
      setDuration(0)

      // Timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Lỗi khi ghi âm:', error)
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop())
    setIsRecording(false)
    clearInterval(timerRef.current)
  }

  return (
    <div className="voice-recorder">
      {isRecording ? (
        <>
          <span>Đang ghi: {duration}s</span>
          <button onClick={stopRecording}>⏹️ Dừng</button>
        </>
      ) : (
        <button onClick={startRecording}>🎤 Ghi Âm</button>
      )}
    </div>
  )
}
```

### 1.2 Frontend - Voice Message Display

```jsx
// components/VoiceMessage.jsx
export function VoiceMessage({ message }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef(null)

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause()
    } else {
      audioRef.current?.play()
    }
    setIsPlaying(!isPlaying)
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="voice-message">
      <button onClick={togglePlay} className="play-btn">
        {isPlaying ? '⏸️' : '▶️'}
      </button>
      <span className="duration">
        {formatDuration(message.voiceMessage.duration)}
      </span>
      <audio
        ref={audioRef}
        src={message.voiceMessage.url}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  )
}
```

### 1.3 Backend - Voice Message Service

```javascript
// services/MessageService.js
class MessageService {
  async createVoiceMessage(conversationId, senderId, voiceBlob, duration) {
    try {
      // 1. Upload voice file to S3
      const voiceUrl = await S3Service.uploadVoiceMessage(voiceBlob)

      // 2. Create Message record
      const message = {
        messageId: uuidv4(),
        conversationId,
        senderId,
        messageType: 'voice',
        content: `Voice message (${duration}s)`,
        voiceMessage: {
          url: voiceUrl,
          duration,
          mimeType: voiceBlob.type,
          size: voiceBlob.size,
          transcription: null
        },
        status: 'sent',
        createdAt: new Date().toISOString()
      }

      // 3. Save to database
      await MessageRepository.create(message)

      // 4. Update conversation lastMessage
      await ConversationRepository.update(conversationId, {
        lastMessage: message.messageId,
        lastMessageAt: Date.now()
      })

      // 5. Emit socket event
      io.to(conversationId).emit('voice-message-created', message)

      return message
    } catch (error) {
      throw new Error(`Failed to create voice message: ${error.message}`)
    }
  }
}
```

### 1.4 S3Service Update

```javascript
// services/S3Service.js
class S3Service {
  async uploadVoiceMessage(voiceBlob) {
    const key = `voice-messages/${uuidv4()}.mp3`
    
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: voiceBlob,
      ContentType: 'audio/mpeg',
      ServerSideEncryption: 'AES256'
    }

    try {
      await s3Client.send(new PutObjectCommand(params))
      return `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${key}`
    } catch (error) {
      throw new Error(`S3 upload failed: ${error.message}`)
    }
  }
}
```

---

## 2. Audio/Video Call Implementation

### 2.1 New Models

```javascript
// models/CallSession.js
export class CallSession {
  constructor(data = {}) {
    this.callSessionId = data.callSessionId
    this.conversationId = data.conversationId
    this.callType = data.callType // 'audio' or 'video'
    this.initiatorId = data.initiatorId
    this.participants = data.participants || []
    this.status = data.status || 'initiated' // initiated, ringing, ongoing, ended, missed
    this.startedAt = data.startedAt || new Date().toISOString()
    this.endedAt = data.endedAt || null
    this.duration = data.duration || 0
    this.recordingUrl = data.recordingUrl || null
    this.iceServers = data.iceServers || []
    this.createdAt = data.createdAt || new Date().toISOString()
    this.updatedAt = data.updatedAt || new Date().toISOString()
  }

  isActive() {
    return this.status === 'ongoing' || this.status === 'ringing'
  }

  addParticipant(userId) {
    if (!this.participants.find(p => p.userId === userId)) {
      this.participants.push({
        userId,
        status: 'accepted',
        joinedAt: new Date().toISOString(),
        leftAt: null
      })
    }
  }

  removeParticipant(userId) {
    const participant = this.participants.find(p => p.userId === userId)
    if (participant) {
      participant.leftAt = new Date().toISOString()
    }
  }

  endCall() {
    this.status = 'ended'
    this.endedAt = new Date().toISOString()
    this.duration = Math.floor((Date.now() - new Date(this.startedAt)) / 1000)
  }

  toDynamoDB() {
    return {
      callSessionId: this.callSessionId,
      conversationId: this.conversationId,
      callType: this.callType,
      initiatorId: this.initiatorId,
      participants: this.participants,
      status: this.status,
      startedAt: this.startedAt,
      endedAt: this.endedAt,
      duration: this.duration,
      recordingUrl: this.recordingUrl,
      iceServers: this.iceServers,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }

  static fromDynamoDB(data) {
    return new CallSession(data)
  }
}
```

### 2.2 CallService

```javascript
// services/CallService.js
class CallService {
  async initiateCall(conversationId, initiatorId, callType = 'audio') {
    try {
      const callSession = new CallSession({
        callSessionId: uuidv4(),
        conversationId,
        callType,
        initiatorId,
        participants: [{
          userId: initiatorId,
          status: 'ongoing',
          joinedAt: new Date().toISOString()
        }],
        status: 'initiated',
        iceServers: await this.getICEServers()
      })

      await CallSessionRepository.create(callSession)
      return callSession
    } catch (error) {
      throw new Error(`Failed to initiate call: ${error.message}`)
    }
  }

  async acceptCall(callSessionId, userId) {
    try {
      const callSession = await CallSessionRepository.findById(callSessionId)
      callSession.addParticipant(userId)
      callSession.status = 'ongoing'
      
      await CallSessionRepository.update(callSessionId, callSession)
      return callSession
    } catch (error) {
      throw new Error(`Failed to accept call: ${error.message}`)
    }
  }

  async endCall(callSessionId) {
    try {
      const callSession = await CallSessionRepository.findById(callSessionId)
      callSession.endCall()

      // Save call record as message
      const callMessage = {
        messageId: uuidv4(),
        conversationId: callSession.conversationId,
        senderId: callSession.initiatorId,
        messageType: 'call',
        content: `${callSession.callType} call`,
        callData: {
          callType: callSession.callType,
          duration: callSession.duration,
          status: 'ended',
          startedAt: callSession.startedAt,
          endedAt: callSession.endedAt,
          callerId: callSession.initiatorId,
          participantIds: callSession.participants.map(p => p.userId)
        },
        createdAt: new Date().toISOString()
      }

      await MessageRepository.create(callMessage)
      await CallSessionRepository.update(callSessionId, callSession)

      return callSession
    } catch (error) {
      throw new Error(`Failed to end call: ${error.message}`)
    }
  }

  async getICEServers() {
    // Return TURN/STUN servers
    return [
      {
        urls: ['stun:stun.l.google.com:19302'],
        username: '',
        credential: ''
      },
      {
        urls: ['turn:your-turn-server.com:3478'],
        username: 'username',
        credential: 'password'
      }
    ]
  }
}
```

### 2.3 Frontend - Call Component

```jsx
// components/CallWindow.jsx
import React, { useEffect, useRef, useState } from 'react'

export function CallWindow({ callSession, onEndCall }) {
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const peerConnectionRef = useRef(null)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    startCall()
    const timer = setInterval(() => {
      setDuration(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const startCall = async () => {
    try {
      // Get local media stream
      const localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callSession.callType === 'video'
      })

      localVideoRef.current.srcObject = localStream

      // Initialize WebRTC
      const peerConnection = new RTCPeerConnection({
        iceServers: callSession.iceServers
      })

      // Add local tracks
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream)
      })

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        remoteVideoRef.current.srcObject = event.streams[0]
      }

      peerConnectionRef.current = peerConnection
    } catch (error) {
      console.error('Error starting call:', error)
    }
  }

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="call-window">
      <div className="video-container">
        {callSession.callType === 'video' && (
          <>
            <video ref={remoteVideoRef} autoPlay playsInline />
            <video ref={localVideoRef} autoPlay playsInline muted />
          </>
        )}
      </div>

      <div className="call-info">
        <span className="duration">{formatDuration(duration)}</span>
        <span className="participants">
          {callSession.participants.length} participant(s)
        </span>
      </div>

      <div className="call-actions">
        <button onClick={() => onEndCall()} className="end-call-btn">
          ❌ Kết Thúc Cuộc Gọi
        </button>
      </div>
    </div>
  )
}
```

### 2.4 Socket Handlers Update

```javascript
// socket/handlers.js
export function setupCallHandlers(io, socket) {
  socket.on('call-initiate', async (data) => {
    const { conversationId, initiatorId, callType } = data
    
    const callSession = await CallService.initiateCall(
      conversationId,
      initiatorId,
      callType
    )

    // Send to all participants
    io.to(conversationId).emit('incoming-call', {
      callSessionId: callSession.callSessionId,
      caller: initiatorId,
      callType: callSession.callType
    })
  })

  socket.on('call-accept', async (data) => {
    const { callSessionId, userId } = data
    const callSession = await CallService.acceptCall(callSessionId, userId)
    
    io.to(callSession.conversationId).emit('call-accepted', callSession)
  })

  socket.on('webrtc-offer', (data) => {
    socket.to(data.recipientId).emit('webrtc-offer', {
      offer: data.offer,
      senderId: socket.id
    })
  })

  socket.on('webrtc-answer', (data) => {
    socket.to(data.recipientId).emit('webrtc-answer', {
      answer: data.answer,
      senderId: socket.id
    })
  })

  socket.on('ice-candidate', (data) => {
    socket.to(data.recipientId).emit('ice-candidate', {
      candidate: data.candidate,
      senderId: socket.id
    })
  })

  socket.on('call-end', async (data) => {
    const { callSessionId } = data
    const callSession = await CallService.endCall(callSessionId)
    
    io.to(callSession.conversationId).emit('call-ended', callSession)
  })
}
```

---

## 3. Database Updates

### Migration Script

```javascript
// scripts/migrateToCallSupport.js
import { docClient } from '../src/db/dynamodb.js'
import { CreateTableCommand } from '@aws-sdk/client-dynamodb'

async function createCallSessionsTable() {
  const params = {
    TableName: 'tixchat-callsessions',
    AttributeDefinitions: [
      { AttributeName: 'callSessionId', AttributeType: 'S' },
      { AttributeName: 'conversationId', AttributeType: 'S' },
      { AttributeName: 'createdAt', AttributeType: 'N' }
    ],
    KeySchema: [
      { AttributeName: 'callSessionId', KeyType: 'HASH' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'conversationId-createdAt-index',
        KeySchema: [
          { AttributeName: 'conversationId', KeyType: 'HASH' },
          { AttributeName: 'createdAt', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    BillingMode: 'PROVISIONED',
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  }

  try {
    await dynamodbClient.send(new CreateTableCommand(params))
    console.log('✅ CallSessions table created')
  } catch (error) {
    console.error('Error creating CallSessions table:', error)
  }
}

createCallSessionsTable()
```

---

## 4. Checklist Implementation

### Phase 1: Voice Message (2-3 ngày)
- [ ] Create VoiceRecorder component
- [ ] Create VoiceMessage display component
- [ ] Update MessageService.js
- [ ] Update S3Service.js
- [ ] Update socket handlers
- [ ] Test voice message send/receive

### Phase 2: Call Infrastructure (3-5 ngày)
- [ ] Create CallSession model
- [ ] Create CallService
- [ ] Create CallSessionRepository
- [ ] Update Message model for callData
- [ ] Setup WebRTC signaling

### Phase 3: Call UI (3-5 ngày)
- [ ] Create CallWindow component
- [ ] Create call notification UI
- [ ] Add call controls (mute, end, etc.)
- [ ] Implement call history
- [ ] Test 1vs1 calls

### Phase 4: Group Calls (3-5 ngày)
- [ ] Implement group call logic
- [ ] Setup SFU/Mesh topology
- [ ] Test group calls
- [ ] Optimize bandwidth

### Phase 5: Testing & Polish (2-3 ngày)
- [ ] Unit tests
- [ ] Integration tests
- [ ] Performance optimization
- [ ] Deployment

---

## 5. Package Dependencies

```bash
# Frontend - Voice & Call
npm install wavesurfer.js          # Voice player visualization
npm install simple-peer            # WebRTC wrapper
npm install twilio                 # Alternative: Use Twilio for calls

# Backend - Call Management
npm install uuid
npm install dotenv

# Audio Processing
npm install audio-processing
```

---

## 6. Environment Variables

```env
# Backend .env
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=ap-southeast-2

# TURN/STUN Servers
TURN_SERVER=turn:your-server.com:3478
TURN_USERNAME=username
TURN_PASSWORD=password

# Twilio (nếu dùng)
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1234567890
```

