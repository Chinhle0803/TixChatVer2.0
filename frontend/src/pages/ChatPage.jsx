import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import useChat from '../hooks/useChat'
import useSocket from '../hooks/useSocket'
import ConversationList from '../components/ConversationList'
import ChatWindow from '../components/ChatWindow'
import ErrorBoundary from '../components/ErrorBoundary'
import NewConversationModal from '../components/NewConversationModal'
import '../styles/ChatPage.css'
import { FiSearch, FiUser, FiLogOut, FiMenu } from 'react-icons/fi'

const normalizeId = (value) => {
  if (!value) return ''
  if (typeof value === 'object') {
    return String(value._id || value.userId || value.id || '')
  }
  return String(value)
}

const getConversationParticipantIds = (conversation) => {
  const participants =
    conversation?.participants ||
    conversation?.participantIds ||
    []

  return participants
    .map((participant) =>
      normalizeId(
        typeof participant === 'object'
          ? participant._id || participant.userId || participant.id
          : participant
      )
    )
    .filter(Boolean)
}

const ChatPage = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const {
    conversations,
    currentConversation,
    messages,
    loading,
    loadingMoreMessages,
    hasMoreMessages,
    error,
    getConversations,
    openConversation,
    createConversation,
    sendMessage,
    loadMoreMessages,
    editMessage,
    deleteMessage,
    toggleMessageReaction,
  } = useChat()

  const [onlineUsers, setOnlineUsers] = useState([])
  const [typingUsers, setTypingUsers] = useState({})
  const [showSidebar, setShowSidebar] = useState(true)
  const [showNewConversationModal, setShowNewConversationModal] = useState(false)

  // Initialize socket
  useSocket()

  useEffect(() => {
    getConversations()
  }, [])

  const handleSelectConversation = async (conversation) => {
    await openConversation(conversation._id || conversation.conversationId)
    setShowSidebar(false)
  }

  const handleSendMessage = async (content, replyTo) => {
    try {
      await sendMessage(content, replyTo)
    } catch (err) {
      console.error('Error sending message:', err)
    }
  }

  const handleDeleteMessage = async (messageId) => {
    const shouldDelete = window.confirm('Bạn có chắc muốn xóa tin nhắn này không?')
    if (!shouldDelete) return

    try {
      await deleteMessage(messageId)
    } catch (err) {
      console.error('Error deleting message:', err)
      window.alert(err.response?.data?.error || 'Xóa tin nhắn thất bại')
    }
  }

  const handleEditMessage = async (messageId, nextContent) => {
    try {
      await editMessage(messageId, nextContent)
    } catch (err) {
      console.error('Error editing message:', err)
    }
  }

  const handleReactToMessage = async (message, emoji) => {
    try {
      await toggleMessageReaction(message, emoji)
    } catch (err) {
      console.error('Error reacting to message:', err)
      window.alert(err.response?.data?.error || 'Thả cảm xúc thất bại')
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  const handleProfileClick = () => {
    navigate('/profile')
  }

  const handleStartConversationWithUser = async (userId) => {
    try {
      const targetUserId = normalizeId(userId)
      const currentUserId = normalizeId(user?._id || user?.userId)

      const existingConversation = conversations.find((conversation) => {
        const type = conversation?.type
        if (type !== '1-1' && type !== 'direct') return false

        const participantIds = getConversationParticipantIds(conversation)
        return (
          participantIds.includes(currentUserId) &&
          participantIds.includes(targetUserId)
        )
      })

      const existingConversationId =
        existingConversation?._id || existingConversation?.conversationId

      if (existingConversationId) {
        await openConversation(existingConversationId)
        setShowSidebar(false)
        return
      }

      const created = await createConversation('1-1', [targetUserId])
      const createdConversationId = created?._id || created?.conversationId
      if (!createdConversationId) return

      await getConversations()
      await openConversation(createdConversationId)
      setShowSidebar(false)
    } catch (error) {
      console.error('Create conversation failed:', error)
    }
  }

  return (
    <div className="chat-page">
      <div className="chat-layout">
        {/* Sidebar */}
        <div className={`sidebar ${showSidebar ? 'visible' : 'hidden'}`}>
          <div className="sidebar-header">
            <h2>TixChat</h2>
            <div className="sidebar-actions">
              <button
                title="Tìm bạn và tạo cuộc trò chuyện"
                onClick={() => setShowNewConversationModal(true)}
                aria-label="new conversation"
              >
                <FiSearch />
              </button>
              <button onClick={handleProfileClick} title="Hồ sơ" aria-label="profile">
                <FiUser />
              </button>
              <button onClick={handleLogout} title="Đăng xuất" aria-label="logout">
                <FiLogOut />
              </button>
            </div>
          </div>

          {user && (
            <div className="user-info">
              <div className="user-avatar">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.fullName} />
                ) : (
                  <div className="avatar-placeholder">{user.fullName[0]}</div>
                )}
              </div>
              <div className="user-details">
                <p className="user-name">{user.fullName}</p>
                <p className="user-username">@{user.username}</p>
              </div>
            </div>
          )}

          <ConversationList
            conversations={conversations}
            selectedConversation={currentConversation}
            onSelectConversation={handleSelectConversation}
            onlineUsers={onlineUsers}
          />
        </div>

        {/* Main Chat Area */}
        <div className="main-content">
          {showSidebar && (
            <button className="toggle-sidebar" onClick={() => setShowSidebar(false)} aria-label="hide sidebar">
              <FiMenu />
            </button>
          )}

          <ErrorBoundary>
            <ChatWindow
              conversation={currentConversation}
              messages={messages}
              currentUserId={user?._id || user?.userId}
              onSendMessage={handleSendMessage}
              onDeleteMessage={handleDeleteMessage}
              onEditMessage={handleEditMessage}
              onReactMessage={handleReactToMessage}
              onLoadMoreMessages={loadMoreMessages}
              hasMoreMessages={hasMoreMessages}
              loadingMoreMessages={loadingMoreMessages}
              typingUsers={typingUsers}
              loading={loading}
            />
          </ErrorBoundary>
        </div>
      </div>

      {error && (
        <div className="global-error">
          <p>{error}</p>
        </div>
      )}

      <NewConversationModal
        isOpen={showNewConversationModal}
        onClose={() => setShowNewConversationModal(false)}
        currentUserId={user?._id || user?.userId}
        onStartConversation={handleStartConversationWithUser}
      />
    </div>
  )
}

export default ChatPage
