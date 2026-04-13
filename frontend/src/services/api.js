import axios from 'axios'
import useAuthStore from '../store/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState()
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Add response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const { refreshToken } = useAuthStore.getState()
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken,
        })

        const { accessToken } = response.data
        useAuthStore.setState({ accessToken })
        localStorage.setItem('accessToken', accessToken)

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        useAuthStore.getState().logout()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export const authService = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  logout: () => apiClient.post('/auth/logout'),
  getMe: () => apiClient.get('/auth/me'),
}

export const userService = {
  getProfile: (userId) => apiClient.get(`/users/profile/${userId}`),
  getCurrentProfile: () => apiClient.get('/users/profile/current'),
  updateProfile: (data) => apiClient.put('/users/profile', data),
  updateAvatar: (formData) => apiClient.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  changePassword: (data) => apiClient.post('/users/password/change', data),
  searchUsers: (query) => apiClient.get('/users/search', { params: { q: query } }),
  getFriends: () => apiClient.get('/users/friends'),
  getFriendRequests: () => apiClient.get('/users/friend/requests'),
  sendFriendRequest: (friendId) => apiClient.post('/users/friend/request', { friendId }),
  acceptFriendRequest: (requesterId) => apiClient.post('/users/friend/accept', { requesterId }),
  rejectFriendRequest: (requesterId) => apiClient.post('/users/friend/reject', { requesterId }),
  addFriend: (friendId) => apiClient.post('/users/friend/add', { friendId }),
  removeFriend: (friendId) => apiClient.post('/users/friend/remove', { friendId }),
  getOnlineUsers: () => apiClient.get('/users/online'),
  blockUser: (userId) => apiClient.post('/users/block', { userId }),
  unblockUser: (userId) => apiClient.post('/users/unblock', { userId }),
}

export const conversationService = {
  createConversation: (type, participantIds, name = null) => {
    const payload = { type, participantIds }

    if (type === 'group' && typeof name === 'string' && name.trim()) {
      payload.name = name.trim()
    }

    return apiClient.post('/conversations', payload)
  },
  getConversations: (limit = 20, skip = 0) =>
    apiClient.get('/conversations', { params: { limit, skip } }),
  getConversation: (conversationId) =>
    apiClient.get(`/conversations/${conversationId}`),
  updateConversation: (conversationId, data) =>
    apiClient.put(`/conversations/${conversationId}`, data),
  addParticipant: (conversationId, participantId) =>
    apiClient.post(`/conversations/${conversationId}/participants`, { participantId }),
  removeParticipant: (conversationId, participantId) =>
    apiClient.delete(`/conversations/${conversationId}/participants/${participantId}`),
  archiveConversation: (conversationId) =>
    apiClient.post(`/conversations/${conversationId}/archive`),
  deleteConversation: (conversationId) =>
    apiClient.delete(`/conversations/${conversationId}`),
  searchConversations: (query) =>
    apiClient.get('/conversations/search', { params: { q: query } }),
}

export const messageService = {
  sendMessage: (conversationId, content, replyTo = null) => {
    const payload = { conversationId, content }
    if (replyTo) {
      payload.replyTo = replyTo
    }
    console.log('📤 Sending message via API:', payload)
    return apiClient.post('/messages', payload)
  },
  getMessages: (conversationId, limit = 50, lastEvaluatedKey = null) => {
    const serializedKey =
      lastEvaluatedKey && typeof lastEvaluatedKey === 'object'
        ? JSON.stringify(lastEvaluatedKey)
        : lastEvaluatedKey

    return apiClient.get(`/messages/${conversationId}`, {
      params: { limit, lastEvaluatedKey: serializedKey },
    })
  },
  editMessage: (conversationId, messageId, content) =>
    apiClient.put(`/messages/${conversationId}/${messageId}`, { content }),
  deleteMessage: (conversationId, messageId) =>
    apiClient.delete(`/messages/${conversationId}/${messageId}`),
  markAsDelivered: (conversationId, messageId) =>
    apiClient.post(`/messages/${conversationId}/${messageId}/delivered`),
  markAsSeen: (conversationId) =>
    apiClient.post(`/messages/${conversationId}/seen`),
  getUnreadCounts: () => apiClient.get('/messages/unread/counts'),
  addEmoji: (conversationId, messageId, emoji) =>
    apiClient.post(`/messages/${conversationId}/${messageId}/emoji`, { emoji }),
  removeEmoji: (conversationId, messageId, emoji) =>
    apiClient.delete(`/messages/${conversationId}/${messageId}/emoji`, { data: { emoji } }),
}

export default apiClient
