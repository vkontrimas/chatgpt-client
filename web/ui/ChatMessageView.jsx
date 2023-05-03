import '../css/ChatMessageView.css'

import { useMemo, useState, useRef, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'

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

const ChatMessageContextMenu = ({children}) => {
  return (
    <div className='chat-message-context'>
      <div className='chat-message-context-menu'>
        <button
          className='button-clear chat-message-context-menu-button'
          aria-label='Delete message'
        >
          <i className='fa fa-trash-o fa-lg'></i>
        </button>
        <button
          className='button-clear good chat-message-context-menu-button'
          aria-label='Delete message'
        >
          <i className='fa fa-share-alt fa-lg'></i>
        </button>
      </div>
      {children}
    </div>
  )
}

const GrabbedMessages = ({ grabbedMessages, handleOpenContext }) => {
  if (!grabbedMessages || grabbedMessages.length === 0) { return }

  return (
    <ChatMessageContextMenu>
      <div className='chat-message-list'>
        {grabbedMessages.map(message => (
          <ChatMessage key={message.id} message={message} handleOpenContext={handleOpenContext}/>
        ))}
      </div>
    </ChatMessageContextMenu>
  )
}

const ChatMessageView = (props) => {
  const lastMessageId = useSelector(state => {
    const currentId = state.currentThread.currentBranch
    return state.currentThread.branches[currentId].end
  })

  const allMessages = useSelector(state => state.currentThread.allMessages)
  const [grabbedMessages, setGrabbedMessages] = useState([])

  const shownMessages = useMemo(() => {
    let currentId = grabbedMessages.length > 0 ? grabbedMessages[0].previous : lastMessageId
    const shownMessages = []
    while (currentId) {
      shownMessages.push(allMessages[currentId])
      currentId = allMessages[currentId]?.previous
    }
    shownMessages.reverse()
    return shownMessages
  }, [lastMessageId, allMessages, grabbedMessages])

  const handleOpenContext = useCallback((messageId) => {
    let currentId = lastMessageId
    const grabbedMessages = []
    while (currentId && allMessages[messageId].previous !== currentId) {
      grabbedMessages.push(allMessages[currentId])
      currentId = allMessages[currentId].previous
    }
    grabbedMessages.reverse()
    setGrabbedMessages(grabbedMessages)
  }, [lastMessageId, allMessages])

  return (
    <div className='chat-message-view chat-message-list'>
      {shownMessages.map(message => (<ChatMessage key={message.id} message={message} handleOpenContext={handleOpenContext} />))}
      <GrabbedMessages grabbedMessages={grabbedMessages} handleOpenContext={handleOpenContext} />
    </div>
  )
}

export default ChatMessageView
