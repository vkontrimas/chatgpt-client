import './Message.css'

const Message = ({ message }) => {
  const { type, content } = message

  return (
    <div class={`message message-type-${type}`}>{content}</div>
  )
}

export default Message
