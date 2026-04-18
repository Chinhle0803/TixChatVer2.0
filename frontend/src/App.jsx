import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import AuthContainer from './pages/AuthContainer'
import ChatPage from './pages/ChatPage'
import ProfilePage from './pages/ProfilePage'
import { DialogProvider } from './context/DialogContext'
import './styles/App.css'

function App() {
  const { isAuthenticated, initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [])

  return (
    <DialogProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
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
    </DialogProvider>
  )
}

export default App
