import '../css/ChatMessageView.css'

import { useMemo, useState, useCallback } from 'react'
import { useSelector } from 'react-redux'

import ChatMessage from './ChatMessage'

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

const GrabbedMessages = ({ grabbedMessages }) => {
  if (!grabbedMessages || grabbedMessages.length === 0) { return }

  return (
    <ChatMessageContextMenu>
      <div className='chat-message-list'>
        {grabbedMessages.map(message => (<ChatMessage key={message.id} message={message} />))}
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
      <GrabbedMessages grabbedMessages={grabbedMessages} />
    </div>
  )
}

export default ChatMessageView
