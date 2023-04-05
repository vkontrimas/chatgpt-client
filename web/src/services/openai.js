import { Configuration, OpenAIApi } from 'openai'

import { useState, } from 'react'
import { OPENAI_API_KEY } from '../config'

const createOpenAIApi = () => new OpenAIApi(
  new Configuration({
    apiKey: OPENAI_API_KEY,
  })
)

export const useOpenAIChat = () => {
  const [api] = useState(createOpenAIApi)

  const [messages, setMessages] = useState([])
  const sendMessage = async (message) => {
    const newMessages = messages.concat({
      role: 'user',
      content: message
    })

    setMessages(newMessages)

    const completion = await api.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: newMessages,
    })
    console.info('completion', completion.data)

    if (completion.data.choices) {
      setMessages(newMessages.concat(completion.data.choices[0].message))
    }
  }

  return [
    messages,
    sendMessage,
  ]
}
