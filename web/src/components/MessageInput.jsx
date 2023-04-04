import { useState, } from 'react'
import './MessageInput.css'

const MessageInput = ({ sendMessage }) => {
  const [message, setMessage] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    sendMessage(message)
    setMessage('')
  }

  return (
    <form className="message-form" onSubmit={handleSubmit}>
      <input
        className="message-input"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />
    </form>
  )
}

export default MessageInput
