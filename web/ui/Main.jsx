import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, Outlet } from 'react-router-dom'

import '../css/Main.css'

import UserPanel from './UserPanel'
import ChatTitleBar from './ChatTitleBar'
import ChatList from './ChatList'

import { fetchChats } from '../redux/chat_slice'

const Main = () => {
  const params = useParams()
  const dispatch = useDispatch()
  const chat = useSelector(state => state.chat)

  useEffect(() => { dispatch(fetchChats()) }, [])

  return (
    <div className='main'>
      <div className='main-topbar'>
        <ChatTitleBar title={'Untitled Chat'}/>
      </div>
      <div className='main-sidebar'>
        <ChatList items={chat.list} isLoading={chat.loading} />
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
