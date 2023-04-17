import '../css/Landing.css'

import axios from 'axios'
import { useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import ChatInput from './ChatInput'
import ChatMessageScrollView from './ChatMessageScrollView'
import { addChats } from '../redux/chat_slice'

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

    return

    const response = await axios.post(
      '/api/chat',
      {
        model: 'openai',
        messages: [{
          role: 'user',
          content: message,
        }],
      },
      {
        headers: {
          Authorization: bearer,
        }
      }
    )
    const chat = response.data
    
    // TODO: also request completion!

    dispatch(addChats([chat]))
    navigate(`/chat/${chat.id}`, { replace: true })
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
