import '../css/ChatInput.css'

import { useCallback, useState, useRef, useEffect, } from 'react'
import { useSelector, useDispatch } from 'react-redux'

const ChatInput = ({ enabled }) => {
  const [message, setMessage] = useState('')
  const textAreaRef = useRef(null)

  // Automatically resize the text area to fit content
  useEffect(() => {
    const area = textAreaRef.current
    if (area) {
      area.style.height = '0px'
      area.style.height = `${area.scrollHeight}px`
    }
  }, [message, textAreaRef.current])

  const handleSubmit = (event) => {
    if (event) { event.preventDefault() }
    setMessage('')
  }

  // On desktop use enter to send and shift+enter to enter a new line
  const handleKeyDown = (event) => {
    if (message && event.keyCode === 13 && !event.shiftKey) {
      event.preventDefault()
      textAreaRef.current.form.requestSubmit()
    }
  }

  return (
    <form className='chat-input-form' onSubmit={handleSubmit}>
      <textarea
        className='text-input chat-input'
        onChange={event => setMessage(event.target.value)}
        onKeyDown={handleKeyDown}
        value={message}
        ref={textAreaRef}
        autoFocus
      />
      <button className='button-clear good chat-send-button' action="submit" disabled={!enabled}>
        <i className='fa fa-arrow-right fa-lg' />
      </button>
    </form>
  )
}

export default ChatInput
