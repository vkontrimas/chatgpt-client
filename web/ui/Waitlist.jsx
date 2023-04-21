import '../css/Waitlist.css'

import axios from 'axios'
import { useState, useCallback } from 'react'
import { useLocation } from 'react-router-dom'

import { useTimed } from './effects'

/*
 * Emails are complicated.
 * This is just to give some immediate feedback if the formatting is totally bonkers
 *
 * We'll need to check on the backend to know properly!
 */
const mightBeAnEmail = (email) => /.+@.+\..+/g.test(email)

const WaitlistForm = ({ setSubmitStatus, originCode }) => {
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
    const hasEmail = email && mightBeAnEmail(email)
    if (!(hasEmail)) {
      emailAngry(angryDurationSec, cumulativeDelaySec)
      cumulativeDelaySec += 0.14
    }

    if (!(nameTrimmed && hasEmail)) { return }

    try {
      await axios.post('/api/waitlist', { 
        name: nameTrimmed,
        email,
        registrationCode: originCode || 'none',
      })
      setSubmitStatus('success')
    } catch (error) {
      console.error(error)
      setSubmitStatus('error')
    }
  }

  return (
    <form className='waitlist-form' onSubmit={handleSubmit}>
      
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

const Waitlist = () => {
  const [submitStatus, setSubmitStatus] = useState(null)
  const { state } = useLocation()

  return (
    <div className='waitlist'>
      { state?.registrationCode && <div className='notification bad'>
          Sorry! This registration link has been used the maximum number of times.
        </div> 
      }
      { !submitStatus && <WaitlistForm originCode={state?.registrationCode} setSubmitStatus={(status) => setSubmitStatus(status)} /> }
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
    </div>
  )
}

export default Waitlist
