import axios from 'axios'
import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useParams, useNavigate } from 'react-router'

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

const RegisterForm = ({ codeStatus }) => {
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

const RegisterWaitlistForm = ({ setSubmitStatus }) => {
  const [name, setName] = useState('')
  const [nameAngryClass, nameAngry] = useTimed('', 'angry')
  const [email, setEmail] = useState('')
  const [emailAngryClass, emailAngry] = useTimed('', 'angry')

  const handleSubmit = async (event) => {
    event.preventDefault()
    
    const nameTrimmed = name.trim()

    const angryDurationSec = 1.4
    let cumulativeDelaySec = 0
    if (!nameTrimmed) {
      nameAngry(angryDurationSec, cumulativeDelaySec)
      setName('')
      cumulativeDelaySec += 0.14
    }
    console.log(email, mightBeAnEmail(email))
    const hasEmail = email && mightBeAnEmail(email)
    if (!(hasEmail)) {
      emailAngry(angryDurationSec, cumulativeDelaySec)
      cumulativeDelaySec += 0.14
    }

    if (!(nameTrimmed && hasEmail)) { return }

    try {
      await axios.post('/api/waitlist', { name: nameTrimmed, email })
      setSubmitStatus('success')
    } catch (error) {
      setSubmitStatus('error')
    }
  }

  return (
    <form className='register-used' onSubmit={handleSubmit}>
      <div className='notification bad'>
        Sorry! This registration link has been used the maximum number of times.
      </div>
      <input
        className={`text-input ${nameAngryClass}`}
        placeholder='name'
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <input
        className={`text-input ${emailAngryClass}`}
        placeholder='email'
        value={email}
        onChange={(event) => setEmail(event.target.value.trim())}
      />
      <button
        className='button2 good'
        onClick={() => {}}
      >
        Join the waitlist
      </button>
    </form>
  )
}

const RegisterUsed = () => {
  const [submitStatus, setSubmitStatus] = useState(null)
  return (
    <>
      { !submitStatus && <RegisterWaitlistForm setSubmitStatus={(status) => setSubmitStatus(status)} /> }
      { 
        submitStatus === 'success' && <div className='notification good' style={{ width: '20em', textAlign: 'center' }}>
          Expect an invite soon. ✨
        </div>
      }
      { 
        submitStatus && submitStatus !== 'success' && <div className='notification bad' style={{ width: '20em', textAlign: 'center' }}>
          Submission failed.
        </div>
      }
    </>
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
        console.log(resp.data.status)
        setCodeStatus(resp.data.status)
      } catch (error) {
        if (error.name === 'AxiosError' && error.response.status === 404) {
          navigate('/not-found', { replace: true })
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
  else {
    return (
      <div className='register'>
        {codeStatus === 'valid' && <RegisterForm codeStatus={codeStatus} />}
        {codeStatus === 'used' && <RegisterUsed />}
      </div>
    )
  }
}

export default Register
