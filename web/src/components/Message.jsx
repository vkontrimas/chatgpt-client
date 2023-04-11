import './Message.css'
import ReactMarkdown from 'react-markdown'

const Message = ({ message }) => {
  const { type, content, state } = message

  return (
    <div className={`message-container ${type}`}>
      <div className={`message ${type} ${state || ''}`}>
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  )
}

export default Message
