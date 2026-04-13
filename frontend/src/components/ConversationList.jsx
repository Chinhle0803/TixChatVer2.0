import React, { useState, useEffect, useMemo, useRef } from 'react'
import '../styles/ConversationList.css'
import { userService } from '../services/api'
import useAuthStore from '../store/authStore'

const normalizeId = (value) => {
  if (!value) return ''
  if (typeof value === 'object') {
    return String(value._id || value.userId || value.id || '')
  }
  return String(value)
}

const getParticipantId = (participant) => {
  if (!participant) return ''
  if (typeof participant === 'string') return normalizeId(participant)
  return normalizeId(participant._id || participant.userId || participant.id)
}

const getParticipantName = (participant, profileMap = {}) => {
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

  const profile = profileMap[normalizeId(participant)]
  return profile?.nickname || profile?.displayName || profile?.fullName || profile?.username || ''
}

const parseTimestamp = (value) => {
  if (!value) return null

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }

  if (typeof value === 'number') {
    // DynamoDB timestamps are usually in milliseconds
    const msValue = value < 1e12 ? value * 1000 : value
    const parsed = new Date(msValue)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const formatRelativeTime = (date, nowTs) => {
  if (!date) return ''

  const diffMs = Math.max(0, nowTs - date.getTime())
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diffMs < minute) return 'Vừa xong'
  if (diffMs < hour) return `${Math.floor(diffMs / minute)} phút`
  if (diffMs < day) return `${Math.floor(diffMs / hour)} giờ`
  if (diffMs < 7 * day) return `${Math.floor(diffMs / day)} ngày`

  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
  })
}

const getLastMessageObject = (conv) => {
  if (!conv) return null

  if (conv.lastMessage && typeof conv.lastMessage === 'object') return conv.lastMessage
  if (conv.latestMessage && typeof conv.latestMessage === 'object') return conv.latestMessage

  if (Array.isArray(conv.messages) && conv.messages.length > 0) {
    return conv.messages[0]
  }

  return null
}

const ConversationList = ({
  conversations = [],
  selectedConversation,
  onSelectConversation,
  onlineUsers,
  unreadByConversation = {},
  onSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [profileMap, setProfileMap] = useState({})
  const [nowTs, setNowTs] = useState(Date.now())
  const loadingProfileIdsRef = useRef(new Set())
  const currentUser = useAuthStore((state) => state.user)
  const currentUserId = normalizeId(currentUser?._id || currentUser?.userId)

  const onlineUserSet = useMemo(() => {
    const set = new Set()
    ;(onlineUsers || []).forEach((user) => {
      set.add(normalizeId(user?._id || user?.userId))
    })
    return set
  }, [onlineUsers])

  const missingProfileIds = useMemo(() => {
    const missingUserIds = new Set()

    conversations.forEach((conv) => {
      ;(conv?.participants || []).forEach((participant) => {
        const participantId = getParticipantId(participant)
        if (!participantId || participantId === currentUserId || profileMap[participantId]) {
          return
        }

        const displayName = getParticipantName(participant)
        if (!displayName && !loadingProfileIdsRef.current.has(participantId)) {
          missingUserIds.add(participantId)
        }
      })
    })

    return Array.from(missingUserIds)
  }, [conversations, currentUserId, profileMap])

  useEffect(() => {
    const interval = setInterval(() => {
      setNowTs(Date.now())
    }, 30 * 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    let isCancelled = false

    const fetchMissingProfiles = async () => {
      if (missingProfileIds.length === 0) {
        return
      }

      missingProfileIds.forEach((userId) => loadingProfileIdsRef.current.add(userId))

      const responses = await Promise.allSettled(
        missingProfileIds.map(async (userId) => {
          const response = await userService.getProfile(userId)
          return { userId, user: response?.data?.user || null }
        })
      )

      if (isCancelled) return

      const nextProfiles = {}
      responses.forEach((result) => {
        if (result.status === 'fulfilled' && result.value?.user) {
          nextProfiles[result.value.userId] = result.value.user
        }
      })

      missingProfileIds.forEach((userId) => loadingProfileIdsRef.current.delete(userId))

      if (Object.keys(nextProfiles).length > 0) {
        setProfileMap((prev) => ({ ...prev, ...nextProfiles }))
      }
    }

    fetchMissingProfiles().catch((err) => {
      console.warn('⚠️ Không thể tải profile participant:', err?.message || err)
    })

    return () => {
      isCancelled = true
    }
  }, [missingProfileIds])

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
    if (onSearch) {
      onSearch(e.target.value)
    }
  }

  const getConversationName = (conv) => {
    const participants = conv?.participants || []

    if (conv?.type === '1-1') {
      const otherParticipant =
        participants.find((participant) => getParticipantId(participant) !== currentUserId) || participants[0]

      const otherParticipantName = getParticipantName(otherParticipant, profileMap)
      if (otherParticipantName) return otherParticipantName

      const otherParticipantId = getParticipantId(otherParticipant)
      if (otherParticipantId) return otherParticipantId
    }

    if (conv?.name?.trim()) return conv.name

    const participantNames = participants
      .filter((participant) => getParticipantId(participant) !== currentUserId)
      .map((participant) => getParticipantName(participant, profileMap))
      .filter(Boolean)

    if (participantNames.length > 0) return participantNames.join(', ')

    return 'Người dùng'
  }

  const getLastMessage = (conv) => {
    const lastMessageObj = getLastMessageObject(conv)
    const rawContent =
      lastMessageObj?.content ||
      lastMessageObj?.text ||
      lastMessageObj?.message ||
      (Array.isArray(lastMessageObj?.attachments) && lastMessageObj.attachments.length > 0 ? '[Tệp đính kèm]' : '') ||
      conv?.lastMessageContent ||
      conv?.latestMessageContent ||
      ''

    if (!rawContent || typeof rawContent !== 'string') {
      return 'Chưa có tin nhắn'
    }

    return rawContent.substring(0, 50)
  }

  const getLastMessageTime = (conv) => {
    const lastMessageObj = getLastMessageObject(conv)

    const timestamp =
      lastMessageObj?.createdAt ||
      lastMessageObj?.updatedAt ||
      lastMessageObj?.timestamp ||
      lastMessageObj?.sentAt ||
      conv?.lastMessageAt ||
      conv?.updatedAt ||
      conv?.createdAt

    return formatRelativeTime(parseTimestamp(timestamp), nowTs)
  }

  const getCounterpartId = (conv) => {
    const participants = conv?.participants || []
    const otherParticipant =
      participants.find((participant) => getParticipantId(participant) !== currentUserId) || participants[0]
    return getParticipantId(otherParticipant)
  }

  const isUserOnline = (userId) => {
    return onlineUserSet.has(normalizeId(userId))
  }

  const getUnreadCount = (conv) => {
    const conversationId = normalizeId(conv?._id || conv?.conversationId)
    const fromMap = Number(unreadByConversation?.[conversationId] || 0)
    const fromConversation = Number(conv?.unreadCount || 0)
    return Math.max(fromMap, fromConversation)
  }

  return (
    <div className="conversation-list">
      <div className="conversation-search">
        <input
          type="text"
          placeholder="Tìm kiếm cuộc trò chuyện..."
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      <div className="conversation-items">
        {conversations.length === 0 ? (
          <div className="empty-state">Chưa có cuộc trò chuyện</div>
        ) : (
          conversations.map((conv) => {
            const unreadCount = getUnreadCount(conv)

            return (
            <div
              key={conv._id || conv.conversationId}
              className={`conversation-item ${
                normalizeId(selectedConversation?._id || selectedConversation?.conversationId) ===
                normalizeId(conv._id || conv.conversationId)
                  ? 'active'
                  : ''
              }`}
              onClick={() => onSelectConversation(conv)}
            >
              <div className="conversation-avatar">
                {conv.avatar ? (
                  <img src={conv.avatar} alt={getConversationName(conv)} />
                ) : (
                  <div className="avatar-placeholder">
                    {(getConversationName(conv)[0] || '?').toUpperCase()}
                  </div>
                )}
                {conv.type === '1-1' &&
                  conv.participants?.length > 0 &&
                  isUserOnline(getCounterpartId(conv)) && (
                    <span className="online-indicator"></span>
                  )}
              </div>

              <div className="conversation-info">
                <div className="conversation-name">{getConversationName(conv)}</div>
                <div className="conversation-preview">{getLastMessage(conv)}</div>
              </div>

              <div className="conversation-time">
                {getLastMessageTime(conv) || '—'}
                {unreadCount > 0 && (
                  <span className="conversation-unread-badge">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
            </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default ConversationList
