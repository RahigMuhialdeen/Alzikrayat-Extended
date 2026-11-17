import { useState } from 'react'
import './RegisterForm.css'

function RegisterForm({ onLoginClick, onHomeClick }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    location: '',
    description: '',
    occupation: ''
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
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
setSuccess('')

if (!formData.firstName.trim() || !formData.lastName.trim()) {
  setError('First name and last name are required.')
  return
}

if (formData.password.length < 8) {
  setError('Password must be at least 8 characters long.')
  return
}

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
  setError('Please enter a valid email address.')
  return
}

setLoading(true)

    try {
      const response = await fetch(
        '/api/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
  ...formData,
  firstName: formData.firstName.trim(),
  lastName: formData.lastName.trim(),
  email: formData.email.trim().toLowerCase(),
  location: formData.location.trim(),
  description: formData.description.trim(),
  occupation: formData.occupation.trim()
})
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }

      setSuccess('Account created successfully! You can now log in.')

      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        location: '',
        description: '',
        occupation: ''
      })

    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-page">
      <div className="register-container">

        <div className="register-header">
          <button
            type="button"
            className="register-brand"
            onClick={onHomeClick}
          >
            <span>✿</span> Alzikrayat
          </button>

          <h1>Create your account</h1>

          <p>
            Join Alzikrayat and start keeping your
            beautiful memories.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">

          <div className="register-row">
            <div className="register-field">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="register-field">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="register-field">
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

          <div className="register-field">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="register-field">
            <label>Location <span>(Optional)</span></label>
            <input
              type="text"
              name="location"
              placeholder="Where are you from?"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          <div className="register-field">
            <label>Occupation <span>(Optional)</span></label>
            <input
              type="text"
              name="occupation"
              placeholder="What do you do?"
              value={formData.occupation}
              onChange={handleChange}
            />
          </div>

          <div className="register-field">
            <label>Description <span>(Optional)</span></label>
            <textarea
              name="description"
              placeholder="Tell us a little about yourself"
              value={formData.description}
              onChange={handleChange}
              rows="3"
            />
          </div>

          {error && (
            <p className="register-error">{error}</p>
          )}

          {success && (
            <p className="register-success">{success}</p>
          )}

          <button
            type="submit"
            className="register-submit"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

        </form>

        <p className="register-footer">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onLoginClick}
          >
            Log in
          </button>
        </p>

      </div>
    </div>
  )
}

export default RegisterForm