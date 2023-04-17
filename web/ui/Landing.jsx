import '../css/Landing.css'

import axios from 'axios'
import { useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import ChatInput from './ChatInput'
import ChatMessageScrollView from './ChatMessageScrollView'
import { setChats, addMessage } from '../redux/chat_slice'

const Landing = () => {
  const bearer = useSelector(state => state.user.token?.bearer)
  const [messages, setMessages] = useState([])
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const submitMessageToNewChat = useCallback(async (message) => {
    setMessages(messages.concat({ 
      id: 'fake-message',
      role: 'user',
      content: message,
      status: 'pending',
    }))

    /*
     * TODO: 
     *  - POST new chat - maybe clear the state?
     *  - navigate to it
     *
     *  dispatch appropriate actions
     */

    const chatResponse = await axios.post(
      '/api/chat',
      {
        model: 'openai',
      },
      {
        headers: {
          Authorization: bearer,
        }
      }
    )
    const chat = chatResponse.data
    dispatch(setChats([chat]))

    const addMessageResponse = await axios.post(
      `/api/chat/${chat.id}/add`,
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
    dispatch(addMessage({ chatId: chat.id, message: addMessageResponse.data }))
    navigate(`/chat/${chat.id}`, { replace: true })

    // TODO: also begin completion!
  }, [setMessages, messages, dispatch, navigate])

  return (
    <div className='landing'>
      <div className='landing-content'>
        <ChatMessageScrollView messages={messages} />
        {/* TODO: show some branding / info here if no messages around! */}
      </div>
      <div className='landing-input'>
        <ChatInput
          submitMessage={(message) => { submitMessageToNewChat(message) }}
          enabled={messages.length === 0}
        />
      </div>
    </div>
  )
}

export default Landing
