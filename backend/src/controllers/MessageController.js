import messageService from '../services/MessageService.js'
import conversationService from '../services/ConversationService.js'
import { sendMessageValidation } from '../utils/validation.js'
import { getIO } from '../utils/ioInstance.js'

export class MessageController {
  async getUnreadCounts(req, res, next) {
    try {
      const unreadByConversation = await messageService.getUnreadCountsForUser(req.userId)
      res.status(200).json({ unreadByConversation })
    } catch (err) {
      next(err)
    }
  }

  async sendMessage(req, res, next) {
    try {
      const { error, value } = sendMessageValidation(req.body)
      if (error) {
        return res.status(400).json({ error: error.details[0].message })
      }

      const message = await messageService.sendMessage(
        value.conversationId,
        req.userId,
        value.content,
        value.replyTo
      )

      // Broadcast to each participant personal room so recipients can
      // receive the message even when they have not joined the
      // `conversation:{id}` room yet.
      const io = getIO()
      if (io) {
        const conversationId = value.conversationId
        const conversation = await conversationService.getConversationById(conversationId)
        const participants = Array.isArray(conversation?.participants)
          ? conversation.participants
          : []

        participants.forEach((participantId) => {
          io.to(`user:${participantId}`).emit('message:received', { message })
        })
      }

      res.status(201).json({
        message: 'Message sent successfully',
        data: message,
      })
    } catch (err) {
      res.status(400).json({ error: err.message })
    }
  }

  async getConversationMessages(req, res, next) {
    try {
      const { conversationId } = req.params
      const { limit = 50, lastEvaluatedKey = null } = req.query

      let parsedLastEvaluatedKey = null
      if (lastEvaluatedKey && typeof lastEvaluatedKey === 'string') {
        try {
          parsedLastEvaluatedKey = JSON.parse(lastEvaluatedKey)
        } catch (_) {
          parsedLastEvaluatedKey = null
        }
      } else if (lastEvaluatedKey && typeof lastEvaluatedKey === 'object') {
        parsedLastEvaluatedKey = lastEvaluatedKey
      }

      const result = await messageService.getConversationMessages(
        conversationId,
        req.userId,
        parseInt(limit),
        parsedLastEvaluatedKey
      )

      res.status(200).json({ 
        messages: result.messages,
        lastEvaluatedKey: result.lastEvaluatedKey
      })
    } catch (err) {
      next(err)
    }
  }

  async markAsDelivered(req, res, next) {
    try {
      const { conversationId, messageId } = req.params
      const message = await messageService.markAsDeliveredInConversation(
        conversationId,
        messageId,
        req.userId
      )

      res.status(200).json({
        message: 'Message marked as delivered',
        data: message,
      })
    } catch (err) {
      next(err)
    }
  }

  async markAsSeen(req, res, next) {
    try {
      const { conversationId } = req.params
      await messageService.markAsSeen(conversationId, req.userId)

      res.status(200).json({ message: 'Messages marked as seen' })
    } catch (err) {
      next(err)
    }
  }

  async editMessage(req, res, next) {
    try {
      const { conversationId, messageId } = req.params
      const { content } = req.body

      if (!content) {
        return res.status(400).json({ error: 'Content is required' })
      }

      const message = await messageService.editMessage(
        conversationId,
        messageId,
        req.userId,
        content
      )

      const io = getIO()
      if (io) {
        io.to(`conversation:${conversationId}`).emit('message:edited', {
          message,
        })
      }

      res.status(200).json({
        message: 'Message edited successfully',
        data: message,
      })
    } catch (err) {
      res.status(400).json({ error: err.message })
    }
  }

  async deleteMessage(req, res, next) {
    try {
      const { conversationId, messageId } = req.params
      const message = await messageService.deleteMessage(
        conversationId,
        messageId,
        req.userId
      )

      const io = getIO()
      if (io) {
        io.to(`conversation:${conversationId}`).emit('message:deleted', {
          messageId,
        })
      }

      res.status(200).json({
        message: 'Message deleted successfully',
        data: message,
      })
    } catch (err) {
      res.status(400).json({ error: err.message })
    }
  }

  async addEmoji(req, res, next) {
    try {
      const { conversationId, messageId } = req.params
      const { emoji } = req.body

      if (!emoji) {
        return res.status(400).json({ error: 'Emoji is required' })
      }

      const message = await messageService.addEmoji(
        conversationId,
        messageId,
        req.userId,
        emoji
      )

      const io = getIO()
      if (io) {
        io.to(`conversation:${conversationId}`).emit('message:emoji', {
          message,
        })
      }

      res.status(200).json({
        message: 'Emoji added successfully',
        data: message,
      })
    } catch (err) {
      next(err)
    }
  }

  async removeEmoji(req, res, next) {
    try {
      const { conversationId, messageId } = req.params
      const { emoji } = req.body

      if (!emoji) {
        return res.status(400).json({ error: 'Emoji is required' })
      }

      const message = await messageService.removeEmoji(
        conversationId,
        messageId,
        req.userId,
        emoji
      )

      const io = getIO()
      if (io) {
        io.to(`conversation:${conversationId}`).emit('message:emoji', {
          message,
        })
      }

      res.status(200).json({
        message: 'Emoji removed successfully',
        data: message,
      })
    } catch (err) {
      next(err)
    }
  }
}

export default new MessageController()
