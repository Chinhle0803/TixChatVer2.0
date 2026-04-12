# Email Verification OTP API Documentation

## Overview
This document describes the email verification OTP API endpoints and flow for the TixChat application.

## Registration Flow with Email Verification

```
┌─────────────┐
│  Register   │
│   Form      │
└──────┬──────┘
       │ Submit registration data
       ▼
┌─────────────────────────┐
│ POST /api/auth/register │
└──────┬──────────────────┘
       │ ✓ Valid registration data
       ▼
┌──────────────────────────┐
│ Create User in Database  │
│ Generate 6-digit OTP     │
│ Store OTP with 10min exp │
│ Send OTP via Email       │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ VerifyOTPPage Component  │
│ Display user email       │
│ 10-minute countdown      │
│ Resend OTP button        │
└──────┬───────────────────┘
       │ User enters OTP
       ▼
┌─────────────────────────────┐
│ POST /api/auth/verify-email │
│         -otp                │
└──────┬──────────────────────┘
       │ ✓ Valid OTP
       ▼
┌──────────────────────────┐
│ Mark Email as Verified   │
│ Generate Tokens          │
│ Set User Online          │
│ Clear OTP from DB        │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Auto-Login               │
│ Store tokens in localStorage
│ Redirect to Chat Page    │
└──────────────────────────┘
```

---

## API Endpoints

### 1. User Registration with OTP Generation

**Endpoint:** `POST /api/auth/register`

**Description:** Creates a new user account and initiates email verification via OTP.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "fullName": "John Doe"
}
```

**Request Validation:**
- `username`: Required, 3-30 characters, alphanumeric only
- `email`: Required, valid email format
- `password`: Required, minimum 6 characters
- `fullName`: Required, non-empty string

**Response (201 Created):**
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

**Backend Process:**
1. Validate input data
2. Check if username/email already exists
3. Hash password using bcrypt
4. Create user in database with:
   - `isEmailVerified`: false
   - `emailVerificationOtp`: null (will be set below)
   - `emailVerificationOtpExpires`: null
5. Generate random 6-digit OTP (100000-999999)
6. Store OTP in user record with 10-minute expiration
7. Send HTML email with OTP to user
8. Return user info (without password)

**Error Responses:**

```json
{
  "error": "Username or email already in use"
}
```
Status: 400 Bad Request

```json
{
  "error": "Invalid email format"
}
```
Status: 400 Bad Request

**Email Sent:**
- **From:** noreply@tixchat.com
- **Subject:** 📧 Your TixChat Verification Code: XXXXXX
- **Contains:** 6-digit OTP code prominently displayed
- **Expires:** 10 minutes from send time

---

### 2. Verify Email with OTP Code

**Endpoint:** `POST /api/auth/verify-email-otp`

**Description:** Verifies user email by validating the OTP code sent via email. Upon success, automatically logs in the user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Request Validation:**
- `email`: Required, valid email format
- `otp`: Required, exactly 6 digits

**Response (200 OK):**
```json
{
  "message": "Email verified successfully",
  "data": {
    "user": {
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "username": "john_doe",
      "email": "john@example.com",
      "fullName": "John Doe",
      "avatar": null,
      "isEmailVerified": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Backend Process:**
1. Find user by email
2. Retrieve stored OTP and expiration time
3. Validate OTP:
   - Check if OTP matches stored code
   - Check if OTP has not expired (current time < expiration time)
4. If valid:
   - Update user: `isEmailVerified = true`
   - Clear OTP: `emailVerificationOtp = null`
   - Clear OTP expiration: `emailVerificationOtpExpires = null`
   - Set online: `isOnline = true`, `lastSeen = Date.now()`
   - Generate JWT tokens:
     - `accessToken` (15 minutes expiration)
     - `refreshToken` (7 days expiration)
   - Emit event: `USER_EVENTS.LOGGED_IN`
5. Return user data and tokens

**Error Responses:**

```json
{
  "error": "User not found"
}
```
Status: 404 Not Found

```json
{
  "error": "Invalid verification code"
}
```
Status: 400 Bad Request
- Returned when OTP doesn't match stored code

```json
{
  "error": "Verification code expired"
}
```
Status: 400 Bad Request
- Returned when 10 minutes have passed

**Frontend Handler:**
1. Store `accessToken` and `refreshToken` in localStorage
2. Store `user` data in authStore
3. Set authentication state
4. Redirect to chat page

---

### 3. Resend OTP Code

**Endpoint:** `POST /api/auth/send-email-verification-otp`

**Description:** Generates and sends a new OTP code to the user's email. Useful if user didn't receive the first code or if OTP expired.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Request Validation:**
- `email`: Required, valid email format

**Response (200 OK):**
```json
{
  "message": "Verification code sent to your email",
  "expiresIn": 600
}
```

**Response Explanation:**
- `message`: Confirmation that email was sent
- `expiresIn`: OTP validity period in seconds (600 = 10 minutes)

**Backend Process:**
1. Find user by email
2. Generate new 6-digit OTP
3. Set new expiration time (10 minutes from now)
4. Update user record with new OTP
5. Send email with new OTP
6. Return expiration info

**Error Responses:**

```json
{
  "error": "User not found"
}
```
Status: 404 Not Found

```json
{
  "error": "Failed to send verification email"
}
```
Status: 500 Internal Server Error
- Returned if AWS SES fails to send email

**Frontend Usage:**
- Called when user clicks "Resend OTP" button
- OTP input field should be cleared
- Timer should reset to 10 minutes (600 seconds)
- Resend button should be disabled for 60 seconds (rate limiting)

---

## Token Structure

### Access Token
```
{
  "iss": "tixchat",
  "sub": "user_id",
  "iat": 1234567890,
  "exp": 1234567890 + 15*60*1000,
  "type": "access"
}
```
- **Expiration:** 15 minutes
- **Usage:** Include in Authorization header for API requests
- **Format:** `Authorization: Bearer <accessToken>`

### Refresh Token
```
{
  "iss": "tixchat",
  "sub": "user_id",
  "iat": 1234567890,
  "exp": 1234567890 + 7*24*60*60*1000,
  "type": "refresh"
}
```
- **Expiration:** 7 days
- **Usage:** Request new access token when expired
- **Format:** Send in POST request body to `/api/auth/refresh-token`

---

## Frontend Implementation

### VerifyOTPPage Component Props

```jsx
<VerifyOTPPage
  email="user@example.com"        // User's email address (from registration)
  onSuccess={handleOtpSuccess}    // Callback function after successful verification
/>
```

### Component Features

- **Auto-focus:** OTP input auto-focuses when component mounts
- **Numeric input only:** Only accepts digits 0-9
- **Max length:** Limits input to 6 characters
- **Countdown timer:** Displays remaining time (updates every second)
- **Resend button:** Appears after timer completes or if OTP expired
- **Error handling:** Shows specific error messages
  - "Vui lòng nhập mã xác thực gồm 6 chữ số" (Empty input)
  - "Mã xác thực không hợp lệ" (Wrong code)
  - "Mã xác thực đã hết hạn" (Expired)
- **Loading state:** Shows "Đang xác thực..." during verification
- **Success redirect:** Auto-navigates to chat page on success

### useAuth Hook Integration

The `useAuth` hook provides:

```javascript
const {
  loading,        // boolean - true while verifying OTP
  error,          // string - error message if verification fails
  user,           // object - current user data
} = useAuth()
```

### Local Storage Keys

After successful verification:

```javascript
localStorage.getItem('accessToken')    // JWT access token
localStorage.getItem('refreshToken')   // JWT refresh token
localStorage.getItem('user')           // JSON stringified user object
```

---

## Error Handling

### Common Error Scenarios

| Error | Cause | User Action |
|-------|-------|-------------|
| "User not found" | Email not in system | Register again |
| "Invalid verification code" | Wrong OTP entered | Check email and re-enter |
| "Verification code expired" | 10 minutes passed | Click "Resend" button |
| "Email is required" | Missing email field | Refresh page and try again |
| "Failed to send verification email" | AWS SES error | Try resend later or contact support |

### Retry Logic

- **Wrong OTP:** User can try unlimited times while OTP is valid
- **Expired OTP:** User can resend (with 60-second cooldown)
- **Failed Email Send:** Automatic retry on next register or resend

---

## Security Measures

1. **OTP Generation:** Cryptographically random 6-digit numbers
2. **OTP Storage:** Hashed in database (optional - for production)
3. **OTP Expiration:** 10 minutes max validity
4. **Rate Limiting:** 60-second cooldown between resend attempts (client-side)
5. **Token Security:**
   - Short-lived access tokens (15 minutes)
   - Longer-lived refresh tokens (7 days)
   - Tokens never exposed in logs or responses after login
6. **Email Verification:** Prevents spam registrations with fake emails
7. **User Status:** Only verified users can access chat features

---

## Database Schema

### User Table Changes

```javascript
{
  userId: UUID,
  username: String,
  email: String,
  password: String (hashed),
  fullName: String,
  isEmailVerified: Boolean,                // NEW
  emailVerificationOtp: String,            // NEW (cleared after verification)
  emailVerificationOtpExpires: Number,     // NEW (cleared after verification)
  isOnline: Boolean,
  lastSeen: ISO8601String,
  createdAt: ISO8601String,
  updatedAt: ISO8601String,
  ...otherFields
}
```

---

## Testing

See `TESTING_GUIDE.md` for comprehensive testing procedures.

---

## Troubleshooting

### Email Not Received
1. Check AWS SES configuration in `.env`
2. Verify email address is not in spam folder
3. Check AWS SES sending limits
4. Look for errors in backend logs

### OTP Not Verifying
1. Ensure exactly 6 digits are entered
2. Check email for correct code
3. Verify 10-minute timer hasn't expired
4. Check backend logs for validation errors

### Auto-login Not Working
1. Check browser localStorage for tokens
2. Verify tokens are valid JWTs
3. Check socket connection to chat server
4. Look for auth middleware errors in logs

### Resend Button Not Appearing
1. Wait for 10-minute OTP timer to expire
2. Or click "Resend" when available
3. Check browser console for JavaScript errors

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024 | Initial implementation - Email OTP verification |

