# Testing Guide - Email Verification OTP Feature

## Prerequisites
- Backend server running
- Frontend development server running
- AWS SES configured for sending emails
- Database configured

## Testing Steps

### 1. Test Registration Flow

1. Navigate to the registration page
2. Fill in the registration form:
   - Username: `testuser123`
   - Email: Your test email address
   - Full Name: `Test User`
   - Password: `TestPassword123`
   - Confirm Password: `TestPassword123`
3. Click "Đăng ký" (Register) button
4. Verify that:
   - Registration is successful
   - Page redirects to OTP verification page
   - Email address is displayed on the page

### 2. Test OTP Reception

1. Check your email inbox
2. Look for an email from `noreply@tixchat.com`
3. Email subject: `📧 Your TixChat Verification Code: XXXXXX`
4. Email contains a 6-digit verification code
5. Code is displayed prominently in the email

### 3. Test OTP Verification

1. On the VerifyOTPPage:
   - Verify that email is displayed correctly
   - OTP input field is auto-focused (you can start typing immediately)
   - Timer shows countdown (10 minutes = 600 seconds)

2. Enter the 6-digit code from the email:
   - Input should only accept numbers (0-9)
   - Maximum 6 characters
   - Invalid characters should not be accepted

3. Click "Xác thực Email" (Verify Email) button

4. Verify that:
   - Loading state shows "Đang xác thực..."
   - Success message appears
   - User is automatically logged in
   - Chat page loads (auto-login works)

### 4. Test OTP Resend

1. Go back to registration and register a new account
2. Get to the OTP verification page
3. Click "Gửi lại mã xác thực" (Resend verification code) button
4. Verify that:
   - Button becomes disabled with countdown: "Gửi lại trong 60 giây"
   - After 60 seconds, button becomes enabled again
   - New email with a different OTP code is sent
   - OTP timer resets to 10 minutes
   - Input field clears and auto-focuses

### 5. Test OTP Expiration

1. Register and get to the OTP verification page
2. Wait for the 10-minute timer to expire (or set up a quick test)
3. Verify that:
   - Timer shows "0:00"
   - Error message appears: "Mã xác thực đã hết hạn"
   - Submit button becomes disabled
   - User can only resend OTP

### 6. Test Invalid OTP

1. Register and get to the OTP verification page
2. Enter an incorrect 6-digit code (e.g., wrong digits)
3. Click verify button
4. Verify that:
   - Error message appears: "Mã xác thực không hợp lệ" or "Invalid verification code"
   - OTP input field gets error styling (red border)
   - User remains on the verification page
   - User can try again with correct code

### 7. Test Empty OTP Submission

1. On the OTP verification page
2. Click verify button without entering any code
3. Verify that:
   - Error message appears: "Vui lòng nhập mã xác thực gồm 6 chữ số"
   - Submit button is disabled until 6 digits are entered

### 8. Test User Email Verification Status

**Backend verification (if database access available):**

1. After successful OTP verification, check user record in database
2. Verify that:
   - `isEmailVerified` = `true`
   - `emailVerificationOtp` = `null`
   - `emailVerificationOtpExpires` = `null`
   - `isOnline` = `true`

### 9. Test Auto-Login

1. Register and verify email via OTP
2. Verify that:
   - Access token and refresh token are saved
   - User info is saved in localStorage
   - Chat page loads without redirecting to login
   - User is immediately able to send/receive messages

### 10. Test Resend OTP for Non-verified Accounts

**Optional - if you implement this feature:**

1. Register an account
2. Close the OTP verification page before verifying
3. Log in with that email address again
4. System should:
   - Detect unverified email
   - Redirect to OTP verification page
   - Allow resending OTP

## Frontend UI Validation

- [ ] OTP input field shows placeholder "000000"
- [ ] Email address displayed correctly (may be partially masked)
- [ ] Timer displays correctly (M:SS format)
- [ ] Countdown animations smooth
- [ ] Error messages show appropriate icons (⚠️, ❌)
- [ ] Success animations present
- [ ] Resend button countdown works smoothly
- [ ] Mobile responsive layout works
- [ ] Tab/Enter key navigation works
- [ ] All text is in Vietnamese

## Backend API Testing (Using Postman/curl)

### Test Send OTP on Registration

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123456",
    "fullName": "Test User"
  }'
```

Expected Response:
```json
{
  "message": "User registered successfully",
  "user": {
    "userId": "...",
    "username": "testuser",
    "email": "test@example.com",
    "fullName": "Test User"
  }
}
```

### Test Verify OTP

```bash
curl -X POST http://localhost:5000/api/auth/verify-email-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'
```

Expected Response (Success):
```json
{
  "message": "Email verified successfully",
  "data": {
    "user": {
      "userId": "...",
      "username": "testuser",
      "email": "test@example.com",
      "fullName": "Test User",
      "avatar": null,
      "isEmailVerified": true
    },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

### Test Resend OTP

```bash
curl -X POST http://localhost:5000/api/auth/send-email-verification-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

Expected Response:
```json
{
  "message": "Verification code sent to your email",
  "expiresIn": 600
}
```

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Email not received | SES not configured | Check AWS SES settings in `.env` |
| OTP code shows as undefined | Email template issue | Check EmailService method |
| Auto-login not working | Token not saved | Check localStorage in browser DevTools |
| OTP timer doesn't work | Countdown interval issue | Check browser console for errors |
| Redirect to chat fails | Socket connection issue | Check socket setup |
| Wrong OTP accepted | Verification logic issue | Check `verifyEmailOtp` method |

## Performance Metrics

- Registration form validation: < 100ms
- Email send time: 1-3 seconds
- OTP verification response: < 500ms
- Auto-login redirect: < 1 second
- Page load after verification: < 2 seconds

## Security Testing

- [ ] OTP is 6 random digits (not sequential)
- [ ] OTP expires after 10 minutes
- [ ] Multiple wrong OTP attempts don't lock account (optional: implement rate limiting)
- [ ] Tokens cleared from response after login
- [ ] User cannot access chat without email verification
- [ ] SQL injection attempts blocked in email input

## Accessibility Testing

- [ ] Page is navigable with keyboard
- [ ] Tab order is logical
- [ ] Error messages are announced to screen readers
- [ ] Color contrast meets WCAG AA standards
- [ ] OTP input has proper label

---

**Note:** After completing all tests, update this document with any issues found and their resolutions.
