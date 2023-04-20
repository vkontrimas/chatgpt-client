import { Outlet } from 'react-router-dom'

import '../css/Main.css'

import UserPanel from './UserPanel'
import ChatList from './ChatList'

const Main = () => {
  return (
    <div className='main'>
      <div className='main-sidebar'>
        <ChatList />
      </div>
      <div className='main-sidebar-tab'>
        <i className='fa fa-chevron-left fa-2x main-sidebar-tab-icon'/>
      </div>
      <div className='main-content'>
        <Outlet />
      </div>
      <div className='main-user'><UserPanel /></div>
    </div>
  )
}

export default Main
