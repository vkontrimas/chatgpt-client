import { useState, } from 'react'

const MessageInput = () => {
  const [message, setMessage] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    console.log('message:', message)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />
    </form>
  )
}

export default MessageInput
