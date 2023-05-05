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

const ChatMessage = ({ message, handleSelectMessage }) => {
  const handleHold = useCallback(() => {
    handleSelectMessage(message.id)
  }, [handleSelectMessage, message.id])

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

const MessageList = ({pastTopId, bottomId, allMessages, handleSelectMessage}) => {
  if (pastTopId === 'thread-top') { pastTopId = null }

  const messageElements = useMemo(() => {
    let currentId = bottomId
    const messages = []
    while (currentId !== pastTopId) {
      messages.push(allMessages[currentId])
      currentId = allMessages[currentId].aboveMessageId
    }
    messages.reverse()

    return messages.map(message => (
      <ChatMessage key={message.id} message={message} handleSelectMessage={handleSelectMessage} />
    ))
  }, [pastTopId, bottomId, allMessages])

  return <div className='chat-message-list'>{messageElements}</div>
}

const MessageSelectionContextMenu = ({ role, handleEdit, handleMultiSelect }) => {
  const editIcon = role === 'assistant' 
    ? <i className='fa fa-refresh fa-lg'/> 
    : <i className='fa fa-pencil fa-lg'/>


    return (
      <div className='chat-message-context-menu'>
        <button
          className='button-clear good chat-message-context-menu-button'
          aria-label='Edit message'
          onClick={() => handleEdit()}
        >
          {editIcon}
        </button>
        <button
          className='button-clear chat-message-context-menu-button'
          aria-label='Delete message'
          onClick={() => handleMultiSelect('delete')}
        >
          <i className='fa fa-trash-o fa-lg'></i>
        </button>
        <button
          className='button-clear good chat-message-context-menu-button'
          aria-label='Share message'
          onClick={() => handleMultiSelect('share')}
        >
          <i className='fa fa-share-alt fa-lg'></i>
        </button>
      </div>
    )
}

const MessageMultiSelectionConfirmMenu = ({ type, handleConfirm, handleCancel }) => {
  const confirmIcon = type === 'delete' 
    ? <i className='fa fa-trash-o fa-lg'/>
    : <i className='fa fa-share-alt fa-lg'/>

  const confirmClass = type === 'delete'
    ? 'button-clear chat-message-context-menu-button'
    : 'button-clear good chat-message-context-menu-button'

  return (   
    <div className='chat-message-context-menu'>
      <button
        className={confirmClass}
        aria-label='Delete message'
        onClick={() => handleConfirm()}
      >
        {confirmIcon}
      </button>
      <button
        className='button-clear chat-message-context-menu-button'
        aria-label='Share message'
        onClick={() => handleCancel()}
      >
        <i className='fa fa-times fa-lg'></i>
      </button>
    </div>
  )
}

const MessageSelection = ({
  type,
  pastTopId,
  bottomId,
  allMessages,
  setSelection,
  threadBottomId,
  selectMessage,
}) => {
  const typeIsSingle = type === 'single'

  const handleMultiSelect = (newType) => {
    setSelection(threadBottomId, pastTopId, newType)
  }

  const handleCancelMultiSelect = () => {
    setSelection(null, null, 'single')
  }

  return (
    <div className={`chat-message-context ${typeIsSingle ? '' : 'collapse-messages'}`}>
      {typeIsSingle && (
        <MessageSelectionContextMenu
          role={allMessages[bottomId].role}
          handleEdit={() => {}}
          handleMultiSelect={handleMultiSelect}
        />
      )}
      {!typeIsSingle && (
        <MessageMultiSelectionConfirmMenu
          type={type}
          handleConfirm={() => {}}
          handleCancel={handleCancelMultiSelect}
        />
      )}
      <MessageList
        pastTopId={pastTopId}
        bottomId={bottomId}
        allMessages={allMessages}
        handleSelectMessage={selectMessage}
      />
    </div>
  )
}

const ChatMessageView = (props) => {
  const threadBottomId = useSelector(state => {
    const currentId = state.currentThread.currentBranch
    return state.currentThread.branches[currentId].bottomId
  })
  const allMessages = useSelector(state => state.currentThread.allMessages)

  const [selectionType, setSelectionType] = useState('single')
  const [selectionBottomId, setSelectionBottomId] = useState(null)
  const [selectionPastTopId, setSelectionPastTopId] = useState(null)

  const setSelection = (bottomId, pastTopId, type) => {
    setSelectionBottomId(bottomId)
    setSelectionPastTopId(pastTopId)
    setSelectionType(type)
  }

  const selectMessage = (messageId) => {
    if (selectionType === 'single') {
      setSelectionBottomId(messageId)
    }
    setSelectionPastTopId(allMessages[messageId].aboveMessageId)
  }

  return (
    <div className='chat-message-view'>
      {selectionBottomId && (
        <>
          <MessageList
            pastTopId={null}
            bottomId={selectionPastTopId}
            allMessages={allMessages}
            handleSelectMessage={selectMessage}
          />
          <MessageSelection 
            type={selectionType}
            pastTopId={selectionPastTopId}
            bottomId={selectionBottomId}
            allMessages={allMessages}
            setSelection={setSelection}
            selectMessage={selectMessage}
            threadBottomId={threadBottomId}
          />
        </>
      )}
      <MessageList
        pastTopId={selectionBottomId}
        bottomId={threadBottomId}
        allMessages={allMessages}
        handleSelectMessage={selectMessage}
      />
    </div>
  )
}

export default ChatMessageView
