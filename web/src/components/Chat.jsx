import { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import Message from './Message'
import ChatInput from './ChatInput'
import { fetchAll } from '../redux/message'
import './Chat.css'

const Chat = () => {
  const messages = useSelector(state => state.message.messages)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchAll())
  }, [])

  const messagesRef = useRef(null)
  useEffect(() => {
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages])

  return (
    <div className="chat">
      <div className="chat-messages" ref={messagesRef}>
        {messages.map((message, i) => <Message key={i} message={message}/>)}
      </div>
      <ChatInput />
    </div>
  )
}

export default Chat
