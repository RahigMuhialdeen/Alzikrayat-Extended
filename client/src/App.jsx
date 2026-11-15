import { useState } from 'react'
import './App.css'
import Register from './components/Register'
import Login from './components/Login'
import Memories from './components/Memories'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [currentUserId, setCurrentUserId] = useState(null)

  const onLoginSuccess = (userId) => {
    setCurrentUserId(userId)
    setCurrentPage('memories')
  }

  if (currentPage === 'register') {
    return (
      <Register
        onLoginClick={() => setCurrentPage('login')}
        onHomeClick={() => setCurrentPage('home')}
      />
    )
  }

  if (currentPage === 'login') {
    return (
      <Login
        onRegisterClick={() => setCurrentPage('register')}
        onHomeClick={() => setCurrentPage('home')}
        onLoginSuccess={onLoginSuccess}
      />
    )
  }

  if (currentPage === 'memories') {
    return (
      <div className="app">
        <header className="navbar">
          <a href="#memories" className="brand">
            <span className="brand-icon">✿</span>
            <span>Alzikrayat</span>
          </a>

          <nav className="nav-links">
            <a href="#memories" className="active">Memories</a>
            <a href="#about">About</a>
          </nav>

          <div className="nav-actions">
            <button
              type="button"
              className="login-link"
              onClick={() => setCurrentPage('home')}
            >
              Home
            </button>

            <button
              type="button"
              className="signup-button"
              onClick={() => setCurrentPage('login')}
            >
              Log out
            </button>
          </div>
        </header>

        <main>
          <section className="memories-section" id="memories">
            <div className="section-heading">
              <div>
                <span className="eyebrow">YOUR PERSONAL SPACE</span>
                <h2>Welcome to your memories</h2>
                <p>Your special moments deserve to be remembered.</p>
              </div>

              <span className="memory-symbol">✿</span>
            </div>

            <Memories currentUserId={currentUserId} />
          </section>

          <section className="about-section" id="about">
            <span className="about-symbol">✧</span>
            <p>
              "Some moments become memories.
              Some memories become treasures."
            </p>
            <span className="about-name">— Alzikrayat</span>
          </section>
        </main>

        <footer className="footer">
          <a href="#memories" className="brand footer-brand">
            <span className="brand-icon">✿</span>
            <span>Alzikrayat</span>
          </a>

          <p>Made for the moments that matter.</p>
          <span>© 2026 Alzikrayat</span>
        </footer>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="navbar">
        <a href="#home" className="brand">
          <span className="brand-icon">✿</span>
          <span>Alzikrayat</span>
        </a>

        <nav className="nav-links">
          <a href="#home" className="active">Home</a>
          <a href="#memories">Memories</a>
          <a href="#about">About</a>
        </nav>

        <div className="nav-actions">
          <button
            type="button"
            className="login-link"
            onClick={() => setCurrentPage('login')}
          >
            Log in
          </button>

          <button
            type="button"
            className="signup-button"
            onClick={() => setCurrentPage('register')}
          >
            Get Started
          </button>
        </div>
      </header>

      <main>
        <section className="hero-section" id="home">
          <div className="hero-content">
            <span className="eyebrow">
              <span className="eyebrow-dot"></span>
              EVERY MOMENT MATTERS
            </span>
            <h1>
              Your memories,
              <br />
              <span>beautifully kept.</span>
            </h1>

            <p>
              A special place to capture your moments,
              share your stories, and keep the memories
              that mean the most to you.
            </p>

            <div className="hero-actions">
              <button
                type="button"
                className="primary-button"
                onClick={() => setCurrentPage('register')}
              >
                Start sharing <span>→</span>
              </button>

              <a href="#memories" className="secondary-button">
                Explore memories
              </a>
            </div>

            <div className="hero-note">
              <span>✧</span>
              Your moments deserve to be remembered.
            </div>
          </div>

          <div className="hero-visual">
            <div className="image-frame main-frame">
              <img
                src="https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=900"
                alt="Beautiful peaceful nature landscape"
              />

              <div className="image-caption">
                <span>Little moments</span>
                <small>Become big memories.</small>
              </div>
            </div>

            <div className="floating-card">
              <span className="floating-icon">♡</span>
              <div>
                <strong>Keep it forever</strong>
                <small>Every story matters</small>
              </div>
            </div>

            <span className="decorative-star star-one">✳</span>
            <span className="decorative-star star-two">✧</span>
          </div>
        </section>

        <section className="memories-section" id="memories">
          <div className="section-heading">
            <div>
              <span className="eyebrow">YOUR PERSONAL SPACE</span>
              <h2>Memories to cherish</h2>
              <p>A collection of moments worth remembering.</p>
            </div>

            <span className="memory-symbol">✿</span>
          </div>

          <div className="empty-state">
            <div className="empty-icon">♡</div>
            <h3>Your memory collection starts here</h3>
            <p>
              Beautiful memories are waiting to be shared.
              Sign in to start creating your collection.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={() => setCurrentPage('register')}
            >
              Create your account <span>→</span>
            </button>
          </div>
        </section>

        <section className="about-section" id="about">
          <span className="about-symbol">✧</span>
          <p>
            "Some moments become memories.
            Some memories become treasures."
          </p>
          <span className="about-name">— Alzikrayat</span>
        </section>
      </main>

      <footer className="footer">
        <a href="#home" className="brand footer-brand">
          <span className="brand-icon">✿</span>
          <span>Alzikrayat</span>
        </a>

        <p>Made for the moments that matter.</p>
        <span>© 2026 Alzikrayat</span>
      </footer>
    </div>
  )
}

export default App