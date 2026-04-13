import ConversationRepository from '../repositories/ConversationRepository.js'
import ParticipantRepository from '../repositories/ParticipantRepository.js'
import { conversationEvents } from '../events/EventBus.js'
import { CONVERSATION_EVENTS } from '../events/EventTypes.js'

export class ConversationService {
  async findDirectConversationBetweenUsers(userAId, userBId) {
    const userAParticipants = await ParticipantRepository.findByUserId(userAId, 1000)

    if (!Array.isArray(userAParticipants) || userAParticipants.length === 0) {
      return null
    }

    for (const participant of userAParticipants) {
      const conversationId = participant?.conversationId
      if (!conversationId) continue

      const conversation = await ConversationRepository.findById(conversationId)
      if (!conversation) continue

      const type = conversation.type
      if (type !== '1-1' && type !== 'direct') continue

      const participants = await ParticipantRepository.findByConversationId(conversationId, 100)
      const allParticipantIds = (participants || []).map((item) => String(item.userId))
      const activeParticipantIds = (participants || [])
        .filter((item) => !item?.leftAt)
        .map((item) => String(item.userId))

      const hasUserA = allParticipantIds.includes(String(userAId))
      const hasUserB = allParticipantIds.includes(String(userBId))

      if (hasUserA && hasUserB) {
        return {
          ...conversation,
          participants: activeParticipantIds,
          participantRecords: participants,
        }
      }
    }

    return null
  }

  async getOrCreateDirectConversation(userAId, userBId) {
    const existingConversation = await this.findDirectConversationBetweenUsers(userAId, userBId)
    if (existingConversation) {
      return existingConversation
    }

    return this.createConversation('1-1', [userBId], userAId)
  }

  async createConversation(type, participantIds, userId, name = null) {
    const normalizedType = type === 'direct' ? '1-1' : type

    // Validate participants
    if (normalizedType === '1-1' && participantIds.length !== 1) {
      throw new Error('1-1 conversation must have exactly 2 participants')
    }

    if (normalizedType === 'group' && participantIds.length < 2) {
      throw new Error('Group must have at least 2 participants')
    }

    if (normalizedType === '1-1') {
      const targetUserId = participantIds[0]
      const existingConversation = await this.findDirectConversationBetweenUsers(userId, targetUserId)
      if (existingConversation) {
        const participantRecords = existingConversation.participantRecords || []
        const targetParticipantIds = [String(userId), String(targetUserId)]

        for (const participant of participantRecords) {
          if (!targetParticipantIds.includes(String(participant.userId))) {
            continue
          }

          if (participant.leftAt) {
            await ParticipantRepository.reactivateParticipant(
              existingConversation.conversationId,
              participant.userId,
              participant.leftAt
            )
          }
        }

        return existingConversation
      }
    }

    // Create conversation
    const participants = [userId, ...participantIds]
    const conversation = await ConversationRepository.create({
      creatorId: userId,
      type: normalizedType,
      name: normalizedType === 'group' ? name : null,
    })

    // Create participant records
    for (const participantId of participants) {
      await ParticipantRepository.create({
        conversationId: conversation.conversationId,
        userId: participantId,
        role: participantId === userId && normalizedType === 'group' ? 'admin' : 'member',
      })
    }

    // Emit event
    conversationEvents.emit(CONVERSATION_EVENTS.CREATED, {
      conversationId: conversation.conversationId,
      type: normalizedType,
      participants,
    })

    return conversation
  }

  async getConversationById(conversationId, requesterUserId = null) {
    try {
      const conversation = await ConversationRepository.findById(conversationId)

      if (!conversation) {
        throw new Error(`Conversation with ID ${conversationId} not found`)
      }

      // Get participants
      const participants = await ParticipantRepository.findByConversationId(conversationId)

      if (requesterUserId) {
        const activeParticipantIds = participants
          .filter((item) => !item?.leftAt)
          .map((item) => String(item.userId))

        if (!activeParticipantIds.includes(String(requesterUserId))) {
          throw new Error('You do not have access to this conversation')
        }
      }

      return {
        ...conversation,
        participants: participants
          .filter((item) => !item?.leftAt)
          .map((item) => item.userId),
      }
    } catch (error) {
      if (error.message.includes('not found') || error.message.includes('do not have access')) {
        throw error
      }
      throw new Error(`Failed to get conversation: ${error.message}`)
    }
  }

  async getUserConversations(userId, limit = 20) {
    // Get all conversations this user is part of
    const participants = await ParticipantRepository.findByUserId(userId)
    const activeParticipants = participants.filter((item) => !item?.leftAt)
    const conversationIds = [...new Set(activeParticipants.map((item) => item.conversationId))]

    if (conversationIds.length === 0) {
      return []
    }

    // Fetch conversations
    const conversations = []
    for (const conversationId of conversationIds) {
      try {
        const conv = await this.getConversationById(conversationId, userId)
        const participant = activeParticipants.find((item) => item.conversationId === conversationId)
        const clearedAt = Number(participant?.clearedAt || 0)
        const updatedAt = Number(conv?.updatedAt || 0)

        // Hide conversation for this user until there is newer activity after clear
        if (clearedAt && updatedAt <= clearedAt) {
          continue
        }

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
              .filter(p => p.conversationId === conversationId && !p.leftAt)
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

  async deleteConversation(conversationId, userId) {
    const conversation = await ConversationRepository.findById(conversationId)
    if (!conversation) {
      throw new Error('Conversation not found')
    }

    const participant = await ParticipantRepository.findOne(conversationId, userId)
    if (!participant || participant.leftAt) {
      throw new Error('Conversation already deleted for this user')
    }

    await ParticipantRepository.clearConversationForUser(conversationId, userId)

    return {
      conversationId,
      deletedForUserId: userId,
      permanentlyDeleted: false,
    }
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
