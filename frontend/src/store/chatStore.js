import { create } from 'zustand'

const normalizeId = (value) => {
  if (!value) return ''
  if (typeof value === 'object') {
    return String(value._id || value.userId || value.id || value.messageId || '')
  }
  return String(value)
}

const useChatStore = create((set) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  onlineUsers: [],
  typingUsers: {},

  setConversations: (conversations) => set({ conversations }),

  setCurrentConversation: (conversation) => set({ currentConversation: conversation }),

  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => {
      // Check if message already exists (by messageId or _id)
      const messageId = normalizeId(message._id || message.messageId)
      const exists = state.messages.some((msg) => {
        const msgId = normalizeId(msg._id || msg.messageId)
        return msgId === messageId
      })
      
      if (exists) {
        return { messages: state.messages }
      }
      
      return { messages: [message, ...state.messages] }
    }),

  updateMessage: (messageId, updatedMessage) =>
    set((state) => ({
      messages: state.messages.map((msg) => {
        const msgId = normalizeId(msg._id || msg.messageId)
        return msgId === normalizeId(messageId) ? { ...msg, ...updatedMessage } : msg
      }),
    })),

  deleteMessage: (messageId) =>
    set((state) => ({
      messages: state.messages.filter((msg) => {
        const msgId = normalizeId(msg._id || msg.messageId)
        return msgId !== normalizeId(messageId)
      }),
    })),

  setOnlineUsers: (users) => set({ onlineUsers: users }),

  addOnlineUser: (userId) =>
    set((state) => ({
      onlineUsers: state.onlineUsers.find((u) => u._id === userId)
        ? state.onlineUsers
        : [...state.onlineUsers, { _id: userId }],
    })),

  removeOnlineUser: (userId) =>
    set((state) => ({
      onlineUsers: state.onlineUsers.filter((u) => u._id !== userId),
    })),

  setTypingUser: (conversationId, userId, isTyping) =>
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [conversationId]: {
          ...(state.typingUsers[conversationId] || {}),
          [userId]: isTyping,
        },
      },
    })),
}))

export default useChatStore
