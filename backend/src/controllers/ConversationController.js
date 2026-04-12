import conversationService from '../services/ConversationService.js'
import { createConversationValidation } from '../utils/validation.js'

// Helper to normalize conversation for frontend compatibility
const normalizeConversation = (conv) => {
  if (!conv) return null
  return {
    ...conv,
    _id: conv.conversationId, // Add _id alias for frontend compatibility
  }
}

// Helper to normalize conversation array
const normalizeConversations = (conversations) => {
  if (!Array.isArray(conversations)) return conversations
  return conversations.map(normalizeConversation)
}

export class ConversationController {
  async createConversation(req, res, next) {
    try {
      const { error, value } = createConversationValidation(req.body)
      if (error) {
        return res.status(400).json({ error: error.details[0].message })
      }

      const conversation = await conversationService.createConversation(
        value.type,
        value.participantIds,
        req.userId,
        value.name
      )

      res.status(201).json({
        message: 'Conversation created successfully',
        conversation: normalizeConversation(conversation),
      })
    } catch (err) {
      res.status(400).json({ error: err.message })
    }
  }

  async getConversation(req, res, next) {
    try {
      const conversation = await conversationService.getConversationById(
        req.params.conversationId
      )
      res.status(200).json({ conversation: normalizeConversation(conversation) })
    } catch (err) {
      if (err.message.includes('not found')) {
        return res.status(404).json({ error: err.message })
      }
      next(err)
    }
  }

  async getUserConversations(req, res, next) {
    try {
      const { limit = 20, skip = 0 } = req.query
      const conversations = await conversationService.getUserConversations(
        req.userId,
        parseInt(limit),
        parseInt(skip)
      )

      res.status(200).json({ conversations: normalizeConversations(conversations) })
    } catch (err) {
      next(err)
    }
  }

  async addParticipant(req, res, next) {
    try {
      const { conversationId } = req.params
      const { participantId } = req.body

      const conversation = await conversationService.addParticipant(
        conversationId,
        participantId,
        req.userId
      )

      res.status(200).json({
        message: 'Participant added successfully',
        conversation: normalizeConversation(conversation),
      })
    } catch (err) {
      res.status(400).json({ error: err.message })
    }
  }

  async removeParticipant(req, res, next) {
    try {
      const { conversationId, participantId } = req.params

      const conversation = await conversationService.removeParticipant(
        conversationId,
        participantId
      )

      res.status(200).json({
        message: 'Participant removed successfully',
        conversation: normalizeConversation(conversation),
      })
    } catch (err) {
      res.status(400).json({ error: err.message })
    }
  }

  async updateConversation(req, res, next) {
    try {
      const conversation = await conversationService.updateConversation(
        req.params.conversationId,
        req.body
      )

      res.status(200).json({
        message: 'Conversation updated successfully',
        conversation: normalizeConversation(conversation),
      })
    } catch (err) {
      next(err)
    }
  }

  async archiveConversation(req, res, next) {
    try {
      await conversationService.archiveConversation(req.params.conversationId)
      res.status(200).json({ message: 'Conversation archived successfully' })
    } catch (err) {
      next(err)
    }
  }

  async deleteConversation(req, res, next) {
    try {
      await conversationService.deleteConversation(req.params.conversationId)
      res.status(200).json({ message: 'Conversation deleted successfully' })
    } catch (err) {
      next(err)
    }
  }

  async searchConversations(req, res, next) {
    try {
      const { q, limit } = req.query
      if (!q) {
        return res.status(400).json({ error: 'Search query is required' })
      }

      const conversations = await conversationService.searchConversations(
        req.userId,
        q,
        parseInt(limit) || 10
      )

      res.status(200).json({ conversations: normalizeConversations(conversations) })
    } catch (err) {
      next(err)
    }
  }
}

export default new ConversationController()
