import '../css/ChatMessageView.css'

import { useSelector } from 'react-redux'

import ChatMessage from './ChatMessage'

const ChatMessageView = ({ chatId }) => {
  const messages = useSelector(state => state.chat.list[chatId]?.messages)

  return (
    <div className='chat-message-view'>
      {messages.map(message => (<ChatMessage key={message.id} message={message} />))}
    </div>
  )
}

export default ChatMessageView
