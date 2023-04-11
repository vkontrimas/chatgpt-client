import { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import { fetchAll } from '../redux/message'
import './Chat.css'

const Chat = () => {
  const messages = useSelector(state => state.message.messages)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchAll())
  }, [])

  const scrollRef = useRef(null)
  useEffect(() => {
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages])

  return (
    <div className="chat">
      <div className="chat-scroll" ref={scrollRef}>
        <div className="chat-messages">
        {messages.map((message, i) => <ChatMessage key={i} message={message}/>)}
        </div>
      </div>
      <ChatInput />
    </div>
  )
}

export default Chat
