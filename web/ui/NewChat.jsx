import axios from 'axios'
import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Navigate } from 'react-router-dom'

import { addChat } from '../redux/chat_slice'

const NewChat = () => {
  const dispatch = useDispatch()
  const bearer = useSelector(state => state.user.token?.bearer)
  const [chatId, setChatId] = useState(null)

  if (!bearer) {
    // TODO: idk if React has some fancy error handling convention
    throw 'not logged in'
  }

  useEffect(() => {
    const createChat = async () => {
      const response = await axios.post(
        '/api/chat',
        { model: 'openai' },
        { headers: { Authorization: bearer, } },
      )
      dispatch(addChat(response.data)) 
      setChatId(response.data.id)
    }

    createChat()
  }, [])
  return (
    <>
      {chatId && <Navigate to={`/chat/${chatId}`} replace />}
      {chatId || <i className='fa fa-cycle fa-spinner fa-2x' />}
    </>
  )
}

export default NewChat
