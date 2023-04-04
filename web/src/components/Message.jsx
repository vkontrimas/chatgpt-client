import './Message.css'

const Message = ({ message }) => {
  const { type, content } = message

  return (
    <div className={`message message-type-${type}`}>{content}</div>
  )
}

export default Message
