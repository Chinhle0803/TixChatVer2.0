import React from 'react'
import '../styles/Message.css'
// icons
import { FiCornerUpLeft, FiEdit2, FiTrash2 } from 'react-icons/fi'
import { MdDone, MdDoneAll } from 'react-icons/md'
import { FaRegSmile } from 'react-icons/fa'

const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥']

const normalizeId = (value) => {
  if (!value) return ''
  if (typeof value === 'object') {
    return String(value._id || value.userId || value.id || '')
  }
  return String(value)
}

const getReplyPreview = (replyTo, lookup = {}) => {
  if (!replyTo) return ''

  if (typeof replyTo === 'string') {
    const resolvedById = lookup[normalizeId(replyTo)]
    if (resolvedById) return String(resolvedById).slice(0, 50)

    const looksLikeId = /^[a-f0-9-]{24,}$/i.test(replyTo)
    if (looksLikeId) return 'Tin nhắn gốc'

    return replyTo.slice(0, 50)
  }

  const raw = replyTo.content || replyTo.text || replyTo.message
  if (raw) return String(raw).slice(0, 50)

  const replyId = normalizeId(replyTo._id || replyTo.messageId || replyTo.id)
  if (replyId && lookup[replyId]) {
    return String(lookup[replyId]).slice(0, 50)
  }

  return 'Tin nhắn gốc'
}

const Message = ({
  message,
  currentUserId,
  isGroup,
  senderInfo,
  onReply,
  onEdit,
  onDelete,
  onReact,
  replyPreviewMap,
}) => {
  // Handle message safety
  if (!message) return null

  // Normalize message field names
  const senderId = normalizeId(message.senderId || message.userId || message.sender)
  const messageId = message._id || message.messageId

  const normalizedCurrentUserId = normalizeId(currentUserId)
  const isOwnMessage = senderId !== '' && senderId === normalizedCurrentUserId
  const isSeen = message.seenBy && message.seenBy.length > 0
  const reactions = message.reactions || {}
  const reactionEntries = Object.entries(reactions).filter(([, userIds]) => Array.isArray(userIds) && userIds.length > 0)
  const replyPreview = getReplyPreview(message.replyTo, replyPreviewMap)
  const messageText = typeof message.content === 'string' ? message.content : ''

  const hasReacted = (userIds = []) =>
    userIds.some((id) => normalizeId(id) === normalizedCurrentUserId)

  return (
    <div className={`message ${isOwnMessage ? 'own' : 'other'}`}>
      <div className="message-wrapper">
        {!isOwnMessage && isGroup && senderInfo && (
          <div className="message-sender">{senderInfo.fullName}</div>
        )}

        <div style={{ display: 'flex', flexDirection: isOwnMessage ? 'row-reverse' : 'row', alignItems: 'center' }}>
          <div className="message-content">
        {replyPreview && (
          <div className="message-reply">
            <small>Trả lời: {replyPreview}...</small>
          </div>
        )}

        <p className="message-text">{messageText}</p>

        {reactionEntries.length > 0 && (
          <div className="message-reactions">
            {reactionEntries.map(([emoji, userIds]) => (
              <button
                key={emoji}
                type="button"
                className={`reaction-badge ${hasReacted(userIds) ? 'active' : ''}`}
                onClick={() => onReact?.(message, emoji)}
                title={`${userIds.length} người đã thả`}
              >
                <span>{emoji}</span>
                <span>{userIds.length}</span>
              </button>
            ))}
          </div>
        )}

        {message.isEdited && <small className="message-edited">(chỉnh sửa)</small>}

        <div className="message-footer">
          <span className="message-time">
            {new Date(message.createdAt).toLocaleTimeString()}
          </span>

          {isOwnMessage && (
            <span className="message-status">
                {message.status === 'seen' && isSeen && <MdDoneAll />}
                {message.status === 'delivered' && <MdDoneAll />}
                {message.status === 'sent' && <MdDone />}
            </span>
          )}
        </div>
      </div>

      <div className="message-actions">
          <button onClick={() => onReply?.(message)} title="Trả lời" aria-label="reply">
            <FiCornerUpLeft />
          </button>

        {isOwnMessage ? (
          <>
              <button onClick={() => onEdit?.(message)} title="Chỉnh sửa" aria-label="edit">
                <FiEdit2 />
              </button>
              <button onClick={() => onDelete?.(messageId)} title="Xóa" aria-label="delete">
                <FiTrash2 />
              </button>
          </>
        ) : (
            <div className="reaction-picker" title="Thả cảm xúc">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className="reaction-option"
                onClick={() => onReact?.(message, emoji)}
                title={`Thả ${emoji}`}
              >
                {emoji}
              </button>
            ))}
              <button
                type="button"
                className="reaction-open"
                onClick={() => onReact?.(message, 'toggle-picker')}
                title="Mở bộ cảm xúc"
                aria-label="open reactions"
              >
                <FaRegSmile />
              </button>
          </div>
        )}
      </div>
      </div>
      </div>
    </div>
  )
}

export default Message
