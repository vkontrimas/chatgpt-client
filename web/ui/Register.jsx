import axios from 'axios'
import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useParams, useNavigate, Navigate } from 'react-router'

import { useTimed } from './effects'
import { login } from '../redux/user'
import Loading from './Loading'

import '../css/Register.css'

/*
 * Emails are complicated.
 * This is just to give some immediate feedback if the formatting is totally bonkers
 *
 * We'll need to check on the backend to know properly!
 */
const mightBeAnEmail = (email) => /.+@.+\..+/g.test(email)

const RegisterForm = ({ code, codeStatus }) => {
  const [firstName, setFirstName] = useState('')
  const [firstNameAngryClass, firstNameAngry] = useTimed('', 'angry')
  const [lastName, setLastName] = useState('')
  const [lastNameAngryClass, lastNameAngry] = useTimed('', 'angry')
  const [email, setEmail] = useState('')
  const [emailAngryClass, emailAngry] = useTimed('', 'angry')
  const [password, setPassword] = useState('')
  const [passwordAngryClass, passwordAngry] = useTimed('', 'angry')

  const dispatch = useDispatch()

  const handleSubmit = async (event) => {
    event.preventDefault()

    const firstNameTrimmed = firstName.trim()
    const lastNameTrimmed = lastName.trim()

    const angryDurationSec = 1.4
    let cumulativeDelaySec = 0
    if (!firstNameTrimmed) {
      firstNameAngry(angryDurationSec, cumulativeDelaySec)
      setFirstName('') // in case they're all spaces
      cumulativeDelaySec += 0.14
    }
    if (!lastNameTrimmed) {
      lastNameAngry(angryDurationSec, cumulativeDelaySec)
      setLastName('') // in case they're all spaces
      cumulativeDelaySec += 0.14
    }
    const hasEmail = email && mightBeAnEmail(email)
    if (!(hasEmail)) {
      emailAngry(angryDurationSec, cumulativeDelaySec)
      cumulativeDelaySec += 0.14
    }
    if (!password) {
      passwordAngry(angryDurationSec, cumulativeDelaySec)
      cumulativeDelaySec += 0.14
    }

    if (!(firstNameTrimmed && lastNameTrimmed && password && hasEmail)) { return }

    try {
      const registerResponse = await axios.post(
        `/api/register/${code}`,
        { firstName: firstNameTrimmed, lastName, email, password }
      )

      const user = registerResponse.data

      const loginResponse = await axios.post(
        '/api/login',
        { email, password },
      )

      dispatch(login(loginResponse.data))
    }
    catch (e) {
      throw e
    }
  }

  return (
    <form className='register-form' onSubmit={handleSubmit}>
      <input
        className={`text-input register-form-first-name ${firstNameAngryClass}`}
        placeholder="first name"
        value={firstName}
        onChange={e => setFirstName(e.target.value)}
        disabled={codeStatus === 'used'}
      />
      <input
        className={`text-input register-form-last-name ${lastNameAngryClass}`}
        placeholder="last name"
        value={lastName}
        onChange={e => setLastName(e.target.value)}
        disabled={codeStatus === 'used'}
      />
      <input
        className={`text-input register-form-email ${emailAngryClass}`}
        placeholder="email"
        value={email}
        onChange={e => setEmail(e.target.value.trim())}
        disabled={codeStatus === 'used'}
      />
      <input
        className={`text-input register-form-password ${passwordAngryClass}`}
        placeholder="password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value.trim())}
        disabled={codeStatus === 'used'}
      />
      <button
        className='button2 good register-form-register'
        type="submit"
        disabled={codeStatus === 'used'}
      >
        Register
      </button>
    </form>

  )
}

const Register = () => {
  const [codeStatus, setCodeStatus] = useState(null)
  const navigate = useNavigate()
  const { code } = useParams()

  useEffect(() => {
    const checkCodeStatus = async () => {
      try {
        const resp = await axios.get(`/api/register/${code}`)
        setCodeStatus(resp.data.status)
      } catch (error) {
        if (error.name === 'AxiosError' && error.response.status === 404) {
          navigate('/waitlist', { replace: true, state: { registrationCode: code } })
        } else {
          throw error
        }
      }
    }

    checkCodeStatus()
  }, [])

  if (!codeStatus) {
    return <Loading />
  }

  if (codeStatus !== 'valid') {
    return <Navigate to='/waitlist' replace state={{ registrationCode: code }} />
  }

  else {
    return (
      <div className='register'>
        {codeStatus === 'valid' && <RegisterForm code={code} codeStatus={codeStatus} />}
      </div>
    )
  }
}

export default Register
