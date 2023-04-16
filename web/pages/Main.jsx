import { Outlet } from 'react-router-dom'
import Chat from '../components/Chat'
import User from '../components/User'

import './Main.css'

const MainPage = () => {
  return (
    <div className="Page Home">
      <div className="sidebar">
        <div className="sidebar-chats">
        </div>
        <User />
      </div>
      <div className="home-content">
        <Outlet />
      </div>
    </div>
  )
}

export default MainPage
