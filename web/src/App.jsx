import { useEffect } from 'react'
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

  return (
    <div className="App">
      <h1>Huddle</h1>
      <div className="messages">
        {messages.map((message, i) => <Message key={i} message={message}/>)}
      </div>

      <MessageInput />
    </div>
  )
}

export default App
