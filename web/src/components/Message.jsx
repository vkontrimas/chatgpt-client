import './Message.css'
import ReactMarkdown from 'react-markdown'

const Message = ({ message }) => {
  const { user, content } = message

  return (
    <div className={`message-container ${user}`}>
      <div className={`message ${user}`}>
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  )
}

export default Message
