import { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import MessageInput from './components/MessageInput'
import Message from './components/Message'
import { fetchAll } from './redux/message'

import './App.css'

const App = () => {
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
    <div className="App">
      <div className="messages" ref={messagesRef}>
        {messages.map((message, i) => <Message key={i} message={message}/>)}
      </div>

      <MessageInput />
    </div>
  )
}

export default App
