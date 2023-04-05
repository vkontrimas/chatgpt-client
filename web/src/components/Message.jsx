import './Message.css'

const Message = ({ message }) => {
  const { role, content } = message

  return (
    <div className={`message message-role-${role}`}>{content}</div>
  )
}

export default Message
