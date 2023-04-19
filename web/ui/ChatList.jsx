import '../css/ChatList.css'

import axios from 'axios'
import { useEffect, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'

import ChatTitleBar from './ChatTitleBar'
import Loading from './Loading'
import { setChats, setLoading } from '../redux/chat_slice'

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
      console.log(response.data)
      dispatch(setChats(response.data))
      dispatch(setLoading(false))
    }
    loadChats()
  }, [])

  const listItems = useMemo(() => { 
    return Object
      .values(map)
      .map(({ id, title }) => (<ChatTitleBar selected={id === params.chatId} key={id} id={id} title={title}/>))
  }, [map, params])

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
