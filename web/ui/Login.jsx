import axios from 'axios'
import localForage from 'localforage'
import { useState } from 'react'
import { useDispatch } from 'react-redux'

import { login } from '../redux/user'
import { useTimed } from './effects'

import '../css/Login.css'

const getTokenExpiry = (token) => {
  const base64Payload = token.split('.')[1]
  const { exp } = JSON.parse(atob(base64Payload))
  return exp
}

const Auth = () => {
  const [email, setEmail] = useState('')
  const [emailAngryClass, emailAngry] = useTimed('', 'angry')
  const [password, setPassword] = useState('')
  const [passwordAngryClass, passwordAngry] = useTimed('', 'angry')
  const dispatch = useDispatch()

  const handleSubmit = async (event) => {
    event.preventDefault()

    const angryDurationSec = 1.2
    let passwordAngryDelaySec = 0
    if (!email) {
      emailAngry(angryDurationSec, 0)
      passwordAngryDelaySec = 0.14
    }
    if (!password) {
      passwordAngry(angryDurationSec, passwordAngryDelaySec)
    }

    if (!email || !password) { return }

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
    } catch (error) {
      const message = error.response?.data?.error
      if (message === 'unauthorized') {
        emailAngry(angryDurationSec, 0)
        passwordAngry(angryDurationSec, 0.14)
      }
      else {
        throw error
      }
    }
  }

  return (
    <div className='login'>
      <form className='login-form' onSubmit={handleSubmit}>
        <input
          className={`text-input login-form-email ${emailAngryClass}`}
          placeholder="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          className={`text-input login-form-password ${passwordAngryClass}`}
          placeholder="password"
          type="password"
          onChange={e => setPassword(e.target.value)}
        />
        <button
          className='button2 login-form-login good'
          type="submit"
        > 
          Login
        </button>
      </form>
    </div>
  )
}

export default Auth
