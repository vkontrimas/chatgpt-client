import '../css/Chat.css'

import ChatTitleBar from './ChatTitleBar'
import ChatInput from './ChatInput'
import ChatMessageScrollView from './ChatMessageScrollView'
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
      <ChatMessageScrollView messages={[]} />
      <ChatInput />
    </div>
  )
}

export default Chat
