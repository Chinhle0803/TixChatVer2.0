import { verifyToken } from '../utils/tokenUtils.js'
import userService from '../services/UserService.js'
import messageService from '../services/MessageService.js'
import { messageEvents, conversationEvents } from '../events/EventBus.js'
import {
  MESSAGE_EVENTS,
  CONVERSATION_EVENTS,
  TYPING_EVENTS,
} from '../events/EventTypes.js'

// Store active socket connections (userId -> socket.id)
const userSockets = new Map()

export const initializeSocketHandlers = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) {
      return next(new Error('Authentication error'))
    }

    const decoded = verifyToken(token, 'access')
    if (!decoded) {
      return next(new Error('Invalid token'))
    }

    socket.userId = decoded.userId
    next()
  })

  io.on('connection', async (socket) => {
    console.log(`✅ User connected: ${socket.userId}`)

    // Store socket connection
    userSockets.set(socket.userId, socket.id)

    // Set user online
    await userService.setOnlineStatus(socket.userId, true)

    // Broadcast user online
    io.emit('user:online', { userId: socket.userId })

    // ==================== MESSAGE EVENTS ====================
    socket.on('send_message', async (data, callback) => {
      try {
        // Ensure socket is in the conversation room
        if (!socket.rooms.has(`conversation:${data.conversationId}`)) {
          socket.join(`conversation:${data.conversationId}`)
          console.log(`🔗 Auto-joined socket to room: conversation:${data.conversationId}`)
        }

        const message = await messageService.sendMessage(
          data.conversationId,
          socket.userId,
          data.content,
          data.replyTo
        )

        // Emit to all participants in conversation (including sender)
        io.to(`conversation:${data.conversationId}`).emit('message:received', {
          message,
        })

        // Send acknowledgment callback to sender
        if (callback && typeof callback === 'function') {
          callback({ success: true, message })
        }
      } catch (err) {
        socket.emit('error', { message: err.message })
        if (callback && typeof callback === 'function') {
          callback({ success: false, error: err.message })
        }
      }
    })

    socket.on('message:delivered', async (data) => {
      try {
        const message = await messageService.markAsDelivered(
          data.messageId,
          socket.userId
        )

        io.to(`conversation:${message.conversationId}`).emit('message:delivered', {
          messageId: data.messageId,
          userId: socket.userId,
        })
      } catch (err) {
        socket.emit('error', { message: err.message })
      }
    })

    socket.on('message:seen', async (data) => {
      try {
        await messageService.markAsSeen(data.conversationId, socket.userId)

        io.to(`conversation:${data.conversationId}`).emit('message:seen', {
          conversationId: data.conversationId,
          userId: socket.userId,
        })
      } catch (err) {
        socket.emit('error', { message: err.message })
      }
    })

    socket.on('message:edit', async (data) => {
      try {
        const message = await messageService.editMessage(
          data.messageId,
          socket.userId,
          data.content
        )

        io.to(`conversation:${message.conversationId}`).emit('message:edited', {
          message,
        })
      } catch (err) {
        socket.emit('error', { message: err.message })
      }
    })

    socket.on('message:delete', async (data) => {
      try {
        const message = await messageService.deleteMessage(
          data.messageId,
          socket.userId
        )

        io.to(`conversation:${message.conversationId}`).emit('message:deleted', {
          messageId: data.messageId,
        })
      } catch (err) {
        socket.emit('error', { message: err.message })
      }
    })

    socket.on('message:emoji', async (data) => {
      try {
        const message = await messageService.addEmoji(
          data.messageId,
          socket.userId,
          data.emoji
        )

        io.to(`conversation:${message.conversationId}`).emit('message:emoji', {
          message,
        })
      } catch (err) {
        socket.emit('error', { message: err.message })
      }
    })

    // ==================== TYPING EVENTS ====================
    socket.on('typing:start', (data) => {
      io.to(`conversation:${data.conversationId}`).emit('typing:start', {
        conversationId: data.conversationId,
        userId: socket.userId,
      })
    })

    socket.on('typing:stop', (data) => {
      io.to(`conversation:${data.conversationId}`).emit('typing:stop', {
        conversationId: data.conversationId,
        userId: socket.userId,
      })
    })

    // ==================== CONVERSATION EVENTS ====================
    socket.on('conversation:join', (data, callback) => {
      const roomName = `conversation:${data.conversationId}`
      socket.join(roomName)
      console.log(`✅ User ${socket.userId} joined room: ${roomName}`)
      
      // Send acknowledgment back to client
      if (callback && typeof callback === 'function') {
        callback({ success: true, roomName })
      }
    })

    socket.on('conversation:leave', (data, callback) => {
      const roomName = `conversation:${data.conversationId}`
      socket.leave(roomName)
      console.log(`👋 User ${socket.userId} left room: ${roomName}`)
      
      // Send acknowledgment back to client
      if (callback && typeof callback === 'function') {
        callback({ success: true, roomName })
      }
    })

    // ==================== PRESENCE EVENTS ====================
    socket.on('set_presence', (data) => {
      io.emit('user:presence', {
        userId: socket.userId,
        status: data.status, // 'online', 'away', 'offline'
      })
    })

    // ==================== DISCONNECT ====================
    socket.on('disconnect', async () => {
      console.log(`❌ User disconnected: ${socket.userId}`)

      // Remove socket connection
      userSockets.delete(socket.userId)

      // Set user offline
      await userService.setOnlineStatus(socket.userId, false)

      // Broadcast user offline
      io.emit('user:offline', { userId: socket.userId })
    })
  })

  // ==================== EVENT BUS LISTENERS ====================
  messageEvents.on(MESSAGE_EVENTS.SENT, (data) => {
    io.to(`conversation:${data.conversationId}`).emit('message:sent', {
      message: data.message,
    })
  })

  messageEvents.on(MESSAGE_EVENTS.DELIVERED, (data) => {
    io.to(`conversation:${data.conversationId}`).emit('message:delivered', {
      messageId: data.messageId,
      userId: data.userId,
    })
  })

  messageEvents.on(MESSAGE_EVENTS.SEEN, (data) => {
    io.to(`conversation:${data.conversationId}`).emit('message:seen', {
      conversationId: data.conversationId,
      userId: data.userId,
    })
  })

  messageEvents.on(MESSAGE_EVENTS.EDITED, (data) => {
    io.to(`conversation:${data.conversationId}`).emit('message:edited', {
      messageId: data.messageId,
      content: data.newContent,
      isEdited: true,
    })
  })

  messageEvents.on(MESSAGE_EVENTS.DELETED, (data) => {
    io.to(`conversation:${data.conversationId}`).emit('message:deleted', {
      messageId: data.messageId,
    })
  })

  conversationEvents.on(CONVERSATION_EVENTS.PARTICIPANT_ADDED, (data) => {
    io.to(`conversation:${data.conversationId}`).emit('participant:added', {
      participantId: data.participantId,
    })
  })

  conversationEvents.on(CONVERSATION_EVENTS.PARTICIPANT_REMOVED, (data) => {
    io.to(`conversation:${data.conversationId}`).emit('participant:removed', {
      participantId: data.participantId,
    })
  })
}

export default userSockets
