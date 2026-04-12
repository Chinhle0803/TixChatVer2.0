import ConversationRepository from '../repositories/ConversationRepository.js'
import ParticipantRepository from '../repositories/ParticipantRepository.js'
import MessageRepository from '../repositories/MessageRepository.js'
import UserRepository from '../repositories/UserRepository.js'
import { conversationEvents } from '../events/EventBus.js'
import { CONVERSATION_EVENTS } from '../events/EventTypes.js'

export class ConversationService {
  async createConversation(type, participantIds, userId, name = null) {
    // Validate participants
    if (type === '1-1' && participantIds.length !== 1) {
      throw new Error('1-1 conversation must have exactly 2 participants')
    }

    if (type === 'group' && participantIds.length < 2) {
      throw new Error('Group must have at least 2 participants')
    }

    // Create conversation
    const participants = [userId, ...participantIds]
    const conversation = await ConversationRepository.create({
      creatorId: userId,
      type,
      name: type === 'group' ? name : null,
    })

    // Create participant records
    for (const participantId of participants) {
      await ParticipantRepository.create({
        conversationId: conversation.conversationId,
        userId: participantId,
        role: participantId === userId && type === 'group' ? 'admin' : 'member',
      })
    }

    // Emit event
    conversationEvents.emit(CONVERSATION_EVENTS.CREATED, {
      conversationId: conversation.conversationId,
      type,
      participants,
    })

    return conversation
  }

  async getConversationById(conversationId) {
    try {
      const conversation = await ConversationRepository.findById(conversationId)

      if (!conversation) {
        throw new Error(`Conversation with ID ${conversationId} not found`)
      }

      // Get participants
      const participants = await ParticipantRepository.findByConversationId(conversationId)

      return {
        ...conversation,
        participants: participants.map(p => p.userId),
      }
    } catch (error) {
      if (error.message.includes('not found')) {
        throw error
      }
      throw new Error(`Failed to get conversation: ${error.message}`)
    }
  }

  async getUserConversations(userId, limit = 20) {
    // Get all conversations this user is part of
    const participants = await ParticipantRepository.findByUserId(userId)
    const conversationIds = participants.map(p => p.conversationId)

    if (conversationIds.length === 0) {
      return []
    }

    // Fetch conversations
    const conversations = []
    for (const conversationId of conversationIds) {
      try {
        const conv = await this.getConversationById(conversationId)
        conversations.push(conv)
      } catch (error) {
        // Log error but continue with other conversations
        console.error(`Failed to fetch conversation ${conversationId}:`, error.message)
        
        // Try to fetch directly to see if conversation exists
        const directConv = await ConversationRepository.findById(conversationId)
        if (directConv) {
          conversations.push({
            ...directConv,
            participants: participants
              .filter(p => p.conversationId === conversationId)
              .map(p => p.userId),
          })
        }
      }
    }

    // Sort by last message time
    conversations.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))

    return conversations.slice(0, limit)
  }

  async addParticipant(conversationId, newParticipantId, addedBy) {
    const conversation = await ConversationRepository.findById(conversationId)
    if (!conversation) {
      throw new Error('Conversation not found')
    }

    if (conversation.type !== 'group') {
      throw new Error('Can only add participants to group conversations')
    }

    // Check if already a participant
    const existingParticipant = await ParticipantRepository.findOne(conversationId, newParticipantId)
    if (existingParticipant) {
      throw new Error('User is already a participant')
    }

    // Add participant
    await ParticipantRepository.create({
      conversationId,
      userId: newParticipantId,
      role: 'member',
    })

    // Emit event
    conversationEvents.emit(CONVERSATION_EVENTS.PARTICIPANT_ADDED, {
      conversationId,
      participantId: newParticipantId,
      addedBy,
    })

    return await this.getConversationById(conversationId)
  }

  async removeParticipant(conversationId, participantId) {
    const conversation = await ConversationRepository.findById(conversationId)
    if (!conversation) {
      throw new Error('Conversation not found')
    }

    // Remove participant
    await ParticipantRepository.delete(conversationId, participantId)

    // Emit event
    conversationEvents.emit(CONVERSATION_EVENTS.PARTICIPANT_REMOVED, {
      conversationId,
      participantId,
    })

    return await this.getConversationById(conversationId)
  }

  async updateConversation(conversationId, updateData) {
    const { name, avatar, description } = updateData

    const updates = {}
    if (name !== undefined) updates.name = name
    if (avatar !== undefined) updates.avatar = avatar
    if (description !== undefined) updates.description = description

    const conversation = await ConversationRepository.update(conversationId, updates)

    // Emit event
    conversationEvents.emit(CONVERSATION_EVENTS.UPDATED, {
      conversationId,
      conversation,
    })

    return conversation
  }

  async deleteConversation(conversationId) {
    await ConversationRepository.delete(conversationId)
    await ParticipantRepository.deleteByConversationId(conversationId)
    await MessageRepository.deleteByConversationId(conversationId)

    // Emit event
    conversationEvents.emit(CONVERSATION_EVENTS.DELETED, {
      conversationId,
    })
  }

  async searchConversations(userId, query, limit = 10) {
    // Get user's conversations
    const conversations = await this.getUserConversations(userId, 1000)

    // Filter by name
    return conversations
      .filter(conv => 
        conv.name?.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, limit)
  }
}

export default new ConversationService()
