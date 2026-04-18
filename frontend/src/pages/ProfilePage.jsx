import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { userService } from '../services/api'
import { useDialog } from '../context/DialogContext'
import '../styles/ProfilePage.css'

const ProfilePage = () => {
  const navigate = useNavigate()
  const { confirm } = useDialog()
  const { user, logout, updateUser } = useAuthStore()

  // Form states
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [avatar, setAvatar] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  // UI states
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || user.fullName || user.username || '')
      setBio(user.bio || '')
      setAvatar(user.avatar || '')
      setAvatarPreview(user.avatar || '')
    }
  }, [user])

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 4000)
  }

  // Handle avatar file selection
  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showMessage('error', 'Kích thước tệp không được vượt quá 5MB')
        return
      }

      if (!file.type.startsWith('image/')) {
        showMessage('error', 'Vui lòng chọn một tệp hình ảnh')
        return
      }

      setAvatarFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Upload avatar
  const handleUploadAvatar = async () => {
    if (!avatarFile) {
      showMessage('error', 'Vui lòng chọn một hình ảnh')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('avatar', avatarFile)

      const response = await userService.updateAvatar(formData)
      const updatedUser = { ...user, avatar: response.data.user.avatar }
      updateUser(updatedUser)
      setAvatar(response.data.user.avatar)
      setAvatarFile(null)

      showMessage('success', 'Avatar cập nhật thành công!')
    } catch (err) {
      console.error('Avatar upload error:', err)
      showMessage('error', err.response?.data?.error || 'Lỗi khi tải avatar')
    } finally {
      setLoading(false)
    }
  }

  // Update profile info
  const handleUpdateProfile = async () => {
    if (!displayName.trim()) {
      showMessage('error', 'Tên hiển thị không được trống')
      return
    }

    setLoading(true)
    try {
      const response = await userService.updateProfile({
        displayName: displayName.trim(),
        bio: bio.trim(),
      })

      const updatedUser = {
        ...user,
        displayName: response.data.user.fullName || response.data.user.displayName,
        fullName: response.data.user.fullName,
        bio: response.data.user.bio,
      }
      updateUser(updatedUser)
      showMessage('success', 'Hồ sơ cập nhật thành công!')
      
      setTimeout(() => {
        navigate('/')
      }, 500)
    } catch (err) {
      console.error('Profile update error:', err)
      showMessage('error', err.response?.data?.error || 'Lỗi khi cập nhật hồ sơ')
    } finally {
      setLoading(false)
    }
  }

  // Change password
  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword) {
      showMessage('error', 'Vui lòng nhập mật khẩu hiện tại')
      return
    }

    if (!newPassword) {
      showMessage('error', 'Vui lòng nhập mật khẩu mới')
      return
    }

    if (newPassword.length < 6) {
      showMessage('error', 'Mật khẩu mới phải có ít nhất 6 ký tự')
      return
    }

    if (newPassword !== confirmPassword) {
      showMessage('error', 'Mật khẩu xác nhận không khớp')
      return
    }

    if (currentPassword === newPassword) {
      showMessage('error', 'Mật khẩu mới không được giống mật khẩu hiện tại')
      return
    }

    setLoading(true)
    try {
      await userService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      })

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowPasswordForm(false)
      showMessage('success', 'Mật khẩu đã được thay đổi thành công!')
    } catch (err) {
      console.error('Password change error:', err)
      showMessage('error', err.response?.data?.error || 'Lỗi khi thay đổi mật khẩu')
    } finally {
      setLoading(false)
    }
  }

  // Logout
  const handleLogout = async () => {
    const shouldLogout = await confirm({
      title: 'Xác nhận đăng xuất',
      message: 'Bạn có chắc chắn muốn đăng xuất?',
      confirmText: 'Đăng xuất',
      cancelText: 'Ở lại',
      variant: 'warning',
    })

    if (!shouldLogout) return

    await logout()
    navigate('/auth/login')
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field],
    })
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Header */}
        <div className="profile-header">
          <button className="back-btn" onClick={() => navigate('/')}>
            ← Quay Về
          </button>
          <h1>Hồ Sơ Cá Nhân</h1>
        </div>

        {/* Content */}
        <div className="profile-content">
          {/* Messages */}
          {message.text && (
            <div className={`${message.type}-message`}>
              {message.text}
            </div>
          )}

          {/* Avatar Section */}
          <div className="avatar-section">
            <div className="profile-avatar-container">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Profile" className="profile-avatar" />
              ) : (
                <div className="profile-avatar">Ảnh</div>
              )}
              <button
                className="avatar-upload-btn"
                onClick={() => document.getElementById('avatar-input').click()}
                title="Thay đổi avatar"
              >
                +
              </button>
              <input
                id="avatar-input"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </div>

            {avatarFile && (
              <div className="profile-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleUploadAvatar}
                  disabled={loading}
                >
                  {loading ? 'Đang tải...' : 'Tải Avatar'}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setAvatarFile(null)
                    setAvatarPreview(avatar)
                  }}
                  disabled={loading}
                >
                  Hủy
                </button>
              </div>
            )}
          </div>

          {/* Profile Info Section */}
          <div className="profile-section">
            <h2>Thông Tin Cá Nhân</h2>

            <div className="form-group">
              <label>Tên Hiển Thị</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Nhập tên hiển thị"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Tên Đăng Nhập</label>
              <input
                type="text"
                value={user?.username || ''}
                disabled
                style={{ backgroundColor: '#e8e8e8' }}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                style={{ backgroundColor: '#e8e8e8' }}
              />
            </div>

            <div className="form-group">
              <label>Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Viết một chút về bạn..."
                disabled={loading}
                maxLength={200}
              />
              <small>{bio.length}/200</small>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleUpdateProfile}
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Đang cập nhật...' : 'Lưu Thay Đổi'}
            </button>
          </div>

          {/* Change Password Section */}
          <div className="profile-section">
            <button
              className="btn btn-secondary"
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              style={{ width: '100%' }}
            >
              {showPasswordForm ? 'Hủy' : 'Đổi Mật Khẩu'}
            </button>

            {showPasswordForm && (
              <div className="password-form-container">
                <h2>Đổi Mật Khẩu</h2>

                <div className="form-group password-group">
                  <label>Mật Khẩu Hiện Tại</label>
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Nhập mật khẩu hiện tại"
                    disabled={loading}
                  />
                  <button
                    className="toggle-password"
                    onClick={() => togglePasswordVisibility('current')}
                    type="button"
                  >
                    {showPasswords.current ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>

                <div className="form-group password-group">
                  <label>Mật Khẩu Mới</label>
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới"
                    disabled={loading}
                  />
                  <button
                    className="toggle-password"
                    onClick={() => togglePasswordVisibility('new')}
                    type="button"
                  >
                    {showPasswords.new ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>

                <div className="form-group password-group">
                  <label>Xác Nhận Mật Khẩu</label>
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    disabled={loading}
                  />
                  <button
                    className="toggle-password"
                    onClick={() => togglePasswordVisibility('confirm')}
                    type="button"
                  >
                    {showPasswords.confirm ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>

                <button
                  className="btn btn-danger"
                  onClick={handleChangePassword}
                  disabled={loading}
                  style={{ width: '100%' }}
                >
                  {loading ? 'Đang xử lý...' : 'Xác Nhận Đổi Mật Khẩu'}
                </button>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button className="logout-btn" onClick={handleLogout}>
            Đăng Xuất
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
