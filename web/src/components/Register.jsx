import axios from 'axios'
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { login } from '../redux/user'

import { useNavigate, useLocation } from 'react-router'

import './Login.css'

const Auth = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const currentToken = useSelector(state => state.user.token)

  useEffect(() => {
    // If logged in, go to chat
    if (currentToken) {
      const destination = location.state?.from?.pathname || '/'
      navigate(destination, { replace: true })
    }
  }, [currentToken])

  const handleSubmit = async (event) => {
    event.preventDefault()
    dispatch(login({ email, password }))
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <input
        placeholder="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        placeholder="password"
        type="password"
        onChange={e => setPassword(e.target.value)}
      />
      <button type="submit"> Login </button>
    </form>
  )
}

export default Auth
