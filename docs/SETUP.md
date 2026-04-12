# TixChat - Setup & Installation Guide

## Prerequisites

- **Node.js** >= 16.x
- **npm** >= 8.x or **yarn** >= 1.22.x
- **MongoDB** >= 4.4 (local or cloud)
- **Git**

---

## Installation Steps

### 1. Clone/Extract Project

```bash
cd TixChat
```

---

### 2. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Configure Environment
```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/tixchat

# JWT
JWT_SECRET=your_super_secret_key_change_this
JWT_REFRESH_SECRET=your_refresh_secret_key

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Redis (optional)
REDIS_ENABLED=false
```

#### Start MongoDB (if local)

**Windows:**
```bash
# Using MongoDB installed via chocolatey or download
mongod
```

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

**Or use MongoDB Atlas (cloud):**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tixchat
```

#### Start Backend Server

Development mode with auto-reload:
```bash
npm run dev
```

Or production mode:
```bash
npm start
```

You should see:
```
✅ MongoDB connected successfully
🚀 Server is running!
📍 Port: 5000
```

---

### 3. Frontend Setup

#### Install Dependencies
```bash
cd ../frontend
npm install
```

#### Configure Environment
```bash
cp .env.example .env
```

The default values should work:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

#### Start Frontend Server
```bash
npm run dev
```

You should see:
```
  VITE v4.2.0  ready in 123 ms

  ➜  Local:   http://localhost:5173/
```

---

## 4. Access the Application

Open your browser and go to:
```
http://localhost:5173
```

---

## First Time Setup

1. **Register a new account**
   - Username: `testuser1`
   - Email: `test1@example.com`
   - Password: `password123`

2. **Open another browser/incognito and register another account**
   - Username: `testuser2`
   - Email: `test2@example.com`
   - Password: `password123`

3. **Start chatting between the two accounts!**

---

## Troubleshooting

### MongoDB Connection Error
```
❌ MongoDB connection error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**
- Ensure MongoDB is running
- Check MongoDB URI in `.env`
- Verify MongoDB is listening on correct port (default: 27017)

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
- Change `PORT` in `.env`
- Or kill process using port: `lsof -ti:5000 | xargs kill -9`

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
- Ensure `FRONTEND_URL` in backend `.env` matches frontend URL
- Check CORS configuration in `backend/src/server.js`

### Socket.IO Connection Failed
```
Socket connection error
```

**Solution:**
- Verify backend is running on correct port
- Check `VITE_SOCKET_URL` in frontend `.env`
- Ensure JWT token is valid in localStorage

### Module Not Found Errors
```
Error: Cannot find module 'express'
```

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## Development Tools

### Recommended VS Code Extensions
- ES7+ React/Redux/React-Native snippets
- MongoDB for VS Code
- REST Client
- Socket.IO Client

### Testing with REST Client

Create `backend/test.rest`:
```rest
### Register User
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "fullName": "Test User"
}

### Login
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}

### Get Current User
GET http://localhost:5000/api/auth/me
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## Building for Production

### Frontend Build
```bash
cd frontend
npm run build
```

Output will be in `frontend/dist/`

### Backend Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Generate strong `JWT_SECRET` and `JWT_REFRESH_SECRET`
- [ ] Use MongoDB Atlas for database
- [ ] Enable HTTPS
- [ ] Configure CORS for production URL
- [ ] Set up environment variables securely
- [ ] Configure Redis for session management
- [ ] Set up logging and monitoring
- [ ] Configure rate limiting
- [ ] Set up automated backups

### Deploy to Server

#### Example: Deploy to AWS/Heroku

**Heroku:**
```bash
heroku create tixchat-app
heroku config:set JWT_SECRET=your_secret
git push heroku main
```

**AWS:**
```bash
# Package application
npm run build
# Use AWS CodeDeploy, Elastic Beanstalk, or EC2
```

---

## Monitoring & Logs

### Backend Logs
```bash
# View realtime logs
npm run dev

# Or use PM2 for production
npm install -g pm2
pm2 start src/server.js --name tixchat
pm2 logs tixchat
```

### Frontend Logs
- Open DevTools (F12)
- Check Console and Network tabs
- Check localStorage for tokens

### Database Monitoring
```bash
# MongoDB shell
mongosh

# List databases
show dbs

# Use tixchat database
use tixchat

# View collections
show collections

# Sample data
db.users.find().pretty()
```

---

## Next Steps

1. **Customize UI/Styling** - Update CSS files in `frontend/src/styles/`
2. **Add Features** - Implement file upload, voice messages, etc.
3. **Scale with Redis** - Enable `REDIS_ENABLED=true` for better performance
4. **Mobile App** - Use React Native to build mobile version
5. **Notifications** - Implement push notifications
6. **Analytics** - Add user analytics and metrics

---

## Performance Optimization

### Frontend
- Enable code splitting in Vite
- Lazy load components
- Use React.memo for expensive components
- Implement virtual scrolling for long message lists

### Backend
- Enable Redis caching
- Use database indexes properly
- Implement pagination for list endpoints
- Use compression middleware

### Database
- Create indexes on frequently queried fields
- Archive old messages to separate collection
- Use connection pooling
- Regular backups

### Socket.IO
- Use socket middleware for authentication
- Implement room-based messaging
- Enable binary compression
- Use adapter for scaling (Redis Adapter)

---

## Support & Troubleshooting

For more detailed guides:
- See `SOCKET_EVENTS.md` for Socket.IO documentation
- See `API.md` for API endpoints
- See `DATABASE.md` for database schema

## Environment Variables Reference

### Backend `.env`
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/tixchat

# JWT Tokens
JWT_SECRET=change_this_to_a_strong_secret
JWT_REFRESH_SECRET=change_this_to_another_strong_secret
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# CORS
FRONTEND_URL=http://localhost:5173

# Redis (Optional)
REDIS_URL=redis://localhost:6379
REDIS_ENABLED=false

# File Upload
MAX_FILE_SIZE=52428800
ALLOWED_EXTENSIONS=jpg,jpeg,png,gif,pdf,doc,docx
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_NAME=TixChat
VITE_MAX_MESSAGE_LENGTH=5000
```
