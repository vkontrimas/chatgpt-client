import '../css/ChatMessageView.css'

import { useSelector } from 'react-redux'

import ChatMessage from './ChatMessage'

const ChatMessageView = (props) => {
  const shownMessages = useSelector(state => state.currentThread.shownMessages)

  return (
    <div className='chat-message-view'>
      {shownMessages.map(message => (<ChatMessage key={message.id} message={message} />))}
    </div>
  )
}

export default ChatMessageView
