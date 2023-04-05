import './Message.css'
import ReactMarkdown from 'react-markdown'

const Message = ({ message }) => {
  const { role, content } = message

  return (
    <div className={`message-container ${role}`}>
      <div className={`message ${role}`}>
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  )
}

export default Message
