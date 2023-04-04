import { useState, useRef, useEffect, } from 'react'
import './MessageInput.css'

const MessageInput = ({ sendMessage }) => {
  const [message, setMessage] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    if (message) {
      sendMessage(message)
      setMessage('')
    }
  }

  const inputRef = useRef(null)
  const focusInput = () => inputRef.current?.focus()
  useEffect(focusInput, [])
  useEffect(() => {
    window.addEventListener('focus', focusInput)
    return () => window.removeEventListener('focus', focusInput)
  }, [])

  return (
    <form className="message-form" onSubmit={handleSubmit}>
      <input
        className="message-input"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        ref={inputRef}
      />
    </form>
  )
}

export default MessageInput
