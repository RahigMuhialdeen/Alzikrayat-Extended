import { useState } from 'react'
import './Login.css'

function Login({ onRegisterClick, onHomeClick, onLoginSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(
        '/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(formData)
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      onLoginSuccess(data.userId, data.user)

    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">

        <div className="login-header">
          <button
            type="button"
            className="login-brand"
            onClick={onHomeClick}
          >
            <span>✿</span> Alzikrayat
          </button>

          <h1>Welcome Back</h1>

          <p>
            Log in to continue sharing and keeping
            your beautiful memories.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">

          <div className="login-field">
            <label>Email Address</label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="login-field">
            <label>Password</label>

            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && (
            <p className="login-error">{error}</p>
          )}

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>

        </form>

        <p className="login-footer">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onRegisterClick}
          >
            Create account
          </button>
        </p>

      </div>
    </div>
  )
}

export default Login