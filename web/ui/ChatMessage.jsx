import '../css/ChatMessage.css'

import { useRef, useState, useEffect, useCallback } from 'react';

import ReactMarkdown from 'react-markdown'

const useLongHold = (handleHold, messageRef, holdTimeMs = 250) => {
  useEffect(() => {
    const target = messageRef.current
    if (!target) { return }

    let timer = null

    const handleHoldStart = (event) => {
      timer = setTimeout(() => {
        event.preventDefault()
        handleHold()
        if ('vibrate' in navigator) {
          navigator.vibrate([25])
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
}

const ChatMessageContent = ({ handleHold, message }) => {
  const messageRef = useRef(null)
  useLongHold(handleHold, messageRef)

  return (
    <div
      ref={messageRef}
      className={`chat-message ${message.role} ${message.status || 'done'}`}
      onBlur={() => console.log('blur')}
    >
      <ReactMarkdown>{message.content}</ReactMarkdown>
    </div>
  )
}

const ChatMessage = ({ message, handleOpenContext }) => {
  const handleHold = useCallback(() => {
    handleOpenContext(message.id)
  }, [handleOpenContext, message.id])

  return <ChatMessageContent handleHold={handleHold} message={message} />
}

export default ChatMessage
