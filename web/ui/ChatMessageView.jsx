import '../css/ChatMessageView.css'

import { useSelector, useDispatch } from 'react-redux'

import ChatMessage from './ChatMessage'
import { grabMessage } from '../redux/current_thread'

const ChatMessageView = (props) => {
  const dispatch = useDispatch()
  const shownMessages = useSelector(state => state.currentThread.shownMessages)

  const handleOpenContext = (messageId) => dispatch(grabMessage(messageId))

  return (
    <div className='chat-message-view'>
      {shownMessages.map(message => (<ChatMessage key={message.id} message={message} handleOpenContext={handleOpenContext} />))}
    </div>
  )
}

export default ChatMessageView
