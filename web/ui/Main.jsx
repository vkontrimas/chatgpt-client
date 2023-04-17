import { useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, useNavigate, Outlet } from 'react-router-dom'

import '../css/Main.css'

import UserPanel from './UserPanel'
import ChatTitleBar from './ChatTitleBar'
import ChatList from './ChatList'
import ChatInput from './ChatInput'

import { fetchChats } from '../redux/chat_slice'

const Main = () => {
  const params = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const chat = useSelector(state => state.chat)

  useEffect(() => { dispatch(fetchChats()) }, [])

  useEffect(() => {
    // TODO: determine best (latest) chat to open in the future 
    if (!params.chatId) {
      navigate('chat/new', { replace: true })
    }
  }, [params.chatId])

  return (
    <div className='main'>
      <div className='main-topbar'>
        <ChatTitleBar title={'Untitled Chat'}/>
      </div>
      <div className='main-sidebar'>
        <ChatList items={Object.values(chat.list)} isLoading={chat.loading} />
      </div>
      <div className='main-sidebar-tab'></div>
      <div className='main-content'>
        <Outlet />
      </div>
      <div className='main-user'><UserPanel /></div>
    </div>
  )
}

export default Main
