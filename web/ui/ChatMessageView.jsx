import '../css/ChatMessageView.css'

import { useMemo, useState, useCallback } from 'react'
import { useSelector } from 'react-redux'

import ChatMessage from './ChatMessage'


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
    <div className='chat-message-view'>
      {shownMessages.map(message => (<ChatMessage key={message.id} message={message} handleOpenContext={handleOpenContext} />))}
      {grabbedMessages.length > 0 && (
        <div className='chat-message-view-grabbed'>
          Grabbed messages!
        </div>
      )}
    </div>
  )
}

export default ChatMessageView
