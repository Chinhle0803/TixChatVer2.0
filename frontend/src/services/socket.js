import { io } from 'socket.io-client'
import useAuthStore from '../store/authStore'
import useChatStore from '../store/chatStore'
import { conversationService, userService } from './api'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

let socket = null
const normalizeId = (value) => {
  if (!value) return ''
  if (typeof value === 'object') {
    return String(value._id || value.userId || value.id || value.conversationId || value.messageId || '')
  }
  return String(value)
}

const buildRoleSystemMessage = async (payload = {}) => {
  const newRole = String(payload?.newRole || '').toLowerCase()
  const oldRole = String(payload?.oldRole || '').toLowerCase()
  const targetUserId = normalizeId(payload?.targetUserId)
  const conversationId = normalizeId(payload?.conversationId)

  if (!newRole || !targetUserId || !conversationId) {
    return null
  }

  let targetDisplayName = targetUserId
  try {
    const profileResponse = await userService.getProfile(targetUserId)
    const profile = profileResponse?.data?.user || null
    targetDisplayName =
      profile?.nickname ||
      profile?.displayName ||
      profile?.fullName ||
      profile?.username ||
      targetUserId
  } catch (_) {
    // Keep fallback ID-based name if profile fetch fails
  }

  let text = ''

  if (newRole === 'admin' && oldRole !== 'admin') {
    text = `${targetDisplayName} đã được bổ nhiệm làm trưởng nhóm.`
  } else if (newRole === 'moderator' && oldRole !== 'moderator') {
    text = `${targetDisplayName} đã được bổ nhiệm làm phó nhóm.`
  } else if (oldRole === 'moderator' && newRole === 'member') {
    text = `${targetDisplayName} đã bị miễn nhiệm vai trò phó nhóm.`
  } else if (oldRole !== newRole) {
    text = `Vai trò của ${targetDisplayName} đã được cập nhật.`
  }

  if (!text) {
    return null
  }

  const messageId = `sys-role-${conversationId}-${targetUserId}-${Date.now()}`

  return {
    _id: messageId,
    messageId,
    conversationId,
    type: 'system',
    content: text,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    senderId: 'system',
    reactions: {},
    attachments: [],
  }
}

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
  socket.on('message:received', async (data) => {
    const message = data?.message
    const messageConvId = normalizeId(message?.conversationId)
    if (!messageConvId) return

    // Only append to message list if this conversation is currently open
    const {
      currentConversation,
      conversations,
      unreadByConversation,
      setConversations,
      incrementConversationUnread,
      clearConversationUnread,
    } = useChatStore.getState()
    const currentUserId = normalizeId(
      useAuthStore.getState()?.user?._id || useAuthStore.getState()?.user?.userId
    )
    const senderId = normalizeId(message?.senderId)
    const currentConvId = normalizeId(currentConversation?._id || currentConversation?.conversationId)
    
    const isCurrentConversation = messageConvId === currentConvId
    const isOwnMessage = senderId && senderId === currentUserId

    if (isCurrentConversation) {
      useChatStore.getState().addMessage(message)
      if (!isOwnMessage) {
        clearConversationUnread(messageConvId)
        markAsSeen(messageConvId)
      }
    } else if (!isOwnMessage) {
      incrementConversationUnread(messageConvId)
    }

    // Always upsert conversation preview so unopened chats still appear/update
    let targetConversation = (conversations || []).find((conversation) => {
      const id = normalizeId(conversation?._id || conversation?.conversationId)
      return id === messageConvId
    })

    if (!targetConversation) {
      try {
        const response = await conversationService.getConversation(messageConvId)
        targetConversation = response?.data?.conversation || null
      } catch (error) {
        console.warn('⚠️ Failed to fetch conversation details for incoming message:', error?.message || error)
      }
    }

    const fallbackConversation = {
      _id: messageConvId,
      conversationId: messageConvId,
      type: '1-1',
      participants: [message?.senderId].filter(Boolean),
    }

    const updatedConversation = {
      ...(targetConversation || fallbackConversation),
      latestMessage: message,
      unreadCount: isCurrentConversation
        ? 0
        : isOwnMessage
          ? Number(unreadByConversation?.[messageConvId] || targetConversation?.unreadCount || 0)
          : Number(unreadByConversation?.[messageConvId] || targetConversation?.unreadCount || 0) + 1,
      lastMessageAt: message?.createdAt || message?.updatedAt || Date.now(),
      updatedAt: message?.createdAt || message?.updatedAt || Date.now(),
    }

    const nextConversations = (conversations || [])
      .filter((conversation) => {
        const id = normalizeId(conversation?._id || conversation?.conversationId)
        return id !== messageConvId
      })
      .concat(updatedConversation)
      .sort((a, b) => {
        const timeA = Number(a?.lastMessageAt || a?.updatedAt || 0)
        const timeB = Number(b?.lastMessageAt || b?.updatedAt || 0)
        return timeB - timeA
      })

    setConversations(nextConversations)
  })

  socket.on('message:delivered', (data) => {
    useChatStore.getState().updateMessage(data.messageId, { status: 'delivered' })
  })

  socket.on('message:seen', (data) => {
    useChatStore
      .getState()
      .markConversationSeenByUser(data.conversationId, data.userId)
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
  socket.on('participant:added', async (data) => {
    const conversationId = normalizeId(data?.conversationId)
    if (!conversationId) {
      console.log('Participant added:', data?.participantId)
      return
    }

    const { conversations, setConversations } = useChatStore.getState()

    const existingConversation = (conversations || []).find((conversation) => {
      const id = normalizeId(conversation?._id || conversation?.conversationId)
      return id === conversationId
    })

    if (existingConversation) {
      return
    }

    let fetchedConversation = null
    try {
      const response = await conversationService.getConversation(conversationId)
      fetchedConversation = response?.data?.conversation || null
    } catch (error) {
      console.warn('⚠️ Failed to fetch conversation after participant added:', error?.message || error)
      return
    }

    const nextConversation = {
      ...fetchedConversation,
      _id: normalizeId(fetchedConversation?._id || fetchedConversation?.conversationId) || conversationId,
      conversationId,
      unreadCount: Number(fetchedConversation?.unreadCount || 0),
      lastMessageAt:
        fetchedConversation?.lastMessageAt ||
        fetchedConversation?.updatedAt ||
        fetchedConversation?.createdAt ||
        Date.now(),
    }

    const nextConversations = (conversations || [])
      .filter((conversation) => {
        const id = normalizeId(conversation?._id || conversation?.conversationId)
        return id !== conversationId
      })
      .concat(nextConversation)
      .sort((a, b) => {
        const timeA = Number(a?.lastMessageAt || a?.updatedAt || a?.createdAt || 0)
        const timeB = Number(b?.lastMessageAt || b?.updatedAt || b?.createdAt || 0)
        return timeB - timeA
      })

    setConversations(nextConversations)
  })

  socket.on('participant:removed', (data) => {
    console.log('Participant removed:', data.participantId)
  })

  socket.on('participant:role_updated', async (data) => {
    const conversationId = normalizeId(data?.conversationId)
    if (!conversationId) return

    const { currentConversation, addMessage } = useChatStore.getState()
    const currentConversationId = normalizeId(currentConversation?._id || currentConversation?.conversationId)
    if (!currentConversationId || currentConversationId !== conversationId) {
      return
    }

    const systemMessage = await buildRoleSystemMessage(data)
    if (!systemMessage) return

    addMessage(systemMessage)
  })

  socket.on('conversation:created', async (data) => {
    const conversationId = normalizeId(data?.conversationId)
    if (!conversationId) return

    const { conversations, setConversations } = useChatStore.getState()
    const existingConversation = (conversations || []).find((conversation) => {
      const id = normalizeId(conversation?._id || conversation?.conversationId)
      return id === conversationId
    })

    if (existingConversation) return

    let fetchedConversation = null
    try {
      const response = await conversationService.getConversation(conversationId)
      fetchedConversation = response?.data?.conversation || null
    } catch (error) {
      console.warn('⚠️ Failed to fetch newly created conversation:', error?.message || error)
    }

    const fallbackConversation = {
      _id: conversationId,
      conversationId,
      type: data?.type || 'group',
      participants: Array.isArray(data?.participants) ? data.participants : [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastMessageAt: Date.now(),
      unreadCount: 0,
    }

    const nextConversation = {
      ...(fetchedConversation || fallbackConversation),
      _id: normalizeId(fetchedConversation?._id || fetchedConversation?.conversationId) || conversationId,
      conversationId,
      unreadCount: Number(fetchedConversation?.unreadCount || 0),
      lastMessageAt:
        fetchedConversation?.lastMessageAt ||
        fetchedConversation?.updatedAt ||
        fetchedConversation?.createdAt ||
        Date.now(),
    }

    const nextConversations = (conversations || [])
      .filter((conversation) => {
        const id = normalizeId(conversation?._id || conversation?.conversationId)
        return id !== conversationId
      })
      .concat(nextConversation)
      .sort((a, b) => {
        const timeA = Number(a?.lastMessageAt || a?.updatedAt || a?.createdAt || 0)
        const timeB = Number(b?.lastMessageAt || b?.updatedAt || b?.createdAt || 0)
        return timeB - timeA
      })

    setConversations(nextConversations)
  })

  socket.on('conversation:dissolved', async (data) => {
    const conversationId = normalizeId(data?.conversationId)
    if (!conversationId) return

    const {
      currentConversation,
      removeConversationById,
    } = useChatStore.getState()

    const currentConversationId = normalizeId(currentConversation?._id || currentConversation?.conversationId)

    if (currentConversationId === conversationId) {
      try {
        await leaveConversation(conversationId)
      } catch (error) {
        console.warn('⚠️ Failed to leave dissolved conversation room:', error?.message || error)
      }
    }

    removeConversationById(conversationId)
  })

  socket.on('friend_request:new', () => {
    useChatStore.getState().incrementFriendRequestCount()
  })

  socket.on('friend_request:accepted', () => {
    useChatStore.getState().decrementFriendRequestCount()
  })

  socket.on('friend_request:rejected', () => {
    useChatStore.getState().decrementFriendRequestCount()
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
