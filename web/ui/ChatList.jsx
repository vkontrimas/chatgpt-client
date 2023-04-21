import '../css/ChatList.css'

import axios from 'axios'
import { useEffect, useMemo, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'

import Loading from './Loading'
import { setChats, setLoading, destroyChat } from '../redux/chat_slice'

const ChatListItem = ({ selected, id, title, handleDestroy, handleNavigate }) => (
  <div className={`chat-list-item ${selected ? 'selected' : ''}`}>
    <h3
      className='chat-list-item-title'
      onClick={handleNavigate}
    >
      {title}
    </h3>
      <button
      className='button-clear chat-list-item-button'
      onClick={handleDestroy}
      aria-label='Delete chat'
      >
      <i className='fa fa-trash-o fa-2x'></i>
      </button>
  </div>
)


const ChatList = (props) => {
  const { map, loading } = useSelector(state => state.chat)
  const bearer = useSelector(state => state.user?.bearer)
  const dispatch = useDispatch()
  const params = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const loadChats = async () => {
      dispatch(setLoading(true))
      const response = await axios.get('/api/chat', { headers: { Authorization: bearer } })
      dispatch(setChats(response.data))
      dispatch(setLoading(false))
    }
    loadChats()
  }, [])

  const handleDestroy = useCallback((id) => {
    dispatch(destroyChat(id))
    axios.delete(`/api/chat/${id}`, { headers: { Authorization: bearer }})
    if (id === params.chatId) {
      navigate('/', { replace: true })
    }
  }, [params.chatId, dispatch, navigate])

  const handleNavigate = useCallback((id) => {
    if (id !== params.chatId) {
      navigate(`/chat/${id}`)
    }
  }, [params.chatId, navigate])

  const listItems = useMemo(() => { 
    return Object
      .values(map)
      .map(({ id, title }) => (
        <ChatListItem
          selected={id === params.chatId}
          key={id}
          title={title}
          handleDestroy={() => handleDestroy(id)}
          handleNavigate={() => handleNavigate(id)}
        />
      ))
  }, [map, params.chatId, destroyChat])

  return (
    <>
      { loading && <Loading /> }
      {
        !loading &&
          <div className='chat-list'>
            {listItems}
            <button
              className='button-clear good chat-list-add-button'
              style={params.chatId ? null : { display: 'none' }}
              onClick={() => { navigate('/') }}
              aria-label='create chat'
            >
              <i className='fa fa-plus-square fa-2x'/>
            </button>
          </div>
      }
    </>
  )
}

export default ChatList
