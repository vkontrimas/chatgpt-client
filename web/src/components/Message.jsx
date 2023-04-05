import './Message.css'
import ReactMarkdown from 'react-markdown'

const Message = ({ message }) => {
  const { role, content } = message

  return (
    <div className={`message message-role-${role}`}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}

export default Message
