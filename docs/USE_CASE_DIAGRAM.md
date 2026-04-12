# 🎭 Use Case Diagram - TixChat

## 1. Overall Use Case Diagram

```
                                    ┌─────────────────────────────────────────────────┐
                                    │                    TIXCHAT SYSTEM               │
                                    │                                                 │
        ┌──────────────┐            │  ┌──────────────────────────────────────────┐  │
        │   New User   │───────────→│  │ Authentication & Registration             │  │
        └──────────────┘            │  │ ┌─────────────────────────────────────┐  │  │
                                    │  │ │ • Register Account                  │  │  │
                                    │  │ │ • Verify Email                      │  │  │
                                    │  │ │ • Confirm OTP                       │  │  │
                                    │  │ │ • Login                             │  │  │
                                    │  │ │ • Forgot Password                   │  │  │
                                    │  │ │ • Reset Password                    │  │  │
                                    │  │ │ • Logout                            │  │  │
                                    │  │ └─────────────────────────────────────┘  │  │
                                    │  └──────────────────────────────────────────┘  │
                                    │                                                 │
        ┌──────────────┐            │  ┌──────────────────────────────────────────┐  │
        │ Existing     │            │  │ User Profile Management                  │  │
        │ User         │───────────→│  │ ┌─────────────────────────────────────┐  │  │
        └──────────────┘            │  │ │ • View Profile                      │  │  │
                                    │  │ │ • Edit Profile                      │  │  │
                                    │  │ │ • Change Avatar                     │  │  │
                                    │  │ │ • Update Bio/Status                 │  │  │
                                    │  │ │ • Change Password                   │  │  │
                                    │  │ │ • Delete Account                    │  │  │
                                    │  │ │ • View Online Status                │  │  │
                                    │  │ └─────────────────────────────────────┘  │  │
                                    │  └──────────────────────────────────────────┘  │
                                    │                                                 │
        ┌──────────────┐            │  ┌──────────────────────────────────────────┐  │
        │   User/Chat  │            │  │ Messaging Features                      │  │
        │   Participant│───────────→│  │ ┌─────────────────────────────────────┐  │  │
        │              │            │  │ │ • Send Message                      │  │  │
        │              │            │  │ │ • Receive Message                   │  │  │
        │              │            │  │ │ • Edit Message                      │  │  │
        │              │            │  │ │ • Delete Message                    │  │  │
        │              │            │  │ │ • Reply to Message                  │  │  │
        │              │            │  │ │ • React with Emoji                  │  │  │
        │              │            │  │ │ • Upload Attachment (Image/File)    │  │  │
        │              │            │  │ │ • Mark as Read                      │  │  │
        │              │            │  │ │ • Message Delivery Status           │  │  │
        │              │            │  │ │ • Search Messages                   │  │  │
        │              │            │  │ • Typing Indicator                    │  │  │
        │              │            │  │ • Online/Offline Status              │  │  │
        │              │            │  │ • Last Seen Timestamp                │  │  │
        │              │            │  │ └─────────────────────────────────────┘  │  │
        │              │            │  └──────────────────────────────────────────┘  │
        │              │            │                                                 │
        │              │            │  ┌──────────────────────────────────────────┐  │
        │              │            │  │ Conversation Management                 │  │
        │              │───────────→│  │ ┌─────────────────────────────────────┐  │  │
        │              │            │  │ │ • Create 1-to-1 Conversation        │  │  │
        │              │            │  │ │ • Create Group Conversation         │  │  │
        │              │            │  │ │ • View Conversation List            │  │  │
        │              │            │  │ │ • View Conversation Details         │  │  │
        │              │            │  │ │ • Add Participant to Group          │  │  │
        │              │            │  │ │ • Remove Participant from Group     │  │  │
        │              │            │  │ │ • Leave Group                       │  │  │
        │              │            │  │ │ • Edit Group Name/Description       │  │  │
        │              │            │  │ │ • Change Group Avatar               │  │  │
        │              │            │  │ │ • Archive Conversation              │  │  │
        │              │            │  │ │ • Delete Conversation               │  │  │
        │              │            │  │ │ • Mute/Unmute Notifications         │  │  │
        │              │            │  │ │ • View Group Members                │  │  │
        │              │            │  │ └─────────────────────────────────────┘  │  │
        │              │            │  └──────────────────────────────────────────┘  │
        │              │            │                                                 │
        │              │            │  ┌──────────────────────────────────────────┐  │
        │              │            │  │ Friend Management                       │  │
        │              │───────────→│  │ ┌─────────────────────────────────────┐  │  │
        │              │            │  │ │ • Search Users                      │  │  │
        │              │            │  │ │ • View User Profile                 │  │  │
        │              │            │  │ │ • Block User                        │  │  │
        │              │            │  │ │ • Unblock User                      │  │  │
        │              │            │  │ │ • View Online Users                 │  │  │
        │              │            │  │ │ • View Friends List                 │  │  │
        │              │            │  │ │ • Start New Chat                    │  │  │
        │              │            │  │ └─────────────────────────────────────┘  │  │
        │              │            │  └──────────────────────────────────────────┘  │
        │              │            │                                                 │
        └──────────────┘            │  ┌──────────────────────────────────────────┐  │
                                    │  │ Group Management (Admin Only)           │  │
        ┌──────────────┐            │  │ ┌─────────────────────────────────────┐  │  │
        │ Group Admin  │───────────→│  │ │ • Promote Member to Admin           │  │  │
        │              │            │  │ │ • Demote Admin to Member            │  │  │
        │              │            │  │ │ • Remove Member                     │  │  │
        │              │            │  │ │ • View Group Statistics             │  │  │
        │              │            │  │ └─────────────────────────────────────┘  │  │
        │              │            │  └──────────────────────────────────────────┘  │
        │              │            │                                                 │
        └──────────────┘            └─────────────────────────────────────────────────┘
```

---

## 2. Authentication & Registration Use Cases

```
                        ┌────────────────────────────────────────┐
                        │   Authentication & Registration         │
                        │                                        │
        ┌──────────────┐│ ┌──────────────────────────────────┐  │
        │   New User   ││ │      (UC-1) Register Account     │  │
        │              ││ │ • Enter email, password, name    │  │
        │              ││ │ • Validate input                 │  │
        │              ││ │ • Check email uniqueness         │  │
        │              ││ │ • Hash password                  │  │
        │              ││ │ • Create user account            │  │
        │              ││ │ • Send verification email        │  │
        │              ││ │ • Return token                   │  │
        └──────────────┘│ └──────────────────────────────────┘  │
                        │                                        │
                        │ ┌──────────────────────────────────┐  │
                        │ │  (UC-2) Verify Email             │  │
                        │ │ • Receive OTP via email          │  │
                        │ │ • Enter OTP                      │  │
                        │ │ • Validate OTP                   │  │
                        │ │ • Mark email as verified         │  │
                        │ │ • Activate account               │  │
                        │ └──────────────────────────────────┘  │
                        │                                        │
        ┌──────────────┐│ ┌──────────────────────────────────┐  │
        │Existing User ││ │  (UC-3) Login                    │  │
        │              ││ │ • Enter email & password         │  │
        │              ││ │ • Validate credentials           │  │
        │              ││ │ • Generate JWT token             │  │
        │              ││ │ • Return access token            │  │
        │              ││ │ • Update online status           │  │
        │              ││ │ • Store session                  │  │
        └──────────────┘│ └──────────────────────────────────┘  │
                        │                                        │
                        │ ┌──────────────────────────────────┐  │
                        │ │  (UC-4) Forgot Password          │  │
                        │ │ • Enter email                    │  │
                        │ │ • Check if user exists           │  │
                        │ │ • Generate reset token           │  │
                        │ │ • Send reset link via email      │  │
                        │ │ • Token expires in 1 hour        │  │
                        │ └──────────────────────────────────┘  │
                        │                                        │
                        │ ┌──────────────────────────────────┐  │
                        │ │  (UC-5) Reset Password           │  │
                        │ │ • Receive reset link             │  │
                        │ │ • Click link (validate token)    │  │
                        │ │ • Enter new password             │  │
                        │ │ • Hash & update password         │  │
                        │ │ • Invalidate reset token         │  │
                        │ │ • Confirm success                │  │
                        │ └──────────────────────────────────┘  │
                        │                                        │
                        │ ┌──────────────────────────────────┐  │
                        │ │  (UC-6) Logout                   │  │
                        │ │ • Clear JWT token                │  │
                        │ │ • Update offline status          │  │
                        │ │ • Clear session                  │  │
                        │ │ • Redirect to login page         │  │
                        │ └──────────────────────────────────┘  │
                        │                                        │
                        └────────────────────────────────────────┘
```

---

## 3. User Profile Management Use Cases

```
                        ┌────────────────────────────────────────┐
                        │  User Profile Management               │
                        │                                        │
        ┌──────────────┐│ ┌──────────────────────────────────┐  │
        │   User       ││ │  (UC-7) View Profile             │  │
        │              ││ │ • Get user data from database    │  │
        │              ││ │ • Display user information       │  │
        │              ││ │ • Show avatar                    │  │
        │              ││ │ • Show bio/status                │  │
        │              ││ │ • Show join date                 │  │
        └──────────────┘│ └──────────────────────────────────┘  │
                        │                                        │
                        │ ┌──────────────────────────────────┐  │
                        │ │  (UC-8) Edit Profile             │  │
                        │ │ • Update fullName                │  │
                        │ │ • Update bio (max 500 chars)     │  │
                        │ │ • Validate input                 │  │
                        │ │ • Save changes to database       │  │
                        │ │ • Broadcast update via Socket.IO │  │
                        │ └──────────────────────────────────┘  │
                        │                                        │
                        │ ┌──────────────────────────────────┐  │
                        │ │  (UC-9) Change Avatar            │  │
                        │ │ • Select image file              │  │
                        │ │ • Validate file (image only)     │  │
                        │ │ • Upload to AWS S3               │  │
                        │ │ • Get S3 URL                     │  │
                        │ │ • Update user avatar URL         │  │
                        │ │ • Broadcast change to others     │  │
                        │ └──────────────────────────────────┘  │
                        │                                        │
                        │ ┌──────────────────────────────────┐  │
                        │ │  (UC-10) Change Password         │  │
                        │ │ • Enter current password         │  │
                        │ │ • Verify current password        │  │
                        │ │ • Enter new password             │  │
                        │ │ • Validate new password          │  │
                        │ │ • Hash new password              │  │
                        │ │ • Update in database             │  │
                        │ │ • Logout all sessions            │  │
                        │ └──────────────────────────────────┘  │
                        │                                        │
                        │ ┌──────────────────────────────────┐  │
                        │ │  (UC-11) Delete Account          │  │
                        │ │ • Request confirmation           │  │
                        │ │ • Verify password                │  │
                        │ │ • Delete all user data           │  │
                        │ │ • Delete all conversations       │  │
                        │ │ • Delete all messages            │  │
                        │ │ • Delete avatar from S3          │  │
                        │ │ • Logout all sessions            │  │
                        │ └──────────────────────────────────┘  │
                        │                                        │
                        └────────────────────────────────────────┘
```

---

## 4. Messaging Features Use Cases

```
                        ┌────────────────────────────────────────────────────┐
                        │          Messaging Features                        │
                        │                                                    │
        ┌──────────────┐│ ┌──────────────────────────────────────────────┐  │
        │   User/      ││ │  (UC-12) Send Message                        │  │
        │ Participant  ││ │ • Type message content                       │  │
        │              ││ │ • Validate message (not empty, max 5000)     │  │
        │              ││ │ • Emit socket.emit('message:send')           │  │
        │              ││ │ • Create message in database                 │  │
        │              ││ │ • Update conversation lastMessage            │  │
        │              ││ │ • Broadcast to conversation room             │  │
        │              ││ │ • Update UI in real-time                     │  │
        │              ││ │ • Set status to 'sent'                       │  │
        └──────────────┘│ └──────────────────────────────────────────────┘  │
                        │                                                    │
                        │ ┌──────────────────────────────────────────────┐  │
                        │ │  (UC-13) Receive Message                     │  │
                        │ │ • Listen to 'message:sent' socket event      │  │
                        │ │ • Add message to local chat                  │  │
                        │ │ • Play notification sound                    │  │
                        │ │ • Show notification badge                    │  │
                        │ │ • Auto-mark as delivered                     │  │
                        │ │ • Update UI                                  │  │
                        │ │ • Increment unread count                     │  │
                        │ └──────────────────────────────────────────────┘  │
                        │                                                    │
                        │ ┌──────────────────────────────────────────────┐  │
                        │ │  (UC-14) Edit Message                        │  │
                        │ │ • Select message to edit                     │  │
                        │ │ • Change message content                     │  │
                        │ │ • Validate new content                       │  │
                        │ │ • Update message in database                 │  │
                        │ │ • Set isEdited = true                        │  │
                        │ │ • Record editedAt timestamp                  │  │
                        │ │ • Broadcast edited message                   │  │
                        │ │ • Show "edited" indicator in UI              │  │
                        │ └──────────────────────────────────────────────┘  │
                        │                                                    │
                        │ ┌──────────────────────────────────────────────┐  │
                        │ │  (UC-15) Delete Message                      │  │
                        │ │ • Select message to delete                   │  │
                        │ │ • Verify ownership                           │  │
                        │ │ • Request confirmation                       │  │
                        │ │ • Set isDeleted = true                       │  │
                        │ │ • Record deletedAt timestamp                 │  │
                        │ │ • Keep record for audit trail                │  │
                        │ │ • Broadcast deletion                         │  │
                        │ │ • Hide message in UI                         │  │
                        │ └──────────────────────────────────────────────┘  │
                        │                                                    │
                        │ ┌──────────────────────────────────────────────┐  │
                        │ │  (UC-16) Reply to Message                    │  │
                        │ │ • Select message to reply                    │  │
                        │ │ • Show quoted message                        │  │
                        │ │ • Type reply content                         │  │
                        │ │ • Set replyTo = messageId                    │  │
                        │ │ • Create message with reference              │  │
                        │ │ • Display as threaded reply                  │  │
                        │ │ • Highlight original message                 │  │
                        │ └──────────────────────────────────────────────┘  │
                        │                                                    │
                        │ ┌──────────────────────────────────────────────┐  │
                        │ │  (UC-17) React with Emoji                    │  │
                        │ │ • Click emoji reaction button                │  │
                        │ │ • Select emoji from picker                   │  │
                        │ │ • Add emoji to message.emoji array           │  │
                        │ │ • Track user who reacted                     │  │
                        │ │ • Allow multiple reactions per user          │  │
                        │ │ • Broadcast emoji reaction                   │  │
                        │ │ • Show emoji count below message             │  │
                        │ └──────────────────────────────────────────────┘  │
                        │                                                    │
                        │ ┌──────────────────────────────────────────────┐  │
                        │ │  (UC-18) Upload Attachment                   │  │
                        │ │ • Select file from device                    │  │
                        │ │ • Validate file (size, type)                 │  │
                        │ │ • Show upload progress                       │  │
                        │ │ • Upload to AWS S3                           │  │
                        │ │ • Get S3 URL                                 │  │
                        │ │ • Create message with attachment             │  │
                        │ │ • Store metadata (size, name, type)          │  │
                        │ │ • Display thumbnail in chat                  │  │
                        │ └──────────────────────────────────────────────┘  │
                        │                                                    │
                        │ ┌──────────────────────────────────────────────┐  │
                        │ │  (UC-19) Mark as Read                        │  │
                        │ │ • Open message                               │  │
                        │ │ • Emit 'message:read' event                  │  │
                        │ │ • Add userId to seenBy array                 │  │
                        │ │ • Update message status to 'seen'            │  │
                        │ │ • Record read timestamp                      │  │
                        │ │ • Show read receipts                         │  │
                        │ │ • Update lastReadAt in Participant           │  │
                        │ └──────────────────────────────────────────────┘  │
                        │                                                    │
                        │ ┌──────────────────────────────────────────────┐  │
                        │ │  (UC-20) Message Delivery Status             │  │
                        │ │ • Track message lifecycle:                   │  │
                        │ │   - sent: Created & stored                   │  │
                        │ │   - delivered: Received by client            │  │
                        │ │   - seen: Read by recipient                  │  │
                        │ │ • Show status indicator (✓✓✓)                │  │
                        │ │ • Update in real-time                        │  │
                        │ │ • Store in database                          │  │
                        │ └──────────────────────────────────────────────┘  │
                        │                                                    │
                        │ ┌──────────────────────────────────────────────┐  │
                        │ │  (UC-21) Search Messages                     │  │
                        │ │ • Enter search keyword                       │  │
                        │ │ • Search by content in conversation          │  │
                        │ │ • Filter by date range                       │  │
                        │ │ • Display search results                     │  │
                        │ │ • Highlight matched text                     │  │
                        │ │ • Click to jump to message                   │  │
                        │ └──────────────────────────────────────────────┘  │
                        │                                                    │
                        │ ┌──────────────────────────────────────────────┐  │
                        │ │  (UC-22) Typing Indicator                    │  │
                        │ │ • Start typing in message box                │  │
                        │ │ • Emit 'user:typing' socket event            │  │
                        │ │ • Broadcast to others in conversation        │  │
                        │ │ • Show "User is typing..." indicator         │  │
                        │ │ • Auto-clear after 3 seconds of no input     │  │
                        │ │ • Emit 'user:stopped_typing' event           │  │
                        │ │ • Hide typing indicator                      │  │
                        │ └──────────────────────────────────────────────┘  │
                        │                                                    │
                        │ ┌──────────────────────────────────────────────┐  │
                        │ │  (UC-23) Online/Offline Status               │  │
                        │ │ • On login: set isOnline = true              │  │
                        │ │ • Emit 'user:online' event                   │  │
                        │ │ • Show green indicator next to name          │  │
                        │ │ • On logout: set isOnline = false            │  │
                        │ │ • Emit 'user:offline' event                  │  │
                        │ │ • Update lastSeen timestamp                  │  │
                        │ │ • Broadcast to all connected users           │  │
                        │ └──────────────────────────────────────────────┘  │
                        │                                                    │
                        │ ┌──────────────────────────────────────────────┐  │
                        │ │  (UC-24) Last Seen Timestamp                 │  │
                        │ │ • Track last activity time                   │  │
                        │ │ • Update lastSeen on logout                  │  │
                        │ │ • Display "Last seen at X time"              │  │
                        │ │ • Calculate time difference (now vs last)    │  │
                        │ │ • Show in user profile & chat list           │  │
                        │ │ • Format: "2 hours ago", "Yesterday", etc    │  │
                        │ └──────────────────────────────────────────────┘  │
                        │                                                    │
                        └────────────────────────────────────────────────────┘
```

---

## 5. Conversation Management Use Cases

```
                        ┌────────────────────────────────────────────────────┐
                        │      Conversation Management                       │
                        │                                                    │
        ┌──────────────┐│ ┌──────────────────────────────────────────────┐  │
        │   User/      ││ │  (UC-25) Create 1-to-1 Conversation          │  │
        │ Participant  ││ │ • Search for user to chat with               │  │
        │              ││ │ • Click "Start Chat"                         │  │
        │              ││ │ • Check if conversation already exists       │  │
        │              ││ │ • Create new conversation (type: '1-1')      │  │
        │              ││ │ • Add both users as participants             │  │
        │              ││ │ • Open chat window                           │  │
        │              ││ │ • Set focus on message input                 │  │
        └──────────────┘│ └──────────────────────────────────────────────┘  │
                        │                                                    │
                        │ ┌──────────────────────────────────────────────┐  │
                        │ │  (UC-26) Create Group Conversation           │  │
                        │ │ • Click "Create Group"                       │  │
                        │ │ • Enter group name                           │  │
                        │ │ • Enter group description (optional)         │  │
                        │ │ • Select group avatar (optional)             │  │
                        │ │ • Add initial members                        │  │
                        │ │ • Create conversation (type: 'group')        │  │
                        │ │ • Set creator as admin                       │  │
                        │ │ • Add all selected users as participants     │  │
                        │ │ • Open group chat                            │  │
                        │ └──────────────────────────────────────────────┘  │
                        │                                                    │
                        │ ┌──────────────────────────────────────────────┐  │
                        │ │  (UC-27) View Conversation List               │  │
                        │ │ • Load all user conversations                │  │
                        │ │ • Sort by lastMessageAt (newest first)       │  │
                        │ │ • Display preview of last message            │  │
                        │ │ • Show unread message count                  │  │
                        │ │ • Show participant avatars                   │  │
                        │ │ • Search in conversation list                │  │
                        │ │ • Refresh in real-time                       │  │
                        │ └──────────────────────────────────────────────┘  │
                        │                                                    │
                        │ ┌──────────────────────────────────────────────┐  │
                        │ │  (UC-28) View Conversation Details            │  │
                        │ │ • Load conversation info                     │  │
                        │ │ • Display group name (if group)              │  │
                        │ │ • Display avatar                             │  │
                        │ │ • Display description (if group)             │  │
                        │ │ • Show list of participants                  │  │
                        │ │ • Show creation date                         │  │
                        │ │ • Load message history                       │  │
                        │ │ • Load with pagination                       │  │
                        │ └──────────────────────────────────────────────┘  │
                        │                                                    │
                        │ ┌──────────────────────────────────────────────┐  │
                        │ │  (UC-29) Add Participant to Group            │  │
                        │ │ • Open group settings                        │  │
                        │ │ • Search for user to add                     │  │
                        │ │ • Check if user already a member             │  │
                        │ │ • Create Participant record                  │  │
                        │ │ • Add to conversation.participants array     │  │
                        │ │ • Broadcast to group members                 │  │
                        │ │ • Show notification "X added Y to group"     │  │
                        │ └──────────────────────────────────────────────┘  │
                        │                                                    │
                        │ ┌──────────────────────────────────────────────┐  │
                        │ │  (UC-30) Remove Participant from Group       │  │
                        │ │ • Open group members list                    │  │
                        │ │ • Select user to remove                      │  │
                        │ │ │ (Admin only)                                │  │
                        │ │ • Request confirmation                       │  │
                        │ │ • Set leftAt timestamp                       │  │
                        │ │ • Remove from participants array             │  │
                        │ │ • Broadcast to group                         │  │
                        │ │ • Show notification "X removed Y"            │  │
                        │ └──────────────────────────────────────────────┘  │
                        │                                                    │
                        │ ┌──────────────────────────────────────────────┐  │
                        │ │  (UC-31) Leave Group                         │  │
                        │ │ • Open group settings                        │  │
                        │ │ • Click "Leave Group"                        │  │
                        │ │ • Request confirmation                       │  │
                        │ │ • Set leftAt timestamp                       │  │
                        │ │ • Remove from participants array             │  │
                        │ │ • Broadcast to group                         │  │
                        │ │ • Show notification "X left the group"       │  │
                        │ │ • Remove conversation from user's list       │  │
                        │ └──────────────────────────────────────────────┘  │
                        │                                                    │
                        │ ┌──────────────────────────────────────────────┐  │
                        │ │  (UC-32) Edit Group Information              │  │
                        │ │ • Open group settings (admin only)           │  │
                        │ │ • Edit group name                           │  │
                        │ │ • Edit group description                    │  │
                        │ │ • Update group avatar                       │  │
                        │ │ • Upload new image to S3 (if changed)       │  │
                        │ │ • Save changes to database                  │  │
                        │ │ • Broadcast updates to group                │  │
                        │ │ • Update UI for all members                 │  │
                        │ └──────────────────────────────────────────────┘  │
                        │                                                    │
                        │ ┌──────────────────────────────────────────────┐  │
                        │ │  (UC-33) Archive Conversation                │  │
                        │ │ • Select conversation                        │  │
                        │ │ • Click "Archive"                            │  │
                        │ │ • Move to archive folder                     │  │
                        │ │ • Set isArchived = true                      │  │
                        │ │ • Keep all messages                          │  │
                        │ │ • Remove from active list                    │  │
                        │ │ • Show in archive view                       │  │
                        │ │ • Can unarchive anytime                      │  │
                        │ └──────────────────────────────────────────────┘  │
                        │                                                    │
                        │ ┌──────────────────────────────────────────────┐  │
                        │ │  (UC-34) Delete Conversation                 │  │
                        │ │ • Select conversation                        │  │
                        │ │ • Click "Delete" / "Clear Chat"              │  │
                        │ │ • Request confirmation                       │  │
                        │ │ • Options:                                   │  │
                        │ │   - Delete for me only                       │  │
                        │ │   - Delete for everyone (group admin)        │  │
                        │ │ • Delete conversation record                 │  │
                        │ │ • Delete all messages                        │  │
                        │ │ • Remove from conversations list             │  │
                        │ │ • Broadcast if delete for everyone           │  │
                        │ └──────────────────────────────────────────────┘  │
                        │                                                    │
                        │ ┌──────────────────────────────────────────────┐  │
                        │ │  (UC-35) Mute/Unmute Notifications           │  │
                        │ │ • Open conversation settings                 │  │
                        │ │ • Toggle "Mute Notifications"                │  │
                        │ │ • Set isMuted = true/false in Participant   │  │
                        │ │ • Stop receiving notifications               │  │
                        │ │ • Messages still appear in chat              │  │
                        │ │ • Conversation still visible                 │  │
                        │ │ • Show mute indicator                        │  │
                        │ └──────────────────────────────────────────────┘  │
                        │                                                    │
                        │ ┌──────────────────────────────────────────────┐  │
                        │ │  (UC-36) View Group Members                  │  │
                        │ │ • Open group info panel                      │  │
                        │ │ • Display all members                        │  │
                        │ │ • Show member details:                       │  │
                        │ │   - Avatar                                   │  │
                        │ │   - Name                                     │  │
                        │ │   - Role (Admin/Member)                      │  │
                        │ │   - Online status                            │  │
                        │ │   - Join date                                │  │
                        │ │ • Admin badge for admins                     │  │
                        │ │ • Click to view profile                      │  │
                        │ └──────────────────────────────────────────────┘  │
                        │                                                    │
                        └────────────────────────────────────────────────────┘
```

---

## 6. Friend Management Use Cases

```
                        ┌────────────────────────────────────────┐
                        │   Friend Management                    │
                        │                                        │
        ┌──────────────┐│ ┌──────────────────────────────────┐  │
        │   User       ││ │  (UC-37) Search Users             │  │
        │              ││ │ • Enter search keyword            │  │
        │              ││ │ • Search by username/email        │  │
        │              ││ │ • Display search results          │  │
        │              ││ │ • Show user avatars               │  │
        │              ││ │ • Show online status              │  │
        │              ││ │ • Click to view profile           │  │
        └──────────────┘│ └──────────────────────────────────┘  │
                        │                                        │
                        │ ┌──────────────────────────────────┐  │
                        │ │  (UC-38) View User Profile        │  │
                        │ │ • Display user information:       │  │
                        │ │   - Avatar                        │  │
                        │ │   - Name                          │  │
                        │ │   - Bio                           │  │
                        │ │   - Online status                 │  │
                        │ │   - Last seen                     │  │
                        │ │   - Join date                     │  │
                        │ │ • Show "Start Chat" button        │  │
                        │ │ • Show "Block" button             │  │
                        │ └──────────────────────────────────┘  │
                        │                                        │
                        │ ┌──────────────────────────────────┐  │
                        │ │  (UC-39) Block User               │  │
                        │ │ • Select user                     │  │
                        │ │ • Click "Block User"              │  │
                        │ │ │ Request confirmation             │  │
                        │ │ • Add to User.blockedUsers array  │  │
                        │ │ • Cannot receive messages         │  │
                        │ │ • Cannot see online status        │  │
                        │ │ • Cannot add to groups            │  │
                        │ │ • Can be unblocked anytime        │  │
                        │ └──────────────────────────────────┘  │
                        │                                        │
                        │ ┌──────────────────────────────────┐  │
                        │ │  (UC-40) Unblock User             │  │
                        │ │ • Go to blocked users list        │  │
                        │ │ • Select user to unblock          │  │
                        │ │ • Click "Unblock"                 │  │
                        │ │ • Remove from blockedUsers array  │  │
                        │ │ • Can receive messages again      │  │
                        │ │ • Can see online status           │  │
                        │ │ • Can be added to groups          │  │
                        │ └──────────────────────────────────┘  │
                        │                                        │
                        │ ┌──────────────────────────────────┐  │
                        │ │  (UC-41) View Online Users        │  │
                        │ │ • Load all users with:            │  │
                        │ │   isOnline = true                 │  │
                        │ │ • Display with green indicator    │  │
                        │ │ • Sort alphabetically             │  │
                        │ │ • Refresh in real-time            │  │
                        │ │ • Click to chat                   │  │
                        │ │ • Quick search in list            │  │
                        │ └──────────────────────────────────┘  │
                        │                                        │
                        │ ┌──────────────────────────────────┐  │
                        │ │  (UC-42) View Friends List        │  │
                        │ │ • Load User.friends array         │  │
                        │ │ • Display friend avatars          │  │
                        │ │ • Show online status              │  │
                        │ │ • Sort by: online first, then A-Z│  │
                        │ │ • Show last seen time             │  │
                        │ │ • Click to view profile           │  │
                        │ │ • Click to start chat             │  │
                        │ └──────────────────────────────────┘  │
                        │                                        │
                        │ ┌──────────────────────────────────┐  │
                        │ │  (UC-43) Start New Chat           │  │
                        │ │ • Click "New Chat" / "+"          │  │
                        │ │ • Search for user                 │  │
                        │ │ • Select user from list           │  │
                        │ │ • Create or get conversation      │  │
                        │ │ • Open chat window                │  │
                        │ │ • Focus on message input          │  │
                        │ │ • Load message history            │  │
                        │ └──────────────────────────────────┘  │
                        │                                        │
                        └────────────────────────────────────────┘
```

---

## 7. Group Management (Admin Only) Use Cases

```
                        ┌────────────────────────────────────────┐
                        │  Group Management (Admin Only)         │
                        │                                        │
        ┌──────────────┐│ ┌──────────────────────────────────┐  │
        │ Group Admin  ││ │  (UC-44) Promote Member to Admin  │  │
        │              ││ │ • Open group settings             │  │
        │              ││ │ • View group members              │  │
        │              ││ │ • Select member to promote        │  │
        │              ││ │ • Click "Promote to Admin"        │  │
        │              ││ │ • Update participant.role         │  │
        │              ││ │ • Grant admin privileges          │  │
        │              ││ │ • Broadcast to group              │  │
        │              ││ │ • Show notification               │  │
        └──────────────┘│ └──────────────────────────────────┘  │
                        │                                        │
                        │ ┌──────────────────────────────────┐  │
                        │ │  (UC-45) Demote Admin to Member   │  │
                        │ │ • Open group settings             │  │
                        │ │ • Select admin to demote          │  │
                        │ │ • Click "Demote to Member"        │  │
                        │ │ • Update participant.role         │  │
                        │ │ • Remove admin privileges         │  │
                        │ │ • Keep conversation access        │  │
                        │ │ • Broadcast to group              │  │
                        │ │ • Show notification               │  │
                        │ └──────────────────────────────────┘  │
                        │                                        │
                        │ ┌──────────────────────────────────┐  │
                        │ │  (UC-46) Remove Member            │  │
                        │ │ • Open group members list         │  │
                        │ │ • Select member to remove         │  │
                        │ │ • Click "Remove Member"           │  │
                        │ │ • Request confirmation            │  │
                        │ │ • Remove from participants        │  │
                        │ │ • Block messages to user          │  │
                        │ │ • Broadcast removal               │  │
                        │ │ • Show notification in group      │  │
                        │ └──────────────────────────────────┘  │
                        │                                        │
                        │ ┌──────────────────────────────────┐  │
                        │ │  (UC-47) View Group Statistics    │  │
                        │ │ • Load group info dashboard       │  │
                        │ │ • Show total members              │  │
                        │ │ • Show total messages             │  │
                        │ │ • Show creation date              │  │
                        │ │ • Show last message time          │  │
                        │ │ • Show members list with stats    │  │
                        │ │ • Show most active members        │  │
                        │ │ • Export statistics (optional)    │  │
                        │ └──────────────────────────────────┘  │
                        │                                        │
                        └────────────────────────────────────────┘
```

---

## 8. Use Case Priority & Complexity Matrix

```
┌──────────────────────────────────────────────────────────────────┐
│                   Complexity vs Priority Matrix                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  HIGH PRIORITY, LOW COMPLEXITY (Quick Wins)                     │
│  ├── UC-1: Register Account            [Easy]  [Critical]       │
│  ├── UC-3: Login                       [Easy]  [Critical]       │
│  ├── UC-6: Logout                      [Easy]  [Critical]       │
│  ├── UC-12: Send Message               [Easy]  [Critical]       │
│  ├── UC-13: Receive Message            [Easy]  [Critical]       │
│  ├── UC-25: Create 1-to-1 Conversation [Easy]  [Critical]       │
│  └── UC-27: View Conversation List     [Easy]  [Critical]       │
│                                                                  │
│  HIGH PRIORITY, HIGH COMPLEXITY (Core Features)                 │
│  ├── UC-2: Verify Email                [Medium] [Important]     │
│  ├── UC-19: Mark as Read               [Medium] [Important]     │
│  ├── UC-20: Message Delivery Status    [Medium] [Important]     │
│  ├── UC-22: Typing Indicator           [Medium] [Important]     │
│  ├── UC-23: Online/Offline Status      [Medium] [Important]     │
│  ├── UC-26: Create Group Conversation  [High]   [Important]     │
│  ├── UC-29: Add Participant to Group   [High]   [Important]     │
│  ├── UC-32: Edit Group Information     [Medium] [Important]     │
│  └── UC-36: View Group Members         [Medium] [Important]     │
│                                                                  │
│  MEDIUM PRIORITY, MEDIUM COMPLEXITY (Enhancements)              │
│  ├── UC-8: Edit Profile                [Easy]   [Nice-to-have]  │
│  ├── UC-9: Change Avatar               [Medium] [Nice-to-have]  │
│  ├── UC-14: Edit Message               [Medium] [Nice-to-have]  │
│  ├── UC-15: Delete Message             [Easy]   [Nice-to-have]  │
│  ├── UC-16: Reply to Message           [Medium] [Nice-to-have]  │
│  ├── UC-17: React with Emoji           [Medium] [Nice-to-have]  │
│  ├── UC-18: Upload Attachment          [High]   [Nice-to-have]  │
│  ├── UC-21: Search Messages            [Medium] [Nice-to-have]  │
│  ├── UC-35: Mute/Unmute Notifications  [Easy]   [Nice-to-have]  │
│  └── UC-37: Search Users               [Easy]   [Nice-to-have]  │
│                                                                  │
│  LOW PRIORITY, LOW COMPLEXITY (Additional Features)             │
│  ├── UC-24: Last Seen Timestamp        [Easy]   [Optional]      │
│  ├── UC-31: Leave Group                [Easy]   [Optional]      │
│  ├── UC-39: Block User                 [Easy]   [Optional]      │
│  ├── UC-40: Unblock User               [Easy]   [Optional]      │
│  └── UC-43: Start New Chat             [Easy]   [Optional]      │
│                                                                  │
│  LOW PRIORITY, HIGH COMPLEXITY (Future Features)                │
│  ├── UC-4: Forgot Password             [High]   [Future]        │
│  ├── UC-5: Reset Password              [High]   [Future]        │
│  ├── UC-10: Change Password            [Medium] [Future]        │
│  ├── UC-11: Delete Account             [High]   [Future]        │
│  ├── UC-28: View Conversation Details  [Medium] [Future]        │
│  ├── UC-30: Remove Participant         [Medium] [Future]        │
│  ├── UC-33: Archive Conversation       [Easy]   [Future]        │
│  ├── UC-34: Delete Conversation        [Medium] [Future]        │
│  ├── UC-38: View User Profile          [Easy]   [Future]        │
│  ├── UC-41: View Online Users          [Easy]   [Future]        │
│  ├── UC-42: View Friends List          [Easy]   [Future]        │
│  ├── UC-44: Promote Member to Admin    [Easy]   [Future]        │
│  ├── UC-45: Demote Admin to Member     [Easy]   [Future]        │
│  ├── UC-46: Remove Member              [Medium] [Future]        │
│  └── UC-47: View Group Statistics      [Medium] [Future]        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 9. Actor & System Interaction

```
┌────────────────────────────────────────────────────────────┐
│              Actor vs System Interactions                  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ ACTOR: New User                                           │
│ ├─→ UC-1: Register Account                               │
│ ├─→ UC-2: Verify Email                                   │
│ └─→ UC-3: Login                                          │
│                                                            │
│ ACTOR: Existing User                                      │
│ ├─→ UC-3: Login                                          │
│ ├─→ UC-7: View Profile                                   │
│ ├─→ UC-8: Edit Profile                                   │
│ ├─→ UC-9: Change Avatar                                  │
│ ├─→ UC-12: Send Message                                  │
│ ├─→ UC-13: Receive Message                               │
│ └─→ UC-6: Logout                                         │
│                                                            │
│ ACTOR: Chat Participant                                   │
│ ├─→ UC-12: Send Message                                  │
│ ├─→ UC-13: Receive Message                               │
│ ├─→ UC-14: Edit Message                                  │
│ ├─→ UC-15: Delete Message                                │
│ ├─→ UC-16: Reply to Message                              │
│ ├─→ UC-17: React with Emoji                              │
│ ├─→ UC-18: Upload Attachment                             │
│ ├─→ UC-19: Mark as Read                                  │
│ ├─→ UC-20: Message Delivery Status                       │
│ ├─→ UC-22: Typing Indicator                              │
│ ├─→ UC-23: Online/Offline Status                         │
│ └─→ UC-24: Last Seen Timestamp                           │
│                                                            │
│ ACTOR: Conversation Manager                              │
│ ├─→ UC-25: Create 1-to-1 Conversation                    │
│ ├─→ UC-26: Create Group Conversation                     │
│ ├─→ UC-27: View Conversation List                        │
│ ├─→ UC-28: View Conversation Details                     │
│ ├─→ UC-31: Leave Group                                   │
│ ├─→ UC-33: Archive Conversation                          │
│ ├─→ UC-35: Mute/Unmute Notifications                     │
│ └─→ UC-34: Delete Conversation                           │
│                                                            │
│ ACTOR: Friend Manager                                     │
│ ├─→ UC-37: Search Users                                  │
│ ├─→ UC-38: View User Profile                             │
│ ├─→ UC-39: Block User                                    │
│ ├─→ UC-40: Unblock User                                  │
│ ├─→ UC-41: View Online Users                             │
│ ├─→ UC-42: View Friends List                             │
│ └─→ UC-43: Start New Chat                                │
│                                                            │
│ ACTOR: Group Admin                                        │
│ ├─→ UC-29: Add Participant to Group                      │
│ ├─→ UC-30: Remove Participant from Group                 │
│ ├─→ UC-32: Edit Group Information                        │
│ ├─→ UC-36: View Group Members                            │
│ ├─→ UC-44: Promote Member to Admin                       │
│ ├─→ UC-45: Demote Admin to Member                        │
│ ├─→ UC-46: Remove Member                                 │
│ └─→ UC-47: View Group Statistics                         │
│                                                            │
│ ACTOR: System                                             │
│ ├─→ Send Email Notifications                             │
│ ├─→ Store Messages in Database                           │
│ ├─→ Handle WebSocket Events                              │
│ ├─→ Broadcast to Connected Clients                       │
│ ├─→ Generate JWT Tokens                                  │
│ ├─→ Upload Files to S3                                   │
│ └─→ Send Push Notifications                              │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 10. Use Case Dependencies & Flow

```
┌──────────────────────────────────────────────────────────────┐
│           Sequential Use Case Dependencies                   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ Authentication Flow:                                        │
│  UC-1 (Register) → UC-2 (Verify Email) → UC-3 (Login)     │
│        ↓            ↓                       ↓              │
│      Create        Send OTP            Generate JWT        │
│      User          via Email           Return Token        │
│        ↓            ↓                       ↓              │
│   [Database]    [Email Service]        [Redis Cache]       │
│                                                              │
│ Password Reset Flow:                                        │
│  UC-4 (Forgot) → UC-5 (Reset) → UC-3 (Login)             │
│        ↓           ↓               ↓                       │
│     Send Link    Hash Password   New Session              │
│     via Email    Update DB       Start Fresh              │
│                                                              │
│ Profile Management Flow:                                    │
│  UC-7 (View) → UC-8 (Edit) → UC-9 (Avatar)               │
│        ↓          ↓             ↓                          │
│    Get Data   Validate       Upload S3                    │
│              Update DB       Update User                  │
│                                                              │
│ Messaging Flow:                                             │
│  UC-25 (Create Conv) → UC-12 (Send) → UC-13 (Receive)    │
│         ↓                  ↓              ↓               │
│    Create Conv       Emit Socket.IO   Listen Event        │
│    Add Participants  Store Message    Update UI           │
│         ↓                  ↓              ↓               │
│    [Database]         [MongoDB]     [WebSocket]           │
│         ↓                  ↓              ↓               │
│    UC-19 (Mark Read) ← UC-20 (Status) → UC-22 (Typing)  │
│                                                              │
│ Group Management Flow:                                      │
│  UC-26 (Create) → UC-36 (View Members) → UC-29 (Add)     │
│        ↓                  ↓                  ↓            │
│   Create Group      Get Participants    Create Participant│
│   Set Admin         Display in UI       Broadcast Event   │
│        ↓                  ↓                  ↓            │
│   UC-32 (Edit) → UC-44 (Promote) → UC-46 (Remove)       │
│                                                              │
│ Friend Management Flow:                                     │
│  UC-37 (Search) → UC-38 (View) → UC-39 (Block)           │
│        ↓               ↓             ↓                     │
│   Query Users    Load Profile   Add to blockedUsers       │
│   Filter Results Display Info   Update Database           │
│        ↓               ↓             ↓                     │
│   UC-41 (Online) ← UC-42 (Friends) → UC-43 (Chat)       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 11. Use Case Preconditions & Postconditions

```
┌─────────────────────────────────────────────────────────────────┐
│              Use Case Pre & Post Conditions                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ UC-12: Send Message                                            │
│ ┌─────────────────────────────────────────────────────────┐    │
│ │ Preconditions:                                          │    │
│ │ ✓ User is authenticated                                │    │
│ │ ✓ User is in a conversation                            │    │
│ │ ✓ User is a participant of the conversation            │    │
│ │ ✓ Conversation is not archived                         │    │
│ │ ✓ User is not blocked by recipient (for 1-1)          │    │
│ │                                                         │    │
│ │ Postconditions:                                         │    │
│ │ ✓ Message is created in database                       │    │
│ │ ✓ Message status is 'sent'                             │    │
│ │ ✓ Conversation.lastMessage is updated                  │    │
│ │ ✓ WebSocket event is broadcasted to all participants   │    │
│ │ ✓ All clients receive message in real-time             │    │
│ │ ✓ Notification is sent to participants (if enabled)    │    │
│ └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│ UC-26: Create Group Conversation                               │
│ ┌─────────────────────────────────────────────────────────┐    │
│ │ Preconditions:                                          │    │
│ │ ✓ User is authenticated                                │    │
│ │ ✓ User has selected at least 2 other members           │    │
│ │ ✓ Group name is provided (3-50 chars)                  │    │
│ │ ✓ Selected members are not blocked by user             │    │
│ │                                                         │    │
│ │ Postconditions:                                         │    │
│ │ ✓ Conversation is created (type = 'group')             │    │
│ │ ✓ User is set as admin                                 │    │
│ │ ✓ All members are added to participants                │    │
│ │ ✓ Conversation appears in all members' lists           │    │
│ │ ✓ System notification is shown in group                │    │
│ │ ✓ Group can now receive messages                       │    │
│ └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│ UC-19: Mark as Read                                            │
│ ┌─────────────────────────────────────────────────────────┐    │
│ │ Preconditions:                                          │    │
│ │ ✓ User is authenticated                                │    │
│ │ ✓ Message exists in database                           │    │
│ │ ✓ User is a participant of the conversation            │    │
│ │ ✓ User is not the message sender                       │    │
│ │ ✓ Message status is 'sent' or 'delivered'              │    │
│ │                                                         │    │
│ │ Postconditions:                                         │    │
│ │ ✓ Message status is updated to 'seen'                  │    │
│ │ ✓ User ID is added to message.seenBy array             │    │
│ │ ✓ Read timestamp is recorded                           │    │
│ │ ✓ Participant.lastReadAt is updated                    │    │
│ │ ✓ Sender receives 'message:read' notification          │    │
│ │ ✓ Read receipt appears in sender's UI (✓✓)            │    │
│ └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│ UC-29: Add Participant to Group                                │
│ ┌─────────────────────────────────────────────────────────┐    │
│ │ Preconditions:                                          │    │
│ │ ✓ User is authenticated                                │    │
│ │ ✓ User is admin of the group                           │    │
│ │ ✓ Conversation type is 'group'                         │    │
│ │ ✓ Target user is not already a member                  │    │
│ │ ✓ Target user is not blocked by admin                  │    │
│ │                                                         │    │
│ │ Postconditions:                                         │    │
│ │ ✓ New Participant record is created                    │    │
│ │ ✓ User ID is added to conversation.participants        │    │
│ │ ✓ New member receives group notification               │    │
│ │ ✓ All members see new member join message              │    │
│ │ ✓ New member can see message history (if enabled)      │    │
│ │ ✓ New member can send messages                         │    │
│ └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│ UC-39: Block User                                              │
│ ┌─────────────────────────────────────────────────────────┐    │
│ │ Preconditions:                                          │    │
│ │ ✓ User is authenticated                                │    │
│ │ ✓ Target user exists                                   │    │
│ │ ✓ Target user is not already blocked                   │    │
│ │ ✓ Cannot block self                                    │    │
│ │                                                         │    │
│ │ Postconditions:                                         │    │
│ │ ✓ User ID is added to User.blockedUsers array          │    │
│ │ ✓ Blocked user cannot send messages                    │    │
│ │ ✓ Blocked user cannot add to groups                    │    │
│ │ ✓ Conversation with blocked user is archived           │    │
│ │ ✓ User cannot see blocked user's online status         │    │
│ │ ✓ Blocked user is not aware of being blocked           │    │
│ └─────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 12. Summary Table: All 47 Use Cases

```
┌───────────────────────────────────────────────────────────────────────┐
│               Summary: 47 Use Cases Organized by Category             │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ AUTHENTICATION (6 UC)                    MESSAGING (13 UC)           │
│ ├─ UC-1: Register Account               ├─ UC-12: Send Message      │
│ ├─ UC-2: Verify Email                   ├─ UC-13: Receive Message   │
│ ├─ UC-3: Login                          ├─ UC-14: Edit Message      │
│ ├─ UC-4: Forgot Password                ├─ UC-15: Delete Message    │
│ ├─ UC-5: Reset Password                 ├─ UC-16: Reply to Message  │
│ └─ UC-6: Logout                         ├─ UC-17: React with Emoji  │
│                                         ├─ UC-18: Upload Attachment │
│ PROFILE MANAGEMENT (5 UC)                ├─ UC-19: Mark as Read      │
│ ├─ UC-7: View Profile                   ├─ UC-20: Delivery Status   │
│ ├─ UC-8: Edit Profile                   ├─ UC-21: Search Messages   │
│ ├─ UC-9: Change Avatar                  ├─ UC-22: Typing Indicator  │
│ ├─ UC-10: Change Password               ├─ UC-23: Online/Offline    │
│ └─ UC-11: Delete Account                └─ UC-24: Last Seen Time    │
│                                                                       │
│ CONVERSATION MGMT (12 UC)                FRIEND MGMT (7 UC)          │
│ ├─ UC-25: Create 1-to-1 Conv            ├─ UC-37: Search Users      │
│ ├─ UC-26: Create Group Conv             ├─ UC-38: View User Profile │
│ ├─ UC-27: View Conv List                ├─ UC-39: Block User        │
│ ├─ UC-28: View Conv Details             ├─ UC-40: Unblock User      │
│ ├─ UC-29: Add Participant               ├─ UC-41: View Online Users │
│ ├─ UC-30: Remove Participant            ├─ UC-42: View Friends List │
│ ├─ UC-31: Leave Group                   └─ UC-43: Start New Chat    │
│ ├─ UC-32: Edit Group Info                                           │
│ ├─ UC-33: Archive Conversation          GROUP ADMIN (4 UC)          │
│ ├─ UC-34: Delete Conversation           ├─ UC-44: Promote to Admin  │
│ ├─ UC-35: Mute/Unmute Notifications     ├─ UC-45: Demote from Admin │
│ └─ UC-36: View Group Members            ├─ UC-46: Remove Member     │
│                                         └─ UC-47: View Statistics   │
│                                                                       │
│ TOTAL: 47 USE CASES                                                 │
│ ├─ Critical Path: 17 UC                                             │
│ ├─ Important: 18 UC                                                 │
│ ├─ Nice-to-have: 10 UC                                              │
│ └─ Future/Optional: 2 UC                                             │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 13. Tổng Kết

**TixChat Use Case Diagram** bao gồm:

✅ **47 Use Cases** chi tiết với mô tả đầy đủ  
✅ **7 Loại Chính**:
- Authentication (6 UC)
- Profile Management (5 UC)
- Messaging (13 UC)
- Conversation Management (12 UC)
- Friend Management (7 UC)
- Group Admin (4 UC)

✅ **Các tính năng cơ bản** của app nhắn tin:
- Real-time messaging
- Message delivery & read receipts
- Typing indicators
- Online/Offline status
- Emoji reactions
- File attachments
- Group conversations
- User search & blocking

✅ **Quan hệ & Dependencies** rõ ràng  
✅ **Preconditions & Postconditions** cho mỗi UC  
✅ **Priority Matrix** để xác định thứ tự phát triển

