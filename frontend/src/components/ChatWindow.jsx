import React, { useState, useEffect, useRef, useMemo } from 'react'
import '../styles/ChatWindow.css'
import { FiPhone, FiVideo, FiInfo, FiTrash2 } from 'react-icons/fi'
import Message from './Message'
import { userService } from '../services/api'

const normalizeId = (value) => {
  if (!value) return ''
  if (typeof value === 'object') {
    return String(value._id || value.userId || value.id || '')
  }
  return String(value)
}

const getReplyPreview = (replyTo) => {
  if (!replyTo) return ''

  if (typeof replyTo === 'string') {
    return replyTo.slice(0, 50)
  }

  const raw = replyTo.content || replyTo.text || replyTo.message || ''
  return String(raw).slice(0, 50)
}

const getParticipantId = (participant) => {
  if (!participant) return ''
  if (typeof participant === 'string') return normalizeId(participant)
  return normalizeId(participant._id || participant.userId || participant.id)
}

const getParticipantName = (participant, profiles = {}) => {
  if (!participant) return ''

  if (typeof participant === 'object') {
    return (
      participant.nickname ||
      participant.displayName ||
      participant.fullName ||
      participant.name ||
      participant.username ||
      ''
    )
  }

  const profile = profiles[normalizeId(participant)]
  return (
    profile?.nickname ||
    profile?.displayName ||
    profile?.fullName ||
    profile?.username ||
    ''
  )
}

const ChatWindow = ({
  conversation,
  messages,
  currentUserId,
  onSendMessage,
  onDeleteMessage,
  onEditMessage,
  onReactMessage,
  onDeleteConversation,
  onLoadMoreMessages,
  hasMoreMessages,
  loadingMoreMessages,
  typingUsers,
  loading,
  onTypingStart,
  onTypingStop,
}) => {
  const [messageInput, setMessageInput] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [editingMessage, setEditingMessage] = useState(null)
  const [participantProfiles, setParticipantProfiles] = useState({})
  const messagesContainerRef = useRef(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const prevConversationIdRef = useRef('')
  const newestMessageIdRef = useRef('')
  const typingTimeoutRef = useRef(null)
  const isTypingRef = useRef(false)

  const replyPreviewMap = useMemo(() => {
    const previews = {}

    messages.forEach((msg) => {
      const id = normalizeId(msg?._id || msg?.messageId)
      const content = typeof msg?.content === 'string' ? msg.content : ''

      if (id && content) {
        previews[id] = content
      }
    })

    return previews
  }, [messages])

  const scrollToBottom = (behavior = 'smooth') => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  useEffect(() => {
    const conversationId = normalizeId(conversation?._id || conversation?.conversationId)
    const newestMessageId = normalizeId(messages?.[0]?._id || messages?.[0]?.messageId)

    const isConversationChanged = prevConversationIdRef.current !== conversationId
    const isNewIncomingMessage = !isConversationChanged && newestMessageId && newestMessageIdRef.current !== newestMessageId

    if (isConversationChanged) {
      prevConversationIdRef.current = conversationId
      newestMessageIdRef.current = newestMessageId
      requestAnimationFrame(() => scrollToBottom('auto'))
      return
    }

    if (isNewIncomingMessage) {
      newestMessageIdRef.current = newestMessageId
      requestAnimationFrame(() => scrollToBottom('smooth'))
    }
  }, [conversation, messages])

  useEffect(() => {
    if (!conversation) return

    stopTypingNow()
    setEditingMessage(null)
    setReplyingTo(null)
    setMessageInput('')

    requestAnimationFrame(() => {
      scrollToBottom('auto')
      inputRef.current?.focus()
    })
  }, [conversation])

  useEffect(() => {
    if (!conversation || loading || loadingMoreMessages) return

    const rafId = requestAnimationFrame(() => {
      scrollToBottom('auto')
    })

    return () => cancelAnimationFrame(rafId)
  }, [conversation, loading, loadingMoreMessages, messages.length])

  useEffect(() => {
    if (!conversation) return

    let isCancelled = false

    const fetchMissingProfiles = async () => {
      const participants = conversation.participants || []
      const missingIds = participants
        .map((participant) => {
          const participantId = getParticipantId(participant)
          const participantName = getParticipantName(participant, participantProfiles)

          if (!participantId || participantId === normalizeId(currentUserId) || participantName) {
            return ''
          }

          return participantId
        })
        .filter(Boolean)

      if (missingIds.length === 0) return

      const results = await Promise.allSettled(
        missingIds.map(async (userId) => {
          const response = await userService.getProfile(userId)
          return { userId, user: response?.data?.user || null }
        })
      )

      if (isCancelled) return

      const nextProfiles = {}
      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value?.user) {
          nextProfiles[result.value.userId] = result.value.user
        }
      })

      if (Object.keys(nextProfiles).length > 0) {
        setParticipantProfiles((prev) => ({ ...prev, ...nextProfiles }))
      }
    }

    fetchMissingProfiles().catch((error) => {
      console.warn('⚠️ Failed to fetch participant profiles for header:', error?.message || error)
    })

    return () => {
      isCancelled = true
    }
  }, [conversation, currentUserId, participantProfiles])

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      if (isTypingRef.current) {
        onTypingStop?.()
        isTypingRef.current = false
      }
    }
  }, [onTypingStop])

  const stopTypingNow = () => {
    if (!isTypingRef.current) return
    onTypingStop?.()
    isTypingRef.current = false

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }
  }

  const handleInputChange = (event) => {
    const value = event.target.value
    setMessageInput(value)

    if (!value.trim()) {
      stopTypingNow()
      return
    }

    if (!isTypingRef.current) {
      onTypingStart?.()
      isTypingRef.current = true
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTypingNow()
    }, 1200)
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!messageInput.trim()) return

    try {
      stopTypingNow()

      if (editingMessage) {
        await onEditMessage?.(editingMessage._id || editingMessage.messageId, messageInput)
        setEditingMessage(null)
      } else {
        await onSendMessage(messageInput, replyingTo?._id || replyingTo?.messageId)
      }

      setMessageInput('')
      setReplyingTo(null)
      inputRef.current?.focus()
    } catch (err) {
      console.error('Error sending message:', err)
    }
  }

  const handleStartEditMessage = (message) => {
    if (!message) return

    const currentContent = typeof message.content === 'string' ? message.content : ''
    setEditingMessage(message)
    setReplyingTo(null)
    setMessageInput(currentContent)

    requestAnimationFrame(() => {
      inputRef.current?.focus()
      inputRef.current?.setSelectionRange(currentContent.length, currentContent.length)
    })
  }

  const handleCancelEditMessage = () => {
    setEditingMessage(null)
    setMessageInput('')
    inputRef.current?.focus()
  }

  const isGroup = conversation?.type === 'group'
  const replyingPreview = getReplyPreview(replyingTo)
  const chatHeaderName = useMemo(() => {
    if (!conversation) return ''

    if (conversation?.type === '1-1') {
      const participants = conversation.participants || []
      const counterpart =
        participants.find((participant) => getParticipantId(participant) !== normalizeId(currentUserId)) ||
        participants[0]

      return getParticipantName(counterpart, participantProfiles) || 'Người dùng'
    }

    if (conversation?.name?.trim()) return conversation.name

    const names = (conversation.participants || [])
      .map((participant) => getParticipantName(participant, participantProfiles))
      .filter(Boolean)

    return names.join(', ') || 'Nhóm chat'
  }, [conversation, currentUserId, participantProfiles])

  const hasTypingUsers = useMemo(() => {
    if (!typingUsers) return false

    return Object.entries(typingUsers).some(([userId, isTyping]) => {
      if (!isTyping) return false
      return normalizeId(userId) !== normalizeId(currentUserId)
    })
  }, [currentUserId, typingUsers])

  return (
    <div className="chat-window">
      {!conversation ? (
        <div className="no-conversation">
          <div className="no-conversation-content">
            <h2>Chọn cuộc trò chuyện</h2>
            <p>Chọn một cuộc trò chuyện để bắt đầu trò chuyện</p>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <h3>{chatHeaderName}</h3>
              <p>
                {isGroup
                  ? `${conversation.participants?.length || 0} thành viên`
                  : conversation.participants?.[0]?.isOnline
                    ? 'Đang hoạt động'
                    : 'Ngoại tuyến'}
              </p>
            </div>
            <div className="chat-header-actions">
              <button title="Gọi" aria-label="call"><FiPhone /></button>
              <button title="Video" aria-label="video"><FiVideo /></button>
              <button title="Thông tin" aria-label="info"><FiInfo /></button>
              <button
                type="button"
                className="danger"
                title="Xóa toàn bộ đoạn chat"
                aria-label="delete conversation"
                onClick={() => onDeleteConversation?.()}
              >
                <FiTrash2 />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={messagesContainerRef} className="chat-messages" onClick={() => inputRef.current?.focus()}>
            {!loading && hasMoreMessages && (
              <button
                type="button"
                className="load-more-button"
                onClick={onLoadMoreMessages}
                disabled={loadingMoreMessages}
              >
                {loadingMoreMessages ? 'Đang tải...' : 'Xem thêm tin nhắn cũ'}
              </button>
            )}

            {loading ? (
              <div className="loading">Đang tải tin nhắn...</div>
            ) : messages.length === 0 ? (
              <div className="empty-messages">Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</div>
            ) : (
              [...messages].reverse().map((message) => (
                <Message
                  key={message._id || message.messageId}
                  message={message}
                  currentUserId={currentUserId}
                  isGroup={isGroup}
                  senderInfo={
                    isGroup
                      ? conversation.participants?.find(
                          (p) => normalizeId(p?._id || p?.userId) === normalizeId(message.senderId || message.userId || message.sender)
                        )
                      : null
                  }
                  onReply={setReplyingTo}
                  onEdit={handleStartEditMessage}
                  onDelete={onDeleteMessage}
                  onReact={onReactMessage}
                  replyPreviewMap={replyPreviewMap}
                />
              ))
            )}

            {/* Typing Indicator */}
            {hasTypingUsers && (
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
                <p>Có người đang gõ...</p>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="chat-input-area">
            {editingMessage && (
              <div className="reply-preview">
                <span>Đang chỉnh sửa tin nhắn...</span>
                <button onClick={handleCancelEditMessage}>✕</button>
              </div>
            )}

            {replyingTo && (
              <div className="reply-preview">
                <span>Trả lời: {replyingPreview || 'Tin nhắn gốc'}...</span>
                <button onClick={() => setReplyingTo(null)}>✕</button>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="chat-input-form">
              <input
                ref={inputRef}
                type="text"
                value={messageInput}
                onChange={handleInputChange}
                placeholder={editingMessage ? 'Sửa tin nhắn...' : 'Nhập tin nhắn...'}
                className="chat-input"
              />
              <button type="submit" className="send-button" disabled={!messageInput.trim()}>
                {editingMessage ? 'Lưu' : 'Gửi'}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}

export default ChatWindow
