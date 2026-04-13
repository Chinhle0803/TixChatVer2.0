import MessageRepository from '../repositories/MessageRepository.js'
import ConversationRepository from '../repositories/ConversationRepository.js'
import ParticipantRepository from '../repositories/ParticipantRepository.js'
import { messageEvents } from '../events/EventBus.js'
import { MESSAGE_EVENTS } from '../events/EventTypes.js'

export class MessageService {
  async sendMessage(conversationId, senderId, content, replyTo = null) {
    // Verify conversation exists
    const conversation = await ConversationRepository.findById(conversationId)
    if (!conversation) {
      throw new Error('Conversation not found')
    }

    // Verify sender is a participant
    let participant = await ParticipantRepository.findOne(conversationId, senderId)
    if (!participant) {
      throw new Error('You are not a participant of this conversation')
    }

    // Compatibility for legacy behavior: if user had previously been marked as left
    // in a direct chat, reactivate them while preserving a clear-history boundary.
    if (participant.leftAt && (conversation.type === '1-1' || conversation.type === 'direct')) {
      participant = await ParticipantRepository.reactivateParticipant(
        conversationId,
        senderId,
        participant.leftAt
      )
    }

    if (participant.leftAt) {
      throw new Error('You are not a participant of this conversation')
    }

    // Also reactivate any legacy left participant in this direct conversation so
    // they receive new messages in the same thread instead of creating a new one.
    if (conversation.type === '1-1' || conversation.type === 'direct') {
      const participants = await ParticipantRepository.findByConversationId(conversationId, 100)
      for (const item of participants || []) {
        if (item?.leftAt) {
          await ParticipantRepository.reactivateParticipant(
            conversationId,
            item.userId,
            item.leftAt
          )
        }
      }
    }

    // Create message
    const message = await MessageRepository.create({
      conversationId,
      senderId,
      content,
      replyTo,
    })

    // Update conversation
    await ConversationRepository.update(conversationId, {
      updatedAt: Date.now(),
    })

    // Emit event
    messageEvents.emit(MESSAGE_EVENTS.SENT, {
      conversationId,
      message,
    })

    return message
  }

  async getConversationMessages(conversationId, userId, limit = 50, lastEvaluatedKey = null) {
    const participant = await ParticipantRepository.findOne(conversationId, userId)
    if (!participant || participant.leftAt) {
      throw new Error('You are not a participant of this conversation')
    }

    const result = await MessageRepository.getByConversation(conversationId, limit, lastEvaluatedKey)
    const clearedAt = Number(participant.clearedAt || 0)

    if (!clearedAt) {
      return result
    }

    return {
      ...result,
      messages: (result.messages || []).filter((message) => Number(message.createdAt || 0) > clearedAt),
    }
  }

  async markAsDelivered(messageId, userId) {
    // Note: messageId alone cannot query message in DynamoDB
    // Need conversationId + messageId for composite key
    // This method needs to be called with conversationId or refactored
    throw new Error('markAsDelivered requires conversationId parameter')
  }

  async markAsDeliveredInConversation(conversationId, messageId, userId) {
    const message = await MessageRepository.findById(conversationId, messageId)
    if (!message) {
      throw new Error('Message not found')
    }

    // Add userId to deliveredTo if not already there
    const deliveredTo = message.deliveredTo || []
    if (!deliveredTo.includes(userId)) {
      deliveredTo.push(userId)
      await MessageRepository.update(conversationId, messageId, {
        deliveredTo,
      })
    }

    // Emit event
    messageEvents.emit(MESSAGE_EVENTS.DELIVERED, {
      messageId,
      userId,
      conversationId: message.conversationId,
    })

    return message
  }

  async markAsSeen(conversationId, userId) {
    // Get all messages in conversation
    const result = await MessageRepository.getByConversation(conversationId, 10000)
    const messages = result.messages || []

    // Mark each as seen
    let latestMessage = null
    for (const message of messages) {
      const seenBy = message.seenBy || []
      if (!seenBy.includes(userId)) {
        seenBy.push(userId)
        await MessageRepository.update(conversationId, message.messageId, {
          seenBy,
        })
      }

      if (!latestMessage) {
        latestMessage = message
      }
    }

    await ParticipantRepository.updateReadState(
      conversationId,
      userId,
      latestMessage?.messageId || null,
      Date.now()
    )

    // Emit event
    messageEvents.emit(MESSAGE_EVENTS.SEEN, {
      conversationId,
      userId,
    })

    return messages
  }

  async getUnreadCount(conversationId, userId) {
    const participant = await ParticipantRepository.findOne(conversationId, userId)
    if (!participant || participant.leftAt) {
      return 0
    }

    const result = await MessageRepository.getByConversation(conversationId, 10000)
    const messages = result.messages || []
    const lastReadAt = Number(participant.lastReadAt || 0)
    const clearedAt = Number(participant.clearedAt || 0)
    const threshold = Math.max(lastReadAt, clearedAt)

    return messages.filter((message) => {
      const createdAt = Number(message.createdAt || 0)
      return (
        String(message.senderId) !== String(userId) &&
        createdAt > threshold
      )
    }).length
  }

  async getUnreadCountsForUser(userId) {
    const participants = await ParticipantRepository.findByUserId(userId, 1000)
    const activeParticipants = (participants || []).filter((item) => !item?.leftAt)
    const unreadByConversation = {}

    for (const participant of activeParticipants) {
      const conversationId = participant?.conversationId
      if (!conversationId) continue

      const unreadCount = await this.getUnreadCount(conversationId, userId)
      unreadByConversation[conversationId] = unreadCount
    }

    return unreadByConversation
  }

  async editMessage(conversationId, messageId, senderId, newContent) {
    const message = await MessageRepository.findById(conversationId, messageId)
    if (!message) {
      throw new Error('Message not found')
    }

    if (message.senderId !== senderId) {
      throw new Error('You can only edit your own messages')
    }

    const updated = await MessageRepository.update(conversationId, messageId, {
      content: newContent,
      isEdited: true,
      editedAt: Date.now(),
    })

    // Emit event
    messageEvents.emit(MESSAGE_EVENTS.EDITED, {
      messageId,
      conversationId,
      newContent,
    })

    return updated
  }

  async deleteMessage(conversationId, messageId, senderId) {
    const message = await MessageRepository.findById(conversationId, messageId)
    if (!message) {
      throw new Error('Message not found')
    }

    if (message.senderId !== senderId) {
      throw new Error('You can only delete your own messages')
    }

    await MessageRepository.hardDelete(conversationId, messageId)

    // Emit event
    messageEvents.emit(MESSAGE_EVENTS.DELETED, {
      messageId,
      conversationId,
    })

    return {
      messageId,
      conversationId,
      deleted: true,
    }
  }

  async addEmoji(conversationId, messageId, userId, emoji) {
    const message = await MessageRepository.findById(conversationId, messageId)
    if (!message) {
      throw new Error('Message not found')
    }

    const reactions = message.reactions || {}
    if (!reactions[emoji]) {
      reactions[emoji] = []
    }

    if (!reactions[emoji].includes(userId)) {
      reactions[emoji].push(userId)
    }

    const updated = await MessageRepository.update(conversationId, messageId, {
      reactions,
    })

    return updated
  }

  async removeEmoji(conversationId, messageId, userId, emoji) {
    const message = await MessageRepository.findById(conversationId, messageId)
    if (!message) {
      throw new Error('Message not found')
    }

    const reactions = message.reactions || {}
    if (reactions[emoji]) {
      reactions[emoji] = reactions[emoji].filter(id => id !== userId)
      if (reactions[emoji].length === 0) {
        delete reactions[emoji]
      }
    }

    const updated = await MessageRepository.update(conversationId, messageId, {
      reactions,
    })

    return updated
  }
}

export default new MessageService()
