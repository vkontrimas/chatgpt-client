import { useState, } from 'react'
import { OPENAI_API_KEY } from '../config'

export const useOpenAIChat = () => {
  const [messages, setMessages] = useState([])

  const sendMessage = (message) => {
    setMessages(messages.concat({
      type: 'user',
      content: message,
    }))
  }

  return [
    messages,
    sendMessage,
  ]
}
