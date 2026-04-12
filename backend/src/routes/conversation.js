import { Router } from 'express'
import conversationController from '../controllers/ConversationController.js'
import { authenticateToken } from '../middleware/auth.js'

const router = Router()

router.use(authenticateToken)

router.post('/', conversationController.createConversation.bind(conversationController))
router.get('/', conversationController.getUserConversations.bind(conversationController))
router.get('/search', conversationController.searchConversations.bind(conversationController))
router.get('/:conversationId', conversationController.getConversation.bind(conversationController))
router.put('/:conversationId', conversationController.updateConversation.bind(conversationController))
router.post('/:conversationId/participants', conversationController.addParticipant.bind(conversationController))
router.delete('/:conversationId/participants/:participantId', conversationController.removeParticipant.bind(conversationController))
router.post('/:conversationId/archive', conversationController.archiveConversation.bind(conversationController))
router.delete('/:conversationId', conversationController.deleteConversation.bind(conversationController))

export default router
