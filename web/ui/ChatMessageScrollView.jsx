import '../css/ChatMessageScrollView.css'

import ChatMessageView from './ChatMessageView' 

const ChatMessageScrollView = ({ messages }) => {
  return (
    <div className='chat-message-scroll-view'> 
      <ChatMessageView messages={messages} />
    </div>
  )
}

export default ChatMessageScrollView
