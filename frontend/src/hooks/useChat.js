import { useState, useCallback, useRef } from 'react'
import { messageService, conversationService } from '../services/api'
import { getSocket, joinConversation, leaveConversation as leaveConversationSocket, ensureSocketConnected } from '../services/socket'
import useChatStore from '../store/chatStore'
import useAuthStore from '../store/authStore'

const normalizeId = (value) => {
  if (!value) return ''
  if (typeof value === 'object') {
    return String(value._id || value.userId || value.id || '')
  }
  return String(value)
}

export const useChat = () => {
  const [loading, setLoading] = useState(false)
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false)
  const [messageCursor, setMessageCursor] = useState(null)
  const [hasMoreMessages, setHasMoreMessages] = useState(false)
  const [error, setError] = useState(null)
  const conversations = useChatStore((state) => state.conversations)
  const currentConversation = useChatStore((state) => state.currentConversation)
  const messages = useChatStore((state) => state.messages)
  const setConversations = useChatStore((state) => state.setConversations)
  const setCurrentConversation = useChatStore((state) => state.setCurrentConversation)
  const setMessages = useChatStore((state) => state.setMessages)
  const addMessage = useChatStore((state) => state.addMessage)
  const updateMessage = useChatStore((state) => state.updateMessage)
  const removeMessage = useChatStore((state) => state.deleteMessage)
  const user = useAuthStore((state) => state.user)

  const getConversations = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await conversationService.getConversations()
      const conversationsList = response.data.conversations || []

      const enrichedResponses = await Promise.allSettled(
        conversationsList.map(async (conversation) => {
          const conversationId = conversation._id || conversation.conversationId
          if (!conversationId) return conversation

          const messagesResponse = await messageService.getMessages(conversationId, 1)
          const latestMessage = messagesResponse?.data?.messages?.[0] || null

          if (!latestMessage) {
            return conversation
          }

          return {
            ...conversation,
            latestMessage,
            lastMessageAt: latestMessage.createdAt || latestMessage.updatedAt || conversation.lastMessageAt,
          }
        })
      )

      const enrichedConversations = enrichedResponses.map((result, index) =>
        result.status === 'fulfilled' ? result.value : conversationsList[index]
      )

      setConversations(enrichedConversations)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }, [setConversations])

  const openConversation = useCallback(
    async (conversationId) => {
      setLoading(true)
      setLoadingMoreMessages(false)
      setMessageCursor(null)
      setHasMoreMessages(false)
      setError(null)
      try {
        // Fetch conversation data in parallel
        const [conversationResponse, messagesResponse] = await Promise.all([
          conversationService.getConversation(conversationId),
          messageService.getMessages(conversationId, 20)
        ])
        
        const conversation = conversationResponse.data.conversation
        const messagesList = messagesResponse.data.messages || []
        
        console.log('📥 Loaded conversation:', conversation)
        console.log('📥 Loaded messages:', messagesList)
        
        setCurrentConversation(conversation)
        
        // Ensure all messages have conversationId
        const enrichedMessages = messagesList.map(msg => ({
          ...msg,
          conversationId: conversationId,
          _id: msg._id || msg.messageId,
        }))
        
        setMessages(enrichedMessages)
        setMessageCursor(messagesResponse.data?.lastEvaluatedKey || null)
        setHasMoreMessages(Boolean(messagesResponse.data?.lastEvaluatedKey))
        
        // Ensure socket is connected before joining room
        try {
          await ensureSocketConnected()
          await joinConversation(conversationId)
        } catch (socketErr) {
          console.warn('⚠️ Socket join failed:', socketErr.message)
          // Continue anyway - user can still see messages but real-time won't work
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load conversation')
      } finally {
        setLoading(false)
      }
    },
    [setCurrentConversation, setMessages]
  )

  const createConversation = useCallback(
    async (type, participantIds, name = null) => {
      setError(null)
      try {
        const response = await conversationService.createConversation(
          type,
          participantIds,
          name
        )
        setCurrentConversation(response.data.conversation)
        return response.data.conversation
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to create conversation')
        throw err
      }
    },
    [setCurrentConversation]
  )

  const sendMessage = useCallback(
    async (content, replyTo = null) => {
      if (!currentConversation) {
        setError('No conversation selected')
        return
      }

      setError(null)
      try {
        const conversationId = currentConversation._id || currentConversation.conversationId
        console.log('💬 sendMessage called with:', { conversationId, content, replyTo })
        console.log('📦 currentConversation:', currentConversation)
        
        // Make API request to send message
        const response = await messageService.sendMessage(
          conversationId,
          content,
          replyTo
        )
        
        const message = response.data.data
        console.log('✅ Message created via API:', message)
        
        // Ensure message has conversationId for store operations
        const enrichedMessage = {
          ...message,
          conversationId: conversationId,
          _id: message._id || message.messageId,
        }
        console.log('📝 Enriched message:', enrichedMessage)
        
        // Add message to local state immediately (optimistic update)
        addMessage(enrichedMessage)

        const nextConversations = conversations
          .map((conversation) => {
            const currentId = conversation._id || conversation.conversationId
            if (normalizeId(currentId) !== normalizeId(conversationId)) {
              return conversation
            }

            return {
              ...conversation,
              latestMessage: enrichedMessage,
              lastMessageAt:
                enrichedMessage.createdAt || enrichedMessage.updatedAt || conversation.lastMessageAt,
              updatedAt: Date.now(),
            }
          })
          .sort((a, b) => {
            const timeA = a.lastMessageAt || a.updatedAt || 0
            const timeB = b.lastMessageAt || b.updatedAt || 0
            return Number(timeB) - Number(timeA)
          })

        setConversations(nextConversations)
        
        // Emit socket event with callback to ensure delivery
        try {
          await ensureSocketConnected()
          await joinConversation(conversationId)
        } catch (err) {
          console.warn('⚠️ Socket sync failed:', err.message)
          // Continue anyway - message is already in database
        }
        
        return message
      } catch (err) {
        console.error('❌ Error sending message:', err)
        setError(err.response?.data?.error || 'Failed to send message')
        throw err
      }
    },
    [currentConversation, addMessage, conversations, setConversations]
  )

  const loadMoreMessages = useCallback(
    async () => {
      if (!currentConversation || !hasMoreMessages || loadingMoreMessages) return

      setError(null)
      setLoadingMoreMessages(true)
      try {
        const conversationId = currentConversation._id || currentConversation.conversationId
        const response = await messageService.getMessages(
          conversationId,
          20,
          messageCursor
        )
        const olderMessages = (response.data?.messages || []).map((msg) => ({
          ...msg,
          conversationId,
          _id: msg._id || msg.messageId,
        }))

        setMessages([...messages, ...olderMessages])
        setMessageCursor(response.data?.lastEvaluatedKey || null)
        setHasMoreMessages(Boolean(response.data?.lastEvaluatedKey))
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load messages')
      } finally {
        setLoadingMoreMessages(false)
      }
    },
    [currentConversation, hasMoreMessages, loadingMoreMessages, messageCursor, messages, setMessages]
  )

  const editMessage = useCallback(
    async (messageId, content) => {
      if (!currentConversation) {
        setError('No conversation selected')
        return
      }

      const trimmedContent = content?.trim()
      if (!trimmedContent) {
        throw new Error('Nội dung không được để trống')
      }

      setError(null)
      try {
        const conversationId = currentConversation._id || currentConversation.conversationId
        const response = await messageService.editMessage(conversationId, messageId, trimmedContent)
        const updatedMessage = response.data?.data

        updateMessage(messageId, {
          content: updatedMessage?.content || trimmedContent,
          isEdited: true,
          editedAt: updatedMessage?.editedAt || Date.now(),
        })

        return updatedMessage
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to edit message')
        throw err
      }
    },
    [currentConversation, updateMessage]
  )

  const deleteMessage = useCallback(
    async (messageId) => {
      if (!currentConversation) {
        setError('No conversation selected')
        return
      }

      setError(null)
      try {
        const conversationId = currentConversation._id || currentConversation.conversationId
        await messageService.deleteMessage(conversationId, messageId)
        removeMessage(messageId)
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete message')
        throw err
      }
    },
    [currentConversation, removeMessage]
  )

  const toggleMessageReaction = useCallback(
    async (message, emoji) => {
      if (!currentConversation) {
        setError('No conversation selected')
        return
      }

      const messageId = message?._id || message?.messageId
      const currentUserId = normalizeId(user?._id || user?.userId)
      if (!messageId || !currentUserId) return

      const conversationId = currentConversation._id || currentConversation.conversationId
      const reactions = message.reactions || {}
      const usersByEmoji = reactions[emoji] || []
      const hasReacted = usersByEmoji.some((id) => normalizeId(id) === currentUserId)

      setError(null)
      try {
        if (hasReacted) {
          await messageService.removeEmoji(conversationId, messageId, emoji)
          const nextUsers = usersByEmoji.filter((id) => normalizeId(id) !== currentUserId)
          const nextReactions = { ...reactions }

          if (nextUsers.length > 0) {
            nextReactions[emoji] = nextUsers
          } else {
            delete nextReactions[emoji]
          }

          updateMessage(messageId, { reactions: nextReactions })
          return
        }

        await messageService.addEmoji(conversationId, messageId, emoji)
        updateMessage(messageId, {
          reactions: {
            ...reactions,
            [emoji]: [...usersByEmoji, currentUserId],
          },
        })
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to update reaction')
        throw err
      }
    },
    [currentConversation, updateMessage, user]
  )

  const leaveConversation = useCallback(() => {
    if (!currentConversation) return

    // Leave socket room
    const conversationId = currentConversation._id || currentConversation.conversationId
    leaveConversationSocket(conversationId).catch((err) => {
      console.warn('⚠️ Failed to leave conversation socket room:', err.message)
    })

    setCurrentConversation(null)
    setMessages([])
    setMessageCursor(null)
    setHasMoreMessages(false)
  }, [currentConversation])

  return {
    conversations,
    currentConversation,
    messages,
    loading,
  loadingMoreMessages,
  hasMoreMessages,
    error,
    getConversations,
    openConversation,
    leaveConversation,
    createConversation,
    sendMessage,
    loadMoreMessages,
    editMessage,
    deleteMessage,
    toggleMessageReaction,
  }
}

export default useChat
