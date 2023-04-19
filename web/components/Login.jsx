import axios from 'axios'
import localForage from 'localforage'
import { useState } from 'react'
import { useDispatch } from 'react-redux'

import { login } from '../redux/user'

import './Login.css'

const getTokenExpiry = (token) => {
  const base64Payload = token.split('.')[1]
  const { exp } = JSON.parse(atob(base64Payload))
  return exp
}

const Auth = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useDispatch()

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      const { data } = await axios.post('/api/login', { email, password })

      const userState = {
        id: data.id,
        name: data.name,
        bearer: `Bearer ${data.token}`,
        expiry: getTokenExpiry(data.token),
      }

      dispatch(login(userState))

      setEmail('')
      setPassword('')

      await localForage.setItem('user', userState)
    } catch (error) {
      console.error('error logging in:', error)
      // TODO: handle specific login errors
      await localForage.removeItem('user')
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
