import { useSelector } from 'react-redux'

const ChatView = ({ chatId }) => {
  const messages = useSelector(state => state.chat.list[chatId]?.messages)

  return (
    <div> I'm a chat 😊 </div>
  )
}

export default ChatView
