# Auth Pages - Hướng Dẫn Hoàn Chỉnh

## 📋 Tổng Quan

Hệ thống xác thực TixChat bao gồm 3 trang chính:
- **LoginPage**: Đăng nhập tài khoản
- **RegisterPage**: Đăng ký tài khoản mới
- **ForgotPasswordPage**: Lấy lại mật khẩu (3 bước)

Tất cả được quản lý thông qua **AuthContainer** component.

---

## 🎨 Giao Diện & Tính Năng

### LoginPage - Đăng Nhập

**Tính năng:**
- ✅ Nhập email & mật khẩu
- ✅ Hiển/ẩn mật khẩu
- ✅ Validation realtime
- ✅ Quên mật khẩu (link)
- ✅ Chuyển sang đăng ký
- ✅ Demo credentials hiển thị
- ✅ Loading state & error messages

**Validation:**
```javascript
- Email: bắt buộc, định dạng hợp lệ
- Password: bắt buộc, tối thiểu 6 ký tự
```

**Demo Account:**
```
Email: demo@example.com
Password: 123456
```

---

### RegisterPage - Đăng Ký

**Tính năng:**
- ✅ Nhập username, email, fullName, mật khẩu
- ✅ Validation realtime cho từng trường
- ✅ Password strength indicator (5 cấp độ)
- ✅ Xác nhận mật khẩu
- ✅ Hiển/ẩn mật khẩu
- ✅ Check validation tức thời
- ✅ Loading state & error messages

**Validation:**
```javascript
Username:
- Bắt buộc
- 3-30 ký tự
- Chỉ chứa chữ cái & số

Email:
- Bắt buộc
- Định dạng email hợp lệ

Full Name:
- Bắt buộc
- 2-100 ký tự

Password:
- Bắt buộc
- Tối thiểu 6 ký tự
- Có chỉ số mạnh:
  * 6+ ký tự: Weak
  * 8+ ký tự: Fair
  * Có chữ hoa: Good
  * Có số: Strong
  * Có ký tự đặc biệt: Very Strong

Confirm Password:
- Phải trùng với password
```

**Password Strength Levels:**
```
1. Weak (Đỏ) - 20%
2. Fair (Cam) - 40%
3. Good (Xanh) - 60%
4. Strong (Xanh lá) - 80%
5. Very Strong (Xanh lá) - 100%
```

---

### ForgotPasswordPage - Quên Mật Khẩu

**3 Bước:**

#### Bước 1: Nhập Email
```
- Nhập email đã đăng ký
- Validation email format
- Gửi yêu cầu reset
- Hiển thị verification code (demo)
```

#### Bước 2: Xác Thực Code
```
- Nhập 6 chữ số từ email
- Uppercase tự động
- Code hết hạn sau 15 phút
- Verify code
```

#### Bước 3: Reset Mật Khẩu
```
- Nhập mật khẩu mới
- Xác nhận mật khẩu
- Validation độ mạnh
- Reset thành công → quay về login
```

**Progress Steps:**
```
Step 1: Email ─→ Step 2: Verify ─→ Step 3: Reset
```

---

## 🔧 Backend API

### Endpoint

```
POST /api/auth/login
- Body: { email, password }
- Return: { user, accessToken, refreshToken }
- Status: 200

POST /api/auth/register
- Body: { username, email, fullName, password, confirmPassword }
- Return: { userId, username, email, fullName }
- Status: 201

POST /api/auth/forgot-password
- Body: { email }
- Return: { message, verificationToken* }
- Status: 200
- *verificationToken chỉ cho demo

POST /api/auth/verify-reset-token
- Body: { email, token }
- Return: { message }
- Status: 200

POST /api/auth/reset-password
- Body: { email, token, newPassword, confirmPassword }
- Return: { message }
- Status: 200
```

---

## 📁 File Structure

```
frontend/src/
├── pages/
│   ├── AuthContainer.jsx       (Quản lý routing auth)
│   ├── LoginPage.jsx            (Form đăng nhập)
│   ├── RegisterPage.jsx         (Form đăng ký)
│   └── ForgotPasswordPage.jsx   (Form quên mật khẩu)
├── styles/
│   └── Auth.css                 (Toàn bộ styling auth)
├── hooks/
│   └── useAuth.js               (Auth logic)
├── store/
│   └── authStore.js             (Auth state)
├── services/
│   └── api.js                   (API calls)
└── App.jsx                      (Router setup)

backend/src/
├── models/
│   └── User.js                  (User schema + reset fields)
├── services/
│   └── AuthService.js           (forgotPassword, resetPassword)
├── controllers/
│   └── AuthController.js        (Auth endpoints)
├── routes/
│   └── auth.js                  (Auth routes)
├── events/
│   └── EventTypes.js            (PASSWORD_RESET event)
└── utils/
    └── validation.js            (Reset validation schemas)
```

---

## 🚀 Sử Dụng

### Login
```javascript
import { useAuth } from './hooks/useAuth'

function MyComponent() {
  const { login, loading, error } = useAuth()
  
  const handleLogin = async (email, password) => {
    try {
      await login(email, password)
      // Tự động navigate to /chat
    } catch (err) {
      console.error(err)
    }
  }
}
```

### Register
```javascript
const { register } = useAuth()

const handleRegister = async (formData) => {
  try {
    await register(formData)
    // Navigate to login
  } catch (err) {
    console.error(err)
  }
}
```

### Forgot Password
```javascript
import ForgotPasswordPage from './pages/ForgotPasswordPage'

<ForgotPasswordPage 
  onSwitchToLogin={() => setCurrentPage('login')}
  onSuccess={() => setCurrentPage('login')}
/>
```

---

## 🎯 CSS Classes Chính

```css
.auth-container         /* Container chính */
.auth-form-container    /* Card form */
.auth-form              /* Form */
.form-group             /* Mỗi input + label */
.form-label             /* Label */
.form-input             /* Input field */
.form-input-wrapper     /* Input + icon wrapper */
.form-error             /* Error message */
.form-button            /* Submit button */
.button-primary         /* Primary button style */
.form-link              /* Link button */
.password-strength      /* Password strength bar */
.progress-steps         /* Step indicator */
.form-alert             /* Alert messages */
.alert-error            /* Error alert */
.alert-success          /* Success alert */
```

---

## 🔐 Security Features

### Frontend
- ✅ Client-side validation
- ✅ Password masked input
- ✅ JWT token stored in localStorage
- ✅ Auto token refresh on 403
- ✅ Disabled form during submission

### Backend
- ✅ Bcrypt password hashing (salt: 10)
- ✅ JWT access token (7 days)
- ✅ JWT refresh token (30 days)
- ✅ Email verification code (15 min expiry)
- ✅ Input validation (Joi)
- ✅ SQL injection prevention
- ✅ CORS enabled
- ✅ Error messages không leak thông tin

---

## 📱 Responsive Design

```css
Desktop (> 600px):
- Full width form (450px max)
- Step labels visible
- All decorations visible

Tablet (600px - 400px):
- Padding reduced
- Font sizes smaller
- Decorations hidden
- Step labels hidden

Mobile (< 400px):
- 16px font size (prevent iOS zoom)
- Minimal padding
- Optimized for touch
```

---

## 🌙 Dark Mode

Tự động adapt với system preference:
```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #2c2f33;
    --text-primary: #ffffff;
    ...
  }
}
```

---

## 🐛 Troubleshooting

### Problem: "Invalid email or password"
**Solution**: 
- Kiểm tra email tồn tại
- Kiểm tra password đúng
- Check backend connection

### Problem: "Username or email already in use"
**Solution**:
- Chọn username/email khác
- Check database

### Problem: Password reset không nhận code
**Solution**:
- Check email trong spam
- Code hết hạn sau 15 phút
- Yêu cầu code mới

### Problem: Form không submit
**Solution**:
- Kiểm tra validation errors
- Kiểm tra network connection
- Check console errors

---

## 📊 Event Flow

```
Login:
User Input → Validation → API Call → Store JWT → Navigate to /chat

Register:
User Input → Validation → API Call → Success → Navigate to Login

Forgot Password:
Step 1: Email → API Call → Send Code
Step 2: Code → Verify Code → Success
Step 3: New Password → Reset → Navigate to Login
```

---

## 🔄 Token Refresh Flow

```
Client Request
    ↓
Check Access Token (Valid?)
    ├─ Yes → Send Request
    └─ No → Check Refresh Token
         ├─ Valid → Get New Access Token
         │          Send Request (Retry)
         └─ Invalid → Logout & Redirect to Login
```

---

## 🎨 Color Scheme

```javascript
Primary:     #5865f2 (Discord Blue)
Primary Dark: #4752c4
Success:     #57f287 (Green)
Danger:      #ed4245 (Red)
Warning:     #faa61a (Orange)
Background:  #ffffff
Text:        #2c3e50
```

---

## ⌨️ Keyboard Navigation

```
Tab       → Move to next field
Shift+Tab → Move to previous field
Enter     → Submit form
Escape    → Close (if modal)
```

---

## 📈 Performance

- ✅ CSS animations optimized (transform, opacity)
- ✅ Form validation debounced
- ✅ Images optimized (emoji only)
- ✅ Minimal re-renders
- ✅ Fast initial load

---

## 📝 Notes

1. **Verification Code Demo**: Hiển thị code cho testing. Xóa trong production.
2. **Email Send**: Đang mock. Integrate Nodemailer/SendGrid trong production.
3. **Password Reset**: Code hết hạn 15 phút. Có thể adjust trong AuthService.
4. **localStorage**: Token stored. Xem xét dùng secure cookies trong production.

---

## 🔗 Related Documentation

- [API Documentation](./API.md)
- [Database Schema](./DATABASE.md)
- [Architecture Overview](./ARCHITECTURE.md)
- [Setup Guide](./SETUP.md)

---

**Last Updated**: April 2026
**Version**: 1.0.0
