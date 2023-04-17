import '../css/Chat.css'

import ChatTitleBar from './ChatTitleBar'
import ChatInput from './ChatInput'
import ChatMessageView from './ChatMessageView'

import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

const Chat = () => {
  const { chatId } = useParams()
  const { id, title, messages } = useSelector(state => state.chat.list[chatId])

  return (
    <div className='chat'>
      <ChatTitleBar title={title} />
      <div className='chat-scroll-area'>
        <ChatMessageView chatId={chatId} />
      </div>
      <ChatInput />
    </div>
  )
}

export default Chat
