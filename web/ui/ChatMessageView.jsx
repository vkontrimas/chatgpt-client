import '../css/ChatMessageView.css'

import ChatMessage from './ChatMessage'

const ChatMessageView = ({ messages }) => {
  return (
    <div className='chat-message-view'>
      {messages.map(message => (<ChatMessage key={message.id} message={message} />))}
    </div>
  )
}

export default ChatMessageView
