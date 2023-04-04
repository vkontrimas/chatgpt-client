import { useState } from 'react'
import MessageInput from './components/MessageInput'
import Message from './components/Message'

import './App.css'

const initialMessages = [
  {
    type: "user",
    content: "hello",
  },
  {
    type: "ai",
    content: "hello",
  },
]

const App = () => {
  const [messages, setMessages] = useState(initialMessages)

  return (
    <div className="App">
      {messages.map((message) => <Message message={message}/>)}
      <MessageInput />
    </div>
  )
}

export default App
