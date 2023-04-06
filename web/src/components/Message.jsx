import './Message.css'
import ReactMarkdown from 'react-markdown'

const Message = ({ message }) => {
  const { user, content, state } = message

  return (
    <div className={`message-container ${user}`}>
      <div className={`message ${user} ${state || ''}`}>
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  )
}

export default Message
