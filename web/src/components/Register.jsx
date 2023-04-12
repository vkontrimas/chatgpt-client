import axios from 'axios'
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { login } from '../redux/user'

import { useNavigate, useLocation, useParams } from 'react-router'

import './Register.css'

const Auth = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const token = useSelector(state => state.user.token)
  const { code } = useParams()

  /*
  useEffect(async () => {
    const resp = await axios.get(`http://localhost:3000/api/register/${code}`)
    if (resp.data.status === 'expired') {
      // TODO: handle gracefully
      console.error('registration link expired!')
    }
  }, [])
  */

  useEffect(() => {
    // If logged in, go to chat
    if (token) {
      const destination = location.state?.from?.pathname || '/'
      navigate(destination, { replace: true })
    }
  }, [token])

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      const resp = await axios.post(
        `http://localhost:3000/api/register/${code}`,
        { name, email, password }
      )
      dispatch(login({ email, password }))
    }
    catch (e) {
      throw e
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <input
        placeholder="name"
        value={name}
        onChange={e => setName(e.target.value)}
      />
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
      <button type="submit"> Register </button>
    </form>
  )
}

export default Auth
