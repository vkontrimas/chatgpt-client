import axios from 'axios'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useParams } from 'react-router'

import { useTimed } from './effects'
import { login } from '../redux/user'

import '../css/Register.css'

const Auth = () => {
  const [firstName, setFirstName] = useState('')
  const [firstNameAngryClass, firstNameAngry] = useTimed('', 'angry')
  const [lastName, setLastName] = useState('')
  const [lastNameAngryClass, lastNameAngry] = useTimed('', 'angry')
  const [email, setEmail] = useState('')
  const [emailAngryClass, emailAngry] = useTimed('', 'angry')
  const [password, setPassword] = useState('')
  const [passwordAngryClass, passwordAngry] = useTimed('', 'angry')

  const dispatch = useDispatch()

  const { code } = useParams()

  /*
  useEffect(async () => {
    const resp = await axios.get(`/api/register/${code}`)
    if (resp.data.status === 'expired') {
      // TODO: handle gracefully
      console.error('registration link expired!')
    }
  }, [])
  */

  const handleSubmit = async (event) => {
    event.preventDefault()

    const angryDurationSec = 1.4
    let cumulativeDelaySec = 0
    if (!firstName) {
      firstNameAngry(angryDurationSec, cumulativeDelaySec)
      cumulativeDelaySec += 0.14
    }
    if (!lastName) {
      lastNameAngry(angryDurationSec, cumulativeDelaySec)
      cumulativeDelaySec += 0.14
    }
    if (!email) {
      emailAngry(angryDurationSec, cumulativeDelaySec)
      cumulativeDelaySec += 0.14
    }
    if (!password) {
      passwordAngry(angryDurationSec, cumulativeDelaySec)
      cumulativeDelaySec += 0.14
    }

    if (!(firstName && lastName && password && email)) { return }

    try {
      const registerResponse = await axios.post(
        `/api/register/${code}`,
        { firstName, lastName, email, password }
      )

      const user = registerResponse.data
      console.log(user)
      
      const loginResponse = await axios.post(
        '/api/login',
        { email, password },
      )

      console.log(loginResponse.data)

      dispatch(login(loginResponse.data))
    }
    catch (e) {
      throw e
    }
  }

  return (
    <div className='register'>
      <form className='register-form' onSubmit={handleSubmit}>
        <input
          className={`text-input register-form-first-name ${firstNameAngryClass}`}
          placeholder="first name"
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
        />
        <input
          className={`text-input register-form-last-name ${lastNameAngryClass}`}
          placeholder="last name"
          value={lastName}
          onChange={e => setLastName(e.target.value)}
        />
        <input
          className={`text-input register-form-email ${emailAngryClass}`}
          placeholder="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          className={`text-input register-form-password ${passwordAngryClass}`}
          placeholder="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button
          className='button2 good register-form-register'
          type="submit"
        >
          Register
        </button>
      </form>
    </div>
  )
}

export default Auth
