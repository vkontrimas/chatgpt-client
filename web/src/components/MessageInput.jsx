import { useState, } from 'react'
import './MessageInput.css'

const MessageInput = () => {
  const [message, setMessage] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    console.log('message:', message)
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
