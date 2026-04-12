import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import AuthContainer from './pages/AuthContainer'
import ChatPage from './pages/ChatPage'
import ProfilePage from './pages/ProfilePage'
import './styles/App.css'

function App() {
  const { isAuthenticated, initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [])

  return (
    <Router>
      <Routes>
        <Route 
          path="/auth/*" 
          element={!isAuthenticated ? <AuthContainer /> : <Navigate to="/chat" />} 
        />
        <Route 
          path="/chat" 
          element={isAuthenticated ? <ChatPage /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/profile" 
          element={isAuthenticated ? <ProfilePage /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/" 
          element={isAuthenticated ? <Navigate to="/chat" /> : <Navigate to="/auth" />} 
        />
      </Routes>
    </Router>
  )
}

export default App
