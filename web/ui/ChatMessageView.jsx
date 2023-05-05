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
        //event.preventDefault()
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

const SelectedMessageList = (props) => {
  const { isCollapsed } = props
  return (
    <div className={`selected-messages ${isCollapsed ? 'collapsed' : ''}`}>
      <MessageList {...props} />
    </div>
  )
}

const SingleSelectionContextMenu = ({ isAssistant, handleEdit, handleDelete, handleShare }) => {
  const editIcon = isAssistant
    ? <i className='fa fa-refresh fa-lg'/> 
    : <i className='fa fa-pencil fa-lg'/>

    return (
      <div className='chat-message-context-menu'>
        <button
          className='button-clear good chat-message-context-menu-button'
          aria-label='Edit message'
          onClick={handleEdit}
        >
          {editIcon}
        </button>
        <button
          className='button-clear good chat-message-context-menu-button'
          aria-label='Share message'
          onClick={() => {}}
        >
          <i className='fa fa-clone fa-lg'></i>
        </button>
        <button
          className='button-clear good chat-message-context-menu-button'
          aria-label='Share message'
          onClick={handleShare}
        >
          <i className='fa fa-share-alt fa-lg'></i>
        </button>
        <button
          className='button-clear chat-message-context-menu-button'
          aria-label='Delete message'
          onClick={handleDelete}
        >
          <i className='fa fa-trash-o fa-lg'></i>
        </button>
      </div>
    )
}

const MultiSelectionConfirmMenu = ({ type, handleConfirm, handleCancel, children }) => {
  return (   
    <div className='chat-message-context-menu'>
      {children}
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

const ChatMessageView = (props) => {
  const threadBottomId = useSelector(state => {
    const currentId = state.currentThread.currentBranch
    return state.currentThread.branches[currentId].bottomId
  })
  const allMessages = useSelector(state => state.currentThread.allMessages)

  const [selectionType, setSelectionType] = useState('single')
  const [selectedId, setSelectedId] = useState(null)
  const pastSelectedId = selectedId && allMessages[selectedId].aboveMessageId
  const multipleSelection = selectionType !== 'single'

  const clearSelection = () => {
    setSelectionType('single')
    setSelectedId(null)
  }

  const contextMenu = useMemo(() => {
    if (!selectedId) { return null }

    switch (selectionType) {
      case 'single':
        return (
          <SingleSelectionContextMenu
            isAssistant={allMessages[selectedId].role === 'assistant'}
            handleEdit={() => {}}
            handleDelete={() => setSelectionType('delete')}
            handleShare={() => setSelectionType('share')}
          />
        )
      case 'delete':
        return (
          <MultiSelectionConfirmMenu
            type={'delete'}
            handleCancel={() => setSelectionType('single')}
          >
            <button
              className='button-clear chat-message-context-menu-button'
              aria-label='Delete message'
              onClick={() => {
                clearSelection()
              }}
            >
              <i className='fa fa-trash-o fa-lg'></i>
            </button>
          </MultiSelectionConfirmMenu>
        )
      case 'share':
        return (
          <MultiSelectionConfirmMenu
            type={'delete'}
            handleCancel={() => setSelectionType('single')}
          >
            <button
              className='button-clear good chat-message-context-menu-button'
              aria-label='Share message'
              onClick={() => {
                clearSelection()
              }}
            >
              <i className='fa fa-share-alt fa-lg'></i>
            </button>
          </MultiSelectionConfirmMenu>
        )
      default:
        console.warn(selectedId, 'not implemented')
        return null
    }
  }, [selectionType, selectedId])

  return (
    <div className='chat-message-view'>
      {selectedId && (
        <>
          <MessageList
            pastTopId={null}
            bottomId={pastSelectedId}
            allMessages={allMessages}
            handleSelectMessage={setSelectedId}
          />
          <div className='chat-message-context'>
            {contextMenu}
            <SelectedMessageList
              pastTopId={pastSelectedId}
              bottomId={multipleSelection ? threadBottomId : selectedId}
              allMessages={allMessages}
              handleSelectMessage={setSelectedId}
              isCollapsed={multipleSelection}
            />
          </div>
        </>
      )}
      {!(multipleSelection || selectedId === threadBottomId) && (
        <MessageList
          pastTopId={selectedId}
          bottomId={threadBottomId}
          allMessages={allMessages}
          handleSelectMessage={setSelectedId}
        />
      )}
    </div>
  )
}

export default ChatMessageView
