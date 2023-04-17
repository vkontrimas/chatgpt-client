import '../css/Chat.css'

import ChatTitleBar from './ChatTitleBar'
import ChatInput from './ChatInput'

import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

const Chat = () => {
  const { chatId } = useParams()
  const { id, title, messages } = useSelector(state => state.chat.list[chatId])

  return (
    <div className='chat'>
      <ChatTitleBar className={'test'} title={title} />
      <div className='chat-scroll-area'> I'm the chat! </div>
      <ChatInput />
    </div>
  )
}

export default Chat
