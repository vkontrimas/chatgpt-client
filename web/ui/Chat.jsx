import '../css/Chat.css'

import axios from 'axios'
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'

import ChatTitleBar from './ChatTitleBar'
import ChatInput from './ChatInput'
import ChatMessageScrollView from './ChatMessageScrollView'
import Loading from './Loading'
import { setChats, setMessages, addMessage, updateMessage } from '../redux/chat_slice'

import completeThread from '../completion'


const Chat = () => {
  const { chatId } = useParams()
  const dispatch = useDispatch()
  const bearer = useSelector(state => state.user?.bearer)
  const chat = useSelector(state => state.chat.map[chatId])
  const messages = chat?.messages

  useEffect(() => {
    const fetchMessages = async () => {
      // TODO: this request should really return the chat info too!
      const response = await axios.get(`/api/chat/${chatId}`, { headers: { Authorization: bearer } })
      if (chat) {
        dispatch(setMessages({ chatId, messages: response.data.messages }))
      }
      else {
        dispatch(setChats([ { id: chatId, title: 'Untitled Chat', messages: response.data.messages } ]))
      }
    }

    fetchMessages()
  }, [chatId])

  if (!chat || !messages) {
    return <Loading />
  }

  const handleSubmitMessage = async (message) => {
    const response = await axios.post(
      `/api/chat/${chatId}/add`,
      {
        role: 'user',
        content: message,
      },
      {
        headers: {
          Authorization: bearer,
        }
      }
    )
    dispatch(addMessage({ chatId, message: response.data }))

    // begin completion in the background
    completeThread(
      bearer,
      chatId,
      (message) => dispatch(addMessage({ chatId, message })),
      (message) => dispatch(updateMessage({ chatId, message })),
    )
  }

  const inputEnabled = messages.length === 0 
    || (messages[messages.length - 1].status === 'done' &&
       messages[messages.length - 1].role === 'assistant')

  return (
    <div className='chat'>
      <ChatTitleBar id={chat.id} title={chat.title} />
      <ChatMessageScrollView messages={chat.messages} />
      <ChatInput submitMessage={handleSubmitMessage} enabled={inputEnabled} />
    </div>
  )
}

export default Chat
