# 🧪 Auth Pages - Testing Guide

## Quick Start Testing

### 1. Start Backend Server
```bash
cd backend
npm install
npm run dev
```

Backend sẽ chạy trên: `http://localhost:3000`

### 2. Start Frontend Development
```bash
cd frontend
npm install
npm run dev
```

Frontend sẽ chạy trên: `http://localhost:5173`

### 3. Mở browser
```
http://localhost:5173
```

---

## 🧑‍💻 Test Cases

### Test 1: Login với Demo Account

**Steps:**
1. Nhập email: `demo@example.com`
2. Nhập password: `123456`
3. Click "Sign In"

**Expected:**
- ✅ Form validation pass
- ✅ Loading spinner hiển thị
- ✅ Redirect to /chat
- ✅ User info displayed in sidebar

**Test Time:** ~2 phút

---

### Test 2: Register New Account

**Steps:**
1. Click "Create one" link
2. Điền form:
   - Username: `testuser123`
   - Email: `test@example.com`
   - Full Name: `Test User`
   - Password: `Test@123456`
   - Confirm: `Test@123456`
3. Click "Create Account"

**Expected:**
- ✅ Username validation (realtime)
- ✅ Email validation (realtime)
- ✅ Password strength bar (gradually fills)
- ✅ All fields show ✓ when valid
- ✅ Success → Redirect to login
- ✅ Can login with new account

**Test Time:** ~3 phút

---

### Test 3: Password Strength Indicator

**Steps:**
1. Go to Register page
2. Try different passwords:
   - `123456` → Weak (20%)
   - `12345678` → Fair (40%)
   - `Test1234` → Good (60%)
   - `Test@1234` → Strong (80%)
   - `Test@123456!` → Very Strong (100%)

**Expected:**
- ✅ Bar fills progressively
- ✅ Color changes (red → orange → blue → green)
- ✅ Label updates

**Test Time:** ~2 phút

---

### Test 4: Form Validation

**Steps:**
1. Go to Login page
2. Test validation:
   - Leave email empty → "Email is required"
   - Enter invalid email → "Please enter a valid email"
   - Leave password empty → "Password is required"

**Expected:**
- ✅ Errors appear immediately
- ✅ Input border turns red
- ✅ Form won't submit

**Test Time:** ~2 phút

---

### Test 5: Forgot Password Flow

**Steps:**

#### Step 1: Email
1. Click "Forgot your password?"
2. Enter email: `demo@example.com`
3. Click "Send Code"

**Expected:**
- ✅ Progress indicator shows Step 1 active
- ✅ Message: "Verification code: XXXXXX"
- ✅ Proceed to Step 2

#### Step 2: Verify Code
1. Copy code từ message (e.g., `A1B2C3`)
2. Enter code
3. Click "Verify Code"

**Expected:**
- ✅ Step 2 becomes active
- ✅ Message: "Verification successful"
- ✅ Proceed to Step 3

#### Step 3: Reset Password
1. Enter new password: `NewPassword@123`
2. Confirm: `NewPassword@123`
3. Click "Reset Password"

**Expected:**
- ✅ Step 3 becomes active
- ✅ Message: "Password reset successfully"
- ✅ Auto redirect to login after 2s
- ✅ Can login with new password

**Test Time:** ~4 phút

---

### Test 6: Responsive Design

**Steps:**
1. Open DevTools (F12)
2. Toggle device toolbar
3. Test at different breakpoints:
   - Desktop (1920x1080)
   - Tablet (768x1024)
   - Mobile (375x667)
   - Small Phone (320x568)

**Expected:**
- ✅ Form always readable
- ✅ Buttons clickable (min 44px)
- ✅ No horizontal scroll
- ✅ Padding adjusts
- ✅ Font sizes adjust
- ✅ Decorations hide on mobile

**Test Time:** ~3 phút

---

### Test 7: Keyboard Navigation

**Steps:**
1. Go to Login page
2. Press Tab:
   - Email input focused
3. Press Tab again:
   - Password input focused
4. Press Tab again:
   - Show password button focused
5. Press Tab again:
   - Forgot password link focused
6. Press Tab again:
   - Sign In button focused
7. Press Enter:
   - Form submits (if valid)

**Expected:**
- ✅ All elements accessible via Tab
- ✅ Focus visible (blue outline)
- ✅ Enter submits form

**Test Time:** ~2 phút

---

### Test 8: Loading States

**Steps:**
1. Go to Login page
2. Enter valid credentials
3. Click "Sign In"
4. Watch button during load

**Expected:**
- ✅ Button shows spinner
- ✅ Text changes to "Signing in..."
- ✅ Button disabled (can't click twice)
- ✅ After response, button returns to normal

**Test Time:** ~1 phút

---

### Test 9: Error Handling

**Steps:**
1. Go to Login page
2. Enter: `wrong@email.com` + `wrongpassword`
3. Click "Sign In"

**Expected:**
- ✅ Error message appears
- ✅ Background is red
- ✅ Icon shows ⚠️
- ✅ Form not cleared (user can retry)

**Test Time:** ~1 phút

---

### Test 10: Dark Mode

**Steps:**
1. Open DevTools
2. Ctrl+Shift+P → "Emulate CSS"
3. Select "dark"
4. Refresh page

**Expected:**
- ✅ Background dark
- ✅ Text light
- ✅ Form dark with light text
- ✅ All elements readable
- ✅ Colors optimized for dark

**Test Time:** ~2 phút

---

## 🔍 Network Testing

### Test Network Errors

**Steps:**
1. Open DevTools → Network tab
2. Go to Login page
3. Throttle network:
   - DevTools → Network tab
   - Speed dropdown → "Slow 3G"
4. Enter credentials
5. Click "Sign In"

**Expected:**
- ✅ Loading spinner appears
- ✅ Button disabled
- ✅ Takes ~3-5 seconds
- ✅ Success after response

**Test Time:** ~2 phút

### Test Offline

**Steps:**
1. DevTools → Network tab
2. Checkbox "Offline"
3. Try to login

**Expected:**
- ✅ Network error shown
- ✅ Button becomes clickable again
- ✅ Can retry when online

---

## 📊 Testing Checklist

### Login Page
- [ ] Email validation
- [ ] Password input masked
- [ ] Show/hide password works
- [ ] Form submits
- [ ] Success → redirect to /chat
- [ ] Error → display message
- [ ] Links work (Register, Forgot)
- [ ] Demo credentials displayed
- [ ] Responsive on mobile
- [ ] Dark mode works

### Register Page
- [ ] Username validation (realtime)
- [ ] Email validation (realtime)
- [ ] Full name validation (realtime)
- [ ] Password validation (realtime)
- [ ] Password strength bar (5 levels)
- [ ] Confirm password validation
- [ ] Show/hide password works
- [ ] Form submits
- [ ] Success → redirect to login
- [ ] Error → display message
- [ ] Link back to login works
- [ ] Responsive on mobile
- [ ] Dark mode works

### Forgot Password
- [ ] Step 1: Email input & submit
- [ ] Step 1 → Step 2 transition
- [ ] Step 2: Code input & submit
- [ ] Step 2 → Step 3 transition
- [ ] Step 3: Password input & submit
- [ ] Step 3 → Success → Login
- [ ] Back buttons work
- [ ] Progress indicator updates
- [ ] Error handling works
- [ ] Responsive on mobile

### Overall
- [ ] All pages responsive
- [ ] Keyboard navigation works
- [ ] Loading states visible
- [ ] Error messages clear
- [ ] Success messages shown
- [ ] Dark mode works
- [ ] No console errors
- [ ] Fast load times
- [ ] Animations smooth
- [ ] API calls working

---

## 🐛 Common Issues & Solutions

### Issue: Login button not working
**Solution:**
- Check backend is running
- Check email is registered
- Check password is correct
- Check API_URL in .env

### Issue: Demo code not showing
**Solution:**
- Check response includes `verificationToken`
- Only shows in development (remove in production)

### Issue: Animations choppy
**Solution:**
- Check GPU acceleration enabled
- Reduce browser tabs
- Clear browser cache

### Issue: Form not responding
**Solution:**
- Check browser console for errors
- Check Network tab for failed requests
- Refresh page
- Clear localStorage

---

## 📈 Performance Testing

### Lighthouse Report

**Steps:**
1. Open DevTools
2. Go to Lighthouse tab
3. Click "Analyze page load"

**Target Scores:**
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

**How to improve:**
- Minimize CSS/JS bundle
- Optimize images
- Enable caching
- Use CDN

---

## 🎬 Recording Test Video

**Recommended Flow:**
1. Navigate to localhost:5173
2. Show login page
3. Register new account
4. Login with new account
5. Go to forgot password
6. Complete reset flow
7. Login with new password
8. Show responsive design (mobile)

**Duration:** ~5 minutes

---

## 📝 Test Report Template

```
Date: [DATE]
Tester: [NAME]
Duration: [TIME]

Test Results:
- Login Page: ✅ PASS
- Register Page: ✅ PASS
- Forgot Password: ✅ PASS
- Responsive: ✅ PASS
- Dark Mode: ✅ PASS

Issues Found:
- None

Notes:
- All tests passed
- Performance good
- No console errors

Signature: _______________
```

---

**Total Testing Time:** ~30 minutes for all tests

Enjoy testing! 🎉
