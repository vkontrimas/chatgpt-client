import '../css/ChatMessage.css'

import ReactMarkdown from 'react-markdown'

const ChatMessage = ({ message }) => {
  return (
    <div className={`chat-message ${message.role} ${message.status || 'done'}`}>
      <ReactMarkdown>{message.content}</ReactMarkdown>
    </div>
  )
}

export default ChatMessage
