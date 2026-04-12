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
    const participant = await ParticipantRepository.findOne(conversationId, senderId)
    if (!participant) {
      throw new Error('You are not a participant of this conversation')
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

  async getConversationMessages(conversationId, limit = 50, lastEvaluatedKey = null) {
    const result = await MessageRepository.getByConversation(conversationId, limit, lastEvaluatedKey)
    return result
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
    for (const message of messages) {
      const seenBy = message.seenBy || []
      if (!seenBy.includes(userId)) {
        seenBy.push(userId)
        await MessageRepository.update(conversationId, message.messageId, {
          seenBy,
        })
      }
    }

    // Emit event
    messageEvents.emit(MESSAGE_EVENTS.SEEN, {
      conversationId,
      userId,
    })

    return messages
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
