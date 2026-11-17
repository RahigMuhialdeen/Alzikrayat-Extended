import { useNavigate } from 'react-router-dom'
import LoginForm from '../components/LoginForm'
import RegisterForm from '../components/RegisterForm'

// Authentication page: shows the login or the register form depending on the route
function LoginRegister({ mode, onLoginSuccess }) {
  const navigate = useNavigate()

  if (mode === 'register') {
    return (
      <RegisterForm
        onLoginClick={() => navigate('/login')}
        onHomeClick={() => navigate('/')}
      />
    )
  }

  return (
    <LoginForm
      onRegisterClick={() => navigate('/register')}
      onHomeClick={() => navigate('/')}
      onLoginSuccess={onLoginSuccess}
    />
  )
}

export default LoginRegister
