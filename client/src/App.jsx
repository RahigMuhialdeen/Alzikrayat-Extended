import { useEffect, useState } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate
} from 'react-router-dom'

import './App.css'
import Home from './pages/Home'
import LoginRegister from './pages/LoginRegister'
import Gallery from './pages/Gallery'
import PhotoDetail from './pages/PhotoDetail'

function AppRoutes() {
  const [currentUserId, setCurrentUserId] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const navigate = useNavigate()

  // Restore the session after a page refresh
  useEffect(() => {
    const loadSession = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        })

        if (response.ok) {
          const data = await response.json()
          setCurrentUserId(data.userId)
          setCurrentUser(data.user)
        }
      } catch (err) {
        console.error('Could not restore session:', err)
      } finally {
        setCheckingSession(false)
      }
    }

    loadSession()
  }, [])

  const onLoginSuccess = (userId, user) => {
    setCurrentUserId(userId)
    setCurrentUser(user)
    navigate('/memories')
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Logout failed')
      }

      setCurrentUserId(null)
      setCurrentUser(null)
      navigate('/login')

    } catch (err) {
      alert(err.message || 'Something went wrong')
    }
  }

  if (checkingSession) {
    return <div className="app"><p>Loading...</p></div>
  }

  return (
    <Routes>
      <Route path="/" element={<Home currentUser={currentUser} onLogout={handleLogout} />} />

      <Route path="/register" element={<LoginRegister mode="register" />} />

      <Route
        path="/login"
        element={
          <LoginRegister mode="login" onLoginSuccess={onLoginSuccess} />
        }
      />

      <Route
  path="/memories"
  element={
    <Gallery
      currentUserId={currentUserId}
      currentUser={currentUser}
      onLogout={handleLogout}
    />
  }
/>
      <Route
  path="/photos/:id"
  element={<PhotoDetail currentUserId={currentUserId} />}
/>

      <Route path="*" element={<Home currentUser={currentUser} onLogout={handleLogout} />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App