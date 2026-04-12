import { io } from 'socket.io-client'
import useAuthStore from '../store/authStore'
import useChatStore from '../store/chatStore'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

let socket = null

export const initSocket = () => {
  const { accessToken } = useAuthStore.getState()

  if (!accessToken) {
    console.error('No auth token found')
    return null
  }

  socket = io(SOCKET_URL, {
    auth: {
      token: accessToken,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  })

  setupSocketListeners(socket)

  return socket
}

export const setupSocketListeners = (socket) => {
  // Connection events
  socket.on('connect', () => {
    console.log('✅ Connected to socket server')
  })

  socket.on('disconnect', () => {
    console.log('❌ Disconnected from socket server')
  })

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error)
  })

  // Message events
  socket.on('message:received', (data) => {
    console.log('📩 Socket message:received event received:', data)
    console.log('📩 Message object:', data.message)
    console.log('📩 Message ID:', data.message?._id || data.message?.messageId)
    
    // Only add message if it matches the current conversation
    const { currentConversation } = useChatStore.getState()
    const messageConvId = data.message?.conversationId
    const currentConvId = currentConversation?._id || currentConversation?.conversationId
    
    console.log('🔍 Checking conversation match:', {
      messageConvId,
      currentConvId,
      match: messageConvId === currentConvId
    })
    
    if (messageConvId === currentConvId) {
      console.log('✅ Adding message to current conversation')
      useChatStore.getState().addMessage(data.message)
    } else {
      console.log('⚠️ Message is not for current conversation, skipping')
    }
  })

  socket.on('message:delivered', (data) => {
    useChatStore.getState().updateMessage(data.messageId, { status: 'delivered' })
  })

  socket.on('message:seen', (data) => {
    // Update all messages as seen in conversation
    const { messages } = useChatStore.getState()
    messages.forEach((msg) => {
      if (msg.conversationId === data.conversationId && !msg.seenBy.includes(data.userId)) {
        msg.seenBy.push(data.userId)
      }
    })
  })

  socket.on('message:edited', (data) => {
    const messageId = data.message?._id || data.message?.messageId || data.messageId
    if (!messageId) return

    useChatStore.getState().updateMessage(messageId, {
      content: data.message?.content || data.content,
      isEdited: data.message?.isEdited ?? data.isEdited ?? true,
      editedAt: data.message?.editedAt || data.editedAt || Date.now(),
    })
  })

  socket.on('message:deleted', (data) => {
    if (!data?.messageId) return
    useChatStore.getState().deleteMessage(data.messageId)
  })

  socket.on('message:emoji', (data) => {
    const messageId = data.message?._id || data.message?.messageId
    if (!messageId) return

    useChatStore.getState().updateMessage(messageId, {
      reactions: data.message.reactions || {},
    })
  })

  // Typing events
  socket.on('typing:start', (data) => {
    useChatStore.getState().setTypingUser(data.conversationId, data.userId, true)
  })

  socket.on('typing:stop', (data) => {
    useChatStore.getState().setTypingUser(data.conversationId, data.userId, false)
  })

  // Presence events
  socket.on('user:online', (data) => {
    useChatStore.getState().addOnlineUser(data.userId)
  })

  socket.on('user:offline', (data) => {
    useChatStore.getState().removeOnlineUser(data.userId)
  })

  socket.on('user:presence', (data) => {
    // Handle presence changes (online, away, offline)
    console.log(`User ${data.userId} is ${data.status}`)
  })

  // Participant events
  socket.on('participant:added', (data) => {
    console.log('Participant added:', data.participantId)
  })

  socket.on('participant:removed', (data) => {
    console.log('Participant removed:', data.participantId)
  })

  // Error events
  socket.on('error', (data) => {
    console.error('Socket error:', data.message)
  })
}

export const getSocket = () => {
  if (!socket || !socket.connected) {
    return initSocket()
  }
  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export const ensureSocketConnected = () => {
  return new Promise((resolve, reject) => {
    const s = getSocket()
    
    if (s?.connected) {
      resolve(s)
      return
    }
    
    // If socket exists but not connected, wait for connection
    if (s) {
      s.once('connect', () => {
        console.log('🔄 Socket connected after waiting')
        resolve(s)
      })
      
      // Timeout after 10 seconds
      setTimeout(() => {
        reject(new Error('Socket connection timeout'))
      }, 10000)
    } else {
      reject(new Error('Failed to initialize socket'))
    }
  })
}

export const joinConversation = (conversationId) => {
  return new Promise((resolve, reject) => {
    const s = getSocket()
    if (!s) {
      reject(new Error('Socket not connected'))
      return
    }
    
    s.emit('conversation:join', { conversationId }, (response) => {
      if (response?.success) {
        console.log(`✅ Successfully joined conversation: ${conversationId}`)
        resolve(response)
      } else {
        reject(new Error('Failed to join conversation'))
      }
    })
    
    // Timeout after 5 seconds
    setTimeout(() => {
      reject(new Error('Join conversation timeout'))
    }, 5000)
  })
}

export const leaveConversation = (conversationId) => {
  return new Promise((resolve, reject) => {
    const s = getSocket()
    if (!s) {
      reject(new Error('Socket not connected'))
      return
    }
    
    s.emit('conversation:leave', { conversationId }, (response) => {
      if (response?.success) {
        console.log(`👋 Successfully left conversation: ${conversationId}`)
        resolve(response)
      } else {
        reject(new Error('Failed to leave conversation'))
      }
    })
    
    // Timeout after 5 seconds
    setTimeout(() => {
      reject(new Error('Leave conversation timeout'))
    }, 5000)
  })
}

export const sendMessage = (conversationId, content, replyTo = null) => {
  return new Promise((resolve, reject) => {
    const s = getSocket()
    if (!s?.connected) {
      reject(new Error('Socket not connected'))
      return
    }
    
    s.emit('send_message', { conversationId, content, replyTo }, (response) => {
      if (response?.success) {
        console.log('✅ Message sent successfully:', response.message)
        resolve(response)
      } else {
        reject(new Error(response?.error || 'Failed to send message'))
      }
    })
    
    // Timeout after 10 seconds
    setTimeout(() => {
      reject(new Error('Send message timeout'))
    }, 10000)
  })
}

export const startTyping = (conversationId) => {
  const s = getSocket()
  if (s) {
    s.emit('typing:start', { conversationId })
  }
}

export const stopTyping = (conversationId) => {
  const s = getSocket()
  if (s) {
    s.emit('typing:stop', { conversationId })
  }
}

export const markAsDelivered = (messageId) => {
  const s = getSocket()
  if (s) {
    s.emit('message:delivered', { messageId })
  }
}

export const markAsSeen = (conversationId) => {
  const s = getSocket()
  if (s) {
    s.emit('message:seen', { conversationId })
  }
}

export const editMessage = (messageId, content) => {
  const s = getSocket()
  if (s) {
    s.emit('message:edit', { messageId, content })
  }
}

export const deleteMessage = (messageId) => {
  const s = getSocket()
  if (s) {
    s.emit('message:delete', { messageId })
  }
}

export const addEmoji = (messageId, emoji) => {
  const s = getSocket()
  if (s) {
    s.emit('message:emoji', { messageId, emoji })
  }
}

export const setPresence = (status) => {
  const s = getSocket()
  if (s) {
    s.emit('set_presence', { status })
  }
}

export default {
  initSocket,
  getSocket,
  disconnectSocket,
  ensureSocketConnected,
  joinConversation,
  leaveConversation,
  sendMessage,
  startTyping,
  stopTyping,
  markAsDelivered,
  markAsSeen,
  editMessage,
  deleteMessage,
  addEmoji,
  setPresence,
}
