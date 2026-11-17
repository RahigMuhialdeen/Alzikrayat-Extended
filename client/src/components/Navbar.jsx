import { Link } from 'react-router-dom'

// Shared toolbar: greets the user when logged in, asks to log in otherwise
function Navbar({ currentUser, onLogout, activePage }) {
  return (
    <header className="navbar">
      <Link to="/" className="brand">
        <span className="brand-icon">✿</span>
        <span>Alzikrayat</span>
      </Link>

      <nav className="nav-links">
        <Link to="/" className={activePage === 'home' ? 'active' : ''}>
          Home
        </Link>

        <Link
          to="/memories"
          className={activePage === 'memories' ? 'active' : ''}
        >
          Memories
        </Link>

        <a href="#about">About</a>
      </nav>

      <div className="nav-actions">
        {currentUser ? (
          <>
            <span className="welcome-user">Hi {currentUser.firstName}</span>

            <button
              type="button"
              className="signup-button"
              onClick={onLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="login-link">
              Please Login
            </Link>

            <Link to="/register" className="signup-button">
              Get Started
            </Link>
          </>
        )}
      </div>
    </header>
  )
}

export default Navbar
