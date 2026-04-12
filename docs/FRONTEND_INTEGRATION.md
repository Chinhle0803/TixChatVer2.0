# Frontend Integration Guide - User Profile Features

## Overview

This guide explains how to integrate the new user profile features into the React frontend application.

## API Service Helper

Update or create `frontend/src/services/api.js` to include these new endpoints:

```javascript
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
})

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// User Profile APIs
export const userApi = {
  // Get current user profile
  getProfile: () => api.get('/users/profile/current'),

  // Get another user's profile
  getUserProfile: (userId) => api.get(`/users/profile/${userId}`),

  // Update profile (fullName, bio)
  updateProfile: (data) => api.put('/users/profile', data),

  // Change password
  changePassword: (currentPassword, newPassword, confirmPassword) =>
    api.post('/users/password/change', {
      currentPassword,
      newPassword,
      confirmPassword,
    }),

  // Upload avatar
  uploadAvatar: (file) => {
    const formData = new FormData()
    formData.append('avatar', file)
    return api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  // Search users
  searchUsers: (query, limit = 10) =>
    api.get('/users/search', { params: { q: query, limit } }),

  // Friends
  addFriend: (friendId) => api.post('/users/friend/add', { friendId }),
  removeFriend: (friendId) => api.post('/users/friend/remove', { friendId }),
  getFriends: () => api.get('/users/friends'),

  // Block/Unblock
  blockUser: (userId) => api.post('/users/block', { userId }),
  unblockUser: (userId) => api.post('/users/unblock', { userId }),
}

export default api
```

## React Hooks for Profile Management

Create `frontend/src/hooks/useProfile.js`:

```javascript
import { useState, useCallback } from 'react'
import { userApi } from '../services/api'

export const useProfile = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await userApi.getProfile()
      setUser(response.data.user)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch profile')
    } finally {
      setLoading(false)
    }
  }, [])

  const changePassword = useCallback(
    async (currentPassword, newPassword, confirmPassword) => {
      setLoading(true)
      setError(null)
      try {
        await userApi.changePassword(currentPassword, newPassword, confirmPassword)
        return { success: true }
      } catch (err) {
        const errorMessage = err.response?.data?.error || 'Failed to change password'
        setError(errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const updateAvatar = useCallback(async (file) => {
    setLoading(true)
    setError(null)
    try {
      const response = await userApi.uploadAvatar(file)
      setUser(response.data.user)
      return { success: true, avatarUrl: response.data.user.avatar }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to upload avatar'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  const updateProfile = useCallback(async (data) => {
    setLoading(true)
    setError(null)
    try {
      const response = await userApi.updateProfile(data)
      setUser(response.data.user)
      return { success: true }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to update profile'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    user,
    loading,
    error,
    fetchProfile,
    changePassword,
    updateAvatar,
    updateProfile,
  }
}
```

## Component Examples

### 1. Profile View Component

Create `frontend/src/components/ProfileView.jsx`:

```jsx
import React, { useEffect } from 'react'
import { useProfile } from '../hooks/useProfile'
import '../styles/ProfileView.css'

export const ProfileView = () => {
  const { user, loading, error, fetchProfile } = useProfile()

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  if (loading) return <div className="loading">Loading profile...</div>

  if (error) return <div className="error">{error}</div>

  if (!user) return <div>No user data</div>

  return (
    <div className="profile-view">
      <div className="profile-header">
        <div className="avatar-section">
          {user.avatar ? (
            <img src={user.avatar} alt={user.username} className="avatar" />
          ) : (
            <div className="avatar-placeholder">{user.username[0]?.toUpperCase()}</div>
          )}
        </div>

        <div className="profile-info">
          <h2>{user.fullName}</h2>
          <p className="username">@{user.username}</p>
          <p className="email">{user.email}</p>
          {user.bio && <p className="bio">{user.bio}</p>}
          <div className="status">
            <span className={`online-badge ${user.isOnline ? 'online' : 'offline'}`}>
              {user.isOnline ? 'Online' : `Last seen: ${new Date(user.lastSeen).toLocaleDateString()}`}
            </span>
          </div>
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat">
          <span className="stat-label">Friends</span>
          <span className="stat-value">{user.friends?.length || 0}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Member Since</span>
          <span className="stat-value">{new Date(user.createdAt).getFullYear()}</span>
        </div>
      </div>
    </div>
  )
}

export default ProfileView
```

### 2. Change Password Component

Create `frontend/src/components/ChangePasswordModal.jsx`:

```jsx
import React, { useState } from 'react'
import { useProfile } from '../hooks/useProfile'
import '../styles/ChangePasswordModal.css'

export const ChangePasswordModal = ({ onClose }) => {
  const { changePassword, loading, error } = useProfile()
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [success, setSuccess] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.currentPassword) {
      errors.currentPassword = 'Current password is required'
    }

    if (!formData.newPassword) {
      errors.newPassword = 'New password is required'
    } else if (formData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters'
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    const result = await changePassword(
      formData.currentPassword,
      formData.newPassword,
      formData.confirmPassword
    )

    if (result.success) {
      setSuccess(true)
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => {
        onClose()
      }, 2000)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Change Password</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {success && (
          <div className="success-message">
            Password changed successfully!
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="change-password-form">
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="Enter current password"
              disabled={loading}
            />
            {validationErrors.currentPassword && (
              <span className="error">{validationErrors.currentPassword}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter new password"
              disabled={loading}
            />
            {validationErrors.newPassword && (
              <span className="error">{validationErrors.newPassword}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              disabled={loading}
            />
            {validationErrors.confirmPassword && (
              <span className="error">{validationErrors.confirmPassword}</span>
            )}
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChangePasswordModal
```

### 3. Avatar Upload Component

Create `frontend/src/components/AvatarUpload.jsx`:

```jsx
import React, { useRef, useState } from 'react'
import { useProfile } from '../hooks/useProfile'
import '../styles/AvatarUpload.css'

export const AvatarUpload = ({ user, onSuccess }) => {
  const fileInputRef = useRef(null)
  const { updateAvatar, loading, error } = useProfile()
  const [preview, setPreview] = useState(null)
  const [uploadError, setUploadError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Only JPEG, PNG, GIF, and WebP images are allowed')
      return
    }

    // Validate file size (50MB)
    if (file.size > 50 * 1024 * 1024) {
      setUploadError('File size must be less than 50MB')
      return
    }

    setUploadError(null)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) {
      setUploadError('Please select a file first')
      return
    }

    const file = fileInputRef.current.files[0]
    const result = await updateAvatar(file)

    if (result.success) {
      setSuccess(true)
      setPreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      setTimeout(() => {
        setSuccess(false)
        onSuccess?.(result.avatarUrl)
      }, 2000)
    } else {
      setUploadError(result.error)
    }
  }

  const handleCancel = () => {
    setPreview(null)
    setUploadError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="avatar-upload">
      {success && <div className="success-message">Avatar updated successfully!</div>}

      {(error || uploadError) && (
        <div className="error-message">{error || uploadError}</div>
      )}

      <div className="avatar-preview-section">
        {preview ? (
          <img src={preview} alt="Preview" className="avatar-preview" />
        ) : user?.avatar ? (
          <img src={user.avatar} alt={user.username} className="avatar-preview" />
        ) : (
          <div className="avatar-placeholder">
            {user?.username?.[0]?.toUpperCase() || '?'}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="file-input"
        disabled={loading}
      />

      <div className="button-group">
        <button
          className="btn-primary"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
        >
          Select Image
        </button>

        {preview && (
          <>
            <button
              className="btn-success"
              onClick={handleUpload}
              disabled={loading}
            >
              {loading ? 'Uploading...' : 'Upload'}
            </button>
            <button
              className="btn-secondary"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
          </>
        )}
      </div>

      <p className="help-text">
        Supported formats: JPEG, PNG, GIF, WebP (Max 50MB)
      </p>
    </div>
  )
}

export default AvatarUpload
```

## Styling Examples

Create `frontend/src/styles/ProfileView.css`:

```css
.profile-view {
  background: #fff;
  border-radius: 8px;
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
}

.profile-header {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 2rem;
}

.avatar-section {
  flex-shrink: 0;
}

.avatar,
.avatar-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: bold;
  color: #999;
}

.profile-info h2 {
  margin: 0 0 0.5rem 0;
  font-size: 24px;
}

.username {
  color: #666;
  margin: 0.5rem 0;
}

.email {
  color: #999;
  font-size: 14px;
  margin: 0.5rem 0;
}

.bio {
  color: #333;
  margin: 1rem 0 0 0;
  line-height: 1.5;
}

.online-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 12px;
  margin-top: 1rem;
}

.online-badge.online {
  background: #d4edda;
  color: #155724;
}

.online-badge.offline {
  background: #f8d7da;
  color: #721c24;
}

.profile-stats {
  display: flex;
  gap: 2rem;
  justify-content: center;
}

.stat {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #999;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #333;
}
```

Create `frontend/src/styles/ChangePasswordModal.css`:

```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #fff;
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #999;
}

.change-password-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-group .error {
  display: block;
  color: #dc3545;
  font-size: 12px;
  margin-top: 0.25rem;
}

.btn-primary {
  width: 100%;
  padding: 0.75rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.success-message {
  background: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  border: 1px solid #c3e6cb;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  border: 1px solid #f5c6cb;
}
```

Create `frontend/src/styles/AvatarUpload.css`:

```css
.avatar-upload {
  background: #fff;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
}

.avatar-preview-section {
  margin-bottom: 2rem;
}

.avatar-preview,
.avatar-placeholder {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  background: #f0f0f0;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
  font-weight: bold;
  color: #999;
}

.file-input {
  display: none;
}

.button-group {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary,
.btn-success,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover {
  background: #218838;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-primary:disabled,
.btn-success:disabled,
.btn-secondary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.success-message,
.error-message {
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
}

.success-message {
  background: #d4edda;
  color: #155724;
  border-color: #c3e6cb;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  border-color: #f5c6cb;
}

.help-text {
  font-size: 12px;
  color: #999;
  margin-top: 1rem;
}
```

## Integration into Main Pages

Update `frontend/src/pages/ChatPage.jsx` or create a Profile Settings page:

```jsx
import React, { useState } from 'react'
import ProfileView from '../components/ProfileView'
import AvatarUpload from '../components/AvatarUpload'
import ChangePasswordModal from '../components/ChangePasswordModal'
import { useProfile } from '../hooks/useProfile'

export const ProfileSettingsPage = () => {
  const { user, fetchProfile } = useProfile()
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  const handleAvatarSuccess = () => {
    fetchProfile()
  }

  return (
    <div className="profile-settings-page">
      <h1>Profile Settings</h1>

      <section>
        <h2>Profile Information</h2>
        <ProfileView />
      </section>

      <section>
        <h2>Avatar</h2>
        <AvatarUpload user={user} onSuccess={handleAvatarSuccess} />
      </section>

      <section>
        <h2>Security</h2>
        <button onClick={() => setShowPasswordModal(true)}>
          Change Password
        </button>
      </section>

      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </div>
  )
}

export default ProfileSettingsPage
```

## Environment Variables

Update `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## Testing Checklist

- [ ] View profile loads successfully
- [ ] All user fields display correctly
- [ ] Avatar displays with proper styling
- [ ] Change password form validates inputs
- [ ] Password change succeeds with correct data
- [ ] Password change fails with wrong current password
- [ ] Avatar upload accepts image files
- [ ] Avatar upload rejects non-image files
- [ ] Avatar upload shows preview
- [ ] Avatar upload displays success message
- [ ] New avatar URL updates in profile
- [ ] Error messages display properly

---

**Last Updated:** June 8, 2024
