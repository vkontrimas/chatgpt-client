import { useSelector } from 'react-redux'

import '../css/Main.css'

import UserPanel from './UserPanel'
import ChatTitleBar from './ChatTitleBar'
import ChatList from './ChatList'

const Main = () => {
  const chat = useSelector(state => state.chat)
  console.log(chat)

  return (
    <div className='main'>
      <div className='main-topbar'>
        <ChatTitleBar title={'Untitled Chat'}/>
      </div>
      <div className='main-sidebar'>
        <ChatList items={chat.list} />
      </div>
      <div className='main-sidebar-tab'></div>
      <div className='main-content'></div>
      <div className='main-user'><UserPanel /></div>
    </div>
  )
}

export default Main
