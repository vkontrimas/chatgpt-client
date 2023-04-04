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

  const sendMessage = (content) => {
    const newMessage = {
      type: "user",
      content
    }
    setMessages(messages.concat(newMessage))
  }

  return (
    <div className="App">
      <h1>Huddle</h1>
      <div className="messages">
        {/* TODO: Add a key to messages! */}
        {messages.map((message) => <Message message={message}/>)}
      </div>

      <MessageInput sendMessage={sendMessage}/>
    </div>
  )
}

export default App
