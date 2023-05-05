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
          className='button-clear good chat-message-context-menu-button'
          aria-label='Delete message'
        >
          <i className='fa fa-refresh fa-lg'></i>
        </button>
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

const MessageList = ({pastTopId, bottomId, allMessages}) => {
  if (pastTopId === 'thread-top') { pastTopId = null }

  const messageElements = useMemo(() => {
    let currentId = bottomId
    const messages = []
    while (currentId !== pastTopId) {
      messages.push(allMessages[currentId])
      currentId = allMessages[currentId].previous
    }
    messages.reverse()

    return messages.map(message => (
      <ChatMessage key={message.id} message={message} handleOpenContext={() => {}} />
    ))
  }, [pastTopId, bottomId, allMessages])
  
  return <div className='chat-message-list'>{messageElements}</div>
}

const MessageSelection = ({pastTopId, bottomId, allMessages}) => {
  return <MessageList pastTopId={pastTopId} bottomId={bottomId} allMessages={allMessages} />
}

const ChatMessageView = (props) => {
  const threadBottomId = useSelector(state => {
    const currentId = state.currentThread.currentBranch
    return state.currentThread.branches[currentId].end
  })
  const allMessages = useSelector(state => state.currentThread.allMessages)

  const [selectionBottomId, setSelectionBottomId] = useState('SQyigiY2Tpupk8Hrquenzw')
  const [selectionPastTopId, setSelectionPastTopId] = useState('pACIgc3pTtC9vDGVew5BmQ')

  return (
    <div className='chat-message-view'>
      <MessageList pastTopId={'thread-top'} bottomId={selectionPastTopId || threadBottomId} allMessages={allMessages} />
      {selectionBottomId && selectionPastTopId && (
        <>
          <MessageSelection pastTopId={selectionPastTopId} bottomId={selectionBottomId} allMessages={allMessages} />
          <MessageList pastTopId={selectionBottomId} bottomId={threadBottomId} allMessages={allMessages} />
        </>
      )}
    </div>
  )
}

export default ChatMessageView
