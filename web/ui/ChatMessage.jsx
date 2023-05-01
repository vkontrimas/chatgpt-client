import '../css/ChatMessage.css'

import { useRef, useEffect, useCallback } from 'react';

import ReactMarkdown from 'react-markdown'

const ChatMessage = ({ message }) => {
  const holdTimeMs = 250
  const messageRef = useRef(null)

  const handleHold = useCallback(() => {
    console.log('IM BEING HELD')
  })

  useEffect(() => {
    const target = messageRef.current
    if (!target) { return }

    let timer = null

    const handleHoldStart = (event) => {
      timer = setTimeout(() => {
        event.preventDefault()
        handleHold()
        if ('vibrate' in navigator) {
          navigator.vibrate([20])
        }
      }, holdTimeMs)
    }
    const handleHoldEnd = (event) => {
      clearTimeout(timer)
    }

    target.addEventListener('mousedown', handleHoldStart)
    target.addEventListener('touchstart', handleHoldStart)
    target.addEventListener('mouseup', handleHoldEnd)
    target.addEventListener('touchend', handleHoldEnd)
    target.addEventListener('touchcancel', handleHoldEnd)

    return () => {
      clearTimeout(timer)
      if (target) {
        target.removeEventListener('mousedown', handleHoldStart)
        target.removeEventListener('touchstart', handleHoldStart)
        target.removeEventListener('mouseup', handleHoldEnd)
        target.removeEventListener('touchend', handleHoldEnd)
        target.removeEventListener('touchcancel', handleHoldEnd)
      }
    }
  }, [messageRef, handleHold])

  return (
    <div
      ref={messageRef}
      className={`chat-message ${message.role} ${message.status || 'done'}`}
    >
      <ReactMarkdown>{message.content}</ReactMarkdown>
    </div>
  )
}

export default ChatMessage
