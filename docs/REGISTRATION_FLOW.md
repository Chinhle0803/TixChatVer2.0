# Luồng Hoạt Động Của Việc Đăng Ký (Registration Flow)

## 📋 Tổng Quan
Quy trình đăng ký người dùng mới trong ứng dụng TixChat bao gồm các bước xác thực, lưu trữ dữ liệu, và phát sự kiện thông báo.

---

## 🔄 Luồng Chi Tiết

### **1. Frontend - RegisterPage.jsx**

#### Bước 1: Nhập Dữ Liệu Người Dùng
```
Người dùng nhập thông tin vào form:
├── Username (tên người dùng)
├── Email
├── Full Name (tên đầy đủ)
├── Password (mật khẩu)
└── Confirm Password (xác nhận mật khẩu)
```

#### Bước 2: Kiểm Tra Validation Thời Gian Thực
Khi người dùng gõ, hàm `handleChange()` sẽ kiểm tra:

| Field | Validation Rules |
|-------|------------------|
| **Username** | • Bắt buộc<br>• Tối thiểu 3 ký tự<br>• Tối đa 30 ký tự<br>• Chỉ chứa chữ cái & số |
| **Email** | • Bắt buộc<br>• Định dạng email hợp lệ |
| **Full Name** | • Bắt buộc<br>• Tối thiểu 2 ký tự<br>• Tối đa 100 ký tự |
| **Password** | • Bắt buộc<br>• Tối thiểu 6 ký tự<br>• Hiển thị độ mạnh (Yếu/Tạm/Tốt/Mạnh/Rất Mạnh) |
| **Confirm Password** | • Bắt buộc<br>• Phải trùng khớp với Password |

#### Bước 3: Gửi Form
Khi người dùng nhấn nút "Đăng Ký":
```javascript
handleSubmit (e)
  ├── Gọi validateForm()
  │   └── Kiểm tra tất cả các field
  ├── Nếu hợp lệ → gọi register(formData)
  └── Nếu lỗi → hiển thị thông báo lỗi
```

---

### **2. Frontend Hook - useAuth.js**

#### Hàm `register(userData)`
```javascript
register(userData)
  ├── Đặt loading = true
  ├── Xóa error cũ
  ├── Gọi API: authService.register(userData)
  │   └── POST /api/auth/register
  ├── Nếu thành công:
  │   └── return response.data
  └── Nếu lỗi:
      ├── Lấy error message từ response
      ├── Đặt error state
      └── throw error
```

---

### **3. Frontend API Service - api.js**

#### API Client Configuration
```javascript
axios.create({
  baseURL: http://localhost:5000/api,
  headers: { 'Content-Type': 'application/json' }
})
```

#### Interceptors
- **Request Interceptor**: Thêm access token vào header nếu có
- **Response Interceptor**: Xử lý token expiration (refresh token nếu cần)

#### Register Endpoint
```javascript
authService.register(data)
  └── POST /auth/register
      ├── Header: Content-Type: application/json
      ├── Body: {
      │     username: string,
      │     email: string,
      │     password: string,
      │     fullName: string
      │   }
      └── Response: {
            message: "User registered successfully",
            user: { userId, username, email, fullName }
          }
```

---

### **4. Backend - AuthController.js**

#### Hàm `register(req, res, next)`
```javascript
register(req, res)
  ├── Lấy dữ liệu từ request body
  ├── Kiểm tra validation bằng registerValidation()
  │   └── Nếu lỗi → return 400 error
  ├── Gọi authService.register(value)
  ├── Nếu thành công → return 201 với user data
  └── Nếu lỗi → truyền cho error handler middleware
```

---

### **5. Backend - AuthService.js**

#### Hàm `register(userData)`
```
register({ username, email, password, fullName })
  │
  ├─ [1] Kiểm tra Email Tồn Tại?
  │   └── Gọi UserRepository.findByEmail(email)
  │       └── Nếu tồn tại → throw Error('Email already in use')
  │
  ├─ [2] Kiểm tra Username Tồn Tại?
  │   └── Gọi UserRepository.findByUsername(username)
  │       └── Nếu tồn tại → throw Error('Username already in use')
  │
  ├─ [3] Hash Password
  │   └── Gọi hashPassword(password)
  │       └── Sử dụng bcrypt với salt rounds
  │
  ├─ [4] Tạo User Mới
  │   └── Gọi UserRepository.create({
  │         username,
  │         email,
  │         password: hashedPassword,
  │         fullName
  │       })
  │
  ├─ [5] Phát Sự Kiện (Event)
  │   └── userEvents.emit(USER_EVENTS.REGISTERED, {
  │         userId,
  │         username,
  │         email
  │       })
  │
  └─ [6] Return User Info
      └── {
            userId,
            username,
            email,
            fullName
          }
```

---

### **6. Backend Validation - validation.js**

#### Schema `registerValidation(data)`
```javascript
const schema = joi.object({
  username: {
    • Phải là alphanumeric
    • Tối thiểu 3 ký tự
    • Tối đa 30 ký tự
    • Bắt buộc
  },
  email: {
    • Phải là email hợp lệ
    • Bắt buộc
  },
  password: {
    • Tối thiểu 6 ký tự
    • Bắt buộc
  },
  confirmPassword: {
    • Phải khớp với password
    • Bắt buộc
  },
  fullName: {
    • Tối thiểu 2 ký tự
    • Tối đa 100 ký tự
    • Bắt buộc
  }
})
```

---

### **7. Backend Database - UserRepository.js**

#### Hàm `create(userData)`
```javascript
create(userData)
  │
  ├─ [1] Tạo ID Mới
  │   └── userId = uuidv4()
  │
  ├─ [2] Tạo Item Object
  │   └── {
  │       userId: UUID,
  │       username: string,
  │       email: string,
  │       password: hashed,
  │       fullName: string,
  │       avatar: null,
  │       bio: '',
  │       isOnline: false,
  │       lastSeen: timestamp,
  │       friends: [],
  │       blockedUsers: [],
  │       resetPasswordToken: null,
  │       resetPasswordExpires: null,
  │       verificationToken: null,
  │       verificationTokenExpires: null,
  │       createdAt: timestamp,
  │       updatedAt: timestamp
  │     }
  │
  ├─ [3] Lưu vào DynamoDB
  │   └── docClient.send(PutCommand({
  │         TableName: 'tixchat-users',
  │         Item: item
  │       }))
  │
  └─ [4] Return Item
      └── Trả về user object vừa tạo
```

#### Index Cần Thiết
```
Primary Key: userId (Partition Key)

Secondary Indexes:
  • email-index (GSI)
    └── email (Partition Key)
  
  • username-index (GSI)
    └── username (Partition Key)
```

---

### **8. Event System - EventBus.js**

#### Sự Kiện USER_EVENTS.REGISTERED
```javascript
userEvents.emit(USER_EVENTS.REGISTERED, {
  userId: string,
  username: string,
  email: string
})
```

**Các Listeners có thể:**
- Gửi email xác thực
- Tạo profile mặc định
- Ghi log audit trail
- Cập nhật analytics

---

## 📊 Sequence Diagram

```
Frontend                API Client          Backend            Database
   │                        │                  │                  │
   │ 1. Submit Form         │                  │                  │
   ├─────────────────────→  │                  │                  │
   │                        │ 2. POST /register
   │                        ├─────────────────→│                  │
   │                        │                  │ 3. Validate      │
   │                        │                  │ (Joi Schema)     │
   │                        │                  │ 4. Check Email   │
   │                        │                  ├─────────────────→│
   │                        │                  │←────── Found? ───┤
   │                        │                  │ 5. Check Username│
   │                        │                  ├─────────────────→│
   │                        │                  │←────── Found? ───┤
   │                        │                  │ 6. Hash Password │
   │                        │                  │ 7. Create User   │
   │                        │                  ├─────────────────→│
   │                        │                  │←── User Created ─┤
   │                        │                  │ 8. Emit Event    │
   │                        │ 9. 201 Response  │                  │
   │                        │←─────────────────┤                  │
   │ 10. Update State       │                  │                  │
   │ 11. Success Message    │                  │                  │
   ←─────────────────────────┤                  │                  │
   │                        │                  │                  │
```

---

## 🛡️ Bảo Mật

### Password Hashing
- **Algorithm**: bcrypt
- **Salt Rounds**: (xem passwordUtils.js)
- **Lưu Trữ**: Chỉ lưu hash, không lưu plain password

### Validation Tầng Multiple
1. **Frontend**: Validation thời gian thực (UX)
2. **Backend**: Joi Schema validation (Security)

### Kiểm Tra Trùng Lặp
- Email phải là duy nhất
- Username phải là duy nhất
- Kiểm tra trước khi create

---

## ❌ Error Handling

| Error | HTTP Code | Message |
|-------|-----------|---------|
| **Invalid email** | 400 | "Please provide a valid email" |
| **Username too short** | 400 | "Username must be at least 3 characters" |
| **Email already exists** | 409 | "Email already in use" |
| **Username already exists** | 409 | "Username already in use" |
| **Password too short** | 400 | "Password must be at least 6 characters" |
| **Passwords don't match** | 400 | "Passwords do not match" |
| **Server error** | 500 | Error message từ database |

---

## 📝 Response Examples

### ✅ Success Response (201)
```json
{
  "message": "User registered successfully",
  "user": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john_doe",
    "email": "john@example.com",
    "fullName": "John Doe"
  }
}
```

### ❌ Error Response (400)
```json
{
  "error": "Username or email already in use"
}
```

---

## 🔐 Post-Registration

Sau khi đăng ký thành công, người dùng có thể:
1. Chuyển trang đến Login để đăng nhập
2. Hoặc chuyển trực tiếp nếu có auto-login
3. Email xác thực được gửi (nếu được cấu hình)
4. Sự kiện `REGISTERED` được phát sự kiện

---

## 📂 Tệp Liên Quan

| File | Mục Đích |
|------|---------|
| `frontend/src/pages/RegisterPage.jsx` | Giao diện form đăng ký |
| `frontend/src/hooks/useAuth.js` | Hook xử lý logic đăng ký |
| `frontend/src/services/api.js` | API client configuration |
| `backend/src/routes/auth.js` | Route định nghĩa |
| `backend/src/controllers/AuthController.js` | Controller xử lý request |
| `backend/src/services/AuthService.js` | Business logic đăng ký |
| `backend/src/repositories/UserRepository.js` | Database operations |
| `backend/src/utils/validation.js` | Validation schemas |
| `backend/src/utils/passwordUtils.js` | Password hashing |
| `backend/src/events/EventBus.js` | Event emitter |

---

## ⚙️ Cấu Hình Yêu Cầu

### Environment Variables
```
# Backend
VITE_API_URL=http://localhost:5000/api

# Database
AWS_REGION=your-region
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
```

### Dependencies
- **Frontend**: axios, react hooks, zustand (store)
- **Backend**: express, joi, bcrypt, uuid, aws-sdk
- **Database**: DynamoDB

---

## 🧪 Testing Checklist

- [ ] Xác thực form client-side hoạt động
- [ ] Email không trùng lặp
- [ ] Username không trùng lặp
- [ ] Password được hash đúng cách
- [ ] User được lưu vào DynamoDB
- [ ] Event `REGISTERED` được phát sự kiện
- [ ] Response trả về đúng format
- [ ] Error handling hoạt động chính xác
- [ ] Database indexes hoạt động
- [ ] Interceptor token xử lý đúng

