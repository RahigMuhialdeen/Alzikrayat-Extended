import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

// Landing page: banner, short description and navigation
function Home({ currentUser, onLogout }) {
  return (
    <div className="app">
      <Navbar currentUser={currentUser} onLogout={onLogout} activePage="home" />

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
              <Link to="/register" className="primary-button">
                Start sharing <span>→</span>
              </Link>

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

            <Link to="/register" className="primary-button">
              Create your account <span>→</span>
            </Link>
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

export default Home
