import axios from 'axios'
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { login } from '../redux/user'

import { useNavigate } from 'react-router'

import './Login.css'

const Auth = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const userState = useSelector(state => state.user)

  useEffect(() => {
    // If logged in, go to chat
    if (userState.token) {
      navigate('/chat')
    }
  }, [userState])

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      const response = await axios.post('/api/login', { email, password })
      dispatch(login(response))
    } catch (error) {
      if (error.name !== 'AxiosError') {
        throw error
      }

      console.error('login failed\n', error)
    }
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
