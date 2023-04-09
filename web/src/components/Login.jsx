import { useState } from 'react'
import { useDispatch } from 'react-redux'

import { login } from '../redux/user'

import './Login.css'

const Auth = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useDispatch()

  const handleSubmit = (event) => {
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
