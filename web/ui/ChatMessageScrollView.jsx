import '../css/ChatMessageScrollView.css'

import { useRef, useEffect } from 'react'

import ChatMessageView from './ChatMessageView' 

const ChatMessageScrollView = ({ messages }) => {
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div ref={scrollRef} className='chat-message-scroll-view'> 
      <ChatMessageView messages={messages} />
    </div>
  )
}

export default ChatMessageScrollView
