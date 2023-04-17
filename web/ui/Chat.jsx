import '../css/Chat.css'

import ChatTitleBar from './ChatTitleBar'
import ChatInput from './ChatInput'
import ChatMessageView from './ChatMessageView'
import Loading from './Loading'

import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

const Chat = () => {
  const { chatId } = useParams()
  const chat = useSelector(state => state.chat.list[chatId])

  if (!chat) {
    return <Loading />
  }

  return (
    <div className='chat'>
      <ChatTitleBar title={chat.title} />
      <div className='chat-scroll-area'>
        <ChatMessageView chatId={chat.id} />
      </div>
      <ChatInput />
    </div>
  )
}

export default Chat
