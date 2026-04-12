# TixChat - Realtime Chat Application

Ứng dụng chat realtime hoàn chỉnh giống Messenger/WhatsApp với React, Node.js, Socket.IO, và MongoDB.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│            Frontend (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │Components│  │ Context  │  │ Services │      │
│  └──────────┘  └──────────┘  └──────────┘      │
└────────────────────┬────────────────────────────┘
                     │ HTTP & WebSocket
┌────────────────────┴────────────────────────────┐
│          Backend (Node.js + Express)             │
│  ┌──────────────┐  ┌──────────────┐             │
│  │ REST API     │  │ Socket.IO    │             │
│  └──────────────┘  └──────────────┘             │
│  ┌──────────────┐  ┌──────────────┐             │
│  │ Controllers  │  │ Services     │             │
│  └──────────────┘  └──────────────┘             │
│  ┌──────────────┐  ┌──────────────┐             │
│  │ Models       │  │ Middleware   │             │
│  └──────────────┘  └──────────────┘             │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────┐
│         Database Layer (MongoDB)                │
│  ┌────────────────────────────────────────┐    │
│  │ Users | Conversations | Messages       │    │
│  │ Participants | Groups                  │    │
│  └────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

## 📋 Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Node.js + Express
- **Realtime**: Socket.IO
- **Database**: MongoDB
- **Authentication**: JWT
- **Validation**: Joi
- **Optional**: Redis (caching, session management)

## 📁 Project Structure

```
TixChat/
├── backend/
│   ├── src/
│   │   ├── config/           # Database & environment configs
│   │   ├── controllers/      # Request handlers
│   │   ├── services/         # Business logic (event-driven)
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API endpoints
│   │   ├── socket/          # Socket.IO handlers
│   │   ├── middleware/      # Auth, validation middleware
│   │   ├── events/          # Event emitters (event-driven pattern)
│   │   ├── utils/           # Helper functions
│   │   ├── db/              # Database connection
│   │   └── server.js        # Entry point
│   ├── .env.example
│   ├── package.json
│   └── .gitignore
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API & Socket services
│   │   ├── context/        # React Context
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Helper functions
│   │   ├── styles/         # CSS/SCSS files
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── docs/
│   ├── API.md              # API documentation
│   ├── DATABASE.md         # Database schema
│   ├── SOCKET_EVENTS.md    # Socket.IO events
│   ├── ARCHITECTURE.md     # Architecture details
│   └── SETUP.md            # Setup guide
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js >= 16
- MongoDB >= 4.4
- npm or yarn

### Installation

1. **Clone & Install Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

2. **Install Frontend**
```bash
cd frontend
npm install
npm run dev
```

3. **Access the App**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## 📡 Key Features

### Authentication
- ✅ Register/Login with JWT
- ✅ Password hashing (bcrypt)
- ✅ Access & Refresh tokens
- ✅ Protected routes

### Chat Features
- ✅ 1-to-1 conversations
- ✅ Group chats
- ✅ Message status (sent, delivered, seen)
- ✅ Typing indicators
- ✅ Online/offline status
- ✅ Message history with pagination
- ✅ Real-time notifications

### Event-Driven Architecture
- ✅ Service-based events
- ✅ Pub/Sub pattern with Socket.IO
- ✅ Scalable with Redis (optional)

## 📚 Documentation

- [API Documentation](./docs/API.md)
- [Database Schema](./docs/DATABASE.md)
- [Socket.IO Events](./docs/SOCKET_EVENTS.md)
- [Architecture Guide](./docs/ARCHITECTURE.md)

## 🔧 Production Ready

### Scaling
- Redis for session management
- Load balancing with Nginx
- Database indexing
- API rate limiting
- CORS configuration

### Security
- JWT authentication
- Password hashing
- Input validation
- CSRF protection
- Rate limiting

## 📝 License

MIT

## 🤝 Contributing

Feel free to submit PRs and issues!
