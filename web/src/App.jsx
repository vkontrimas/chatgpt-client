import MessageInput from './components/MessageInput'
import Message from './components/Message'
import { useOpenAIChat } from './services/openai'

import './App.css'

const App = () => {
  const [messages, sendMessage] = useOpenAIChat()

  return (
    <div className="App">
      <h1>Huddle</h1>
      <div className="messages">
        {messages.map((message, i) => <Message key={i} message={message}/>)}
      </div>

      <MessageInput sendMessage={sendMessage}/>
    </div>
  )
}

export default App
