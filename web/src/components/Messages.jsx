import { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import Message from './Message'
import MessageInput from './MessageInput'
import { fetchAll } from '../redux/message'
import './Messages.css'

const Messages = () => {
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
    <>
      <div className="messages" ref={messagesRef}>
        {messages.map((message, i) => <Message key={i} message={message}/>)}
      </div>
      <MessageInput />
    </>
  )
}

export default Messages
