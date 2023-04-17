import '../css/ChatTitleBar.css'

import axios from 'axios'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { destroyChat } from '../redux/chat_slice'

const ChatTitleBar = (params) => {
  const bearer = useSelector(state => state.user.token?.bearer)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { title, selected, id } = {
    selected: params.selected || false,
    title: params.title,
    id: params.id,
  }

  const handleDestroy = () => {
    dispatch(destroyChat(id))
    axios.delete(`/api/chat/${id}`, { headers: { Authorization: bearer }})
    navigate('/', { replace: true })
  }

  return (
    <div className={`chat-title-bar ${selected ? 'selected' : ''}`}>
      <h3 className='chat-title-bar-title'>
        {title}
      </h3>
      <button
        className='button-clear chat-title-bar-button'
        onClick={handleDestroy}
        aria-label='Delete chat'
      >
        <i className='fa fa-trash-o fa-2x'></i>
      </button>
    </div>
  )
}

export default ChatTitleBar

