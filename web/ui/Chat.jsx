import '../css/Chat.css'

import axios from 'axios'
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'

import ChatTitleBar from './ChatTitleBar'
import ChatInput from './ChatInput'
import ChatMessageScrollView from './ChatMessageScrollView'
import Loading from './Loading'
import { setChats, setMessages } from '../redux/chat_slice'


const Chat = () => {
  const { chatId } = useParams()
  const dispatch = useDispatch()
  const bearer = useSelector(state => state.user.token?.bearer)
  const chat = useSelector(state => state.chat.map[chatId])
  const messages = chat?.messages

  useEffect(() => {
    if (chat && messages) { return }

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
  }, [])

  if (!chat || !messages) {
    return <Loading />
  }

  return (
    <div className='chat'>
      <ChatTitleBar id={chat.id} title={chat.title} />
      <ChatMessageScrollView messages={chat.messages} />
      <ChatInput />
    </div>
  )
}

export default Chat
