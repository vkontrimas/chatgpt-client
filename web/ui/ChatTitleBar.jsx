import '../css/ChatTitleBar.css'

import axios from 'axios'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'

import { destroyChat } from '../redux/chat_slice'
import { close } from '../redux/sidebar'

const ChatTitleBar = (props) => {
  const bearer = useSelector(state => state.user?.bearer)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const params = useParams()

  const { title, selected, id } = {
    selected: props.selected || false,
    title: props.title,
    id: props.id,
  }

  const handleDestroy = () => {
    dispatch(destroyChat(id))
    axios.delete(`/api/chat/${id}`, { headers: { Authorization: bearer }})
    if (id === params.chatId) {
      navigate('/', { replace: true })
    }
  }

  return (
    <div className={`chat-title-bar ${selected ? 'selected' : ''}`}>
      <h3
        className='chat-title-bar-title'
        onClick={() => {
          if (params.chatId !== props.id) {
            navigate(`/chat/${props.id}`)
          }
          dispatch(close())
        }}
      >
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

