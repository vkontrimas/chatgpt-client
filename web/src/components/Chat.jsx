import { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import { fetchAll, create } from '../redux/message'
import './Chat.css'

const Chat = () => {
  const messages = useSelector(state => state.message.messages)
  const dispatch = useDispatch()
  const scrollRef = useRef(null)

  useEffect(() => {
    dispatch(fetchAll())
  }, [])

  // bandaid for generating assistant replies in sequenced way
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].type === 'user') {
      dispatch(create({ type: 'assistant' }))
    }
  }, [messages])

  useEffect(() => {
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages])

  // Either there's no messsages
  // or the last message is from assisant and has no state (pending / failed)
  const chatInputEnabled = messages.length === 0 
        || (!messages[messages.length - 1].state 
          && !messages[messages.length - 1].type !== 'user')

  return (
    <div className="chat">
      <div className="chat-scroll" ref={scrollRef}>
        <div className="chat-messages">
        {messages.map((message, i) => <ChatMessage key={i} message={message}/>)}
        </div>
      </div>
      <ChatInput enabled={chatInputEnabled}/>
    </div>
  )
}

export default Chat
