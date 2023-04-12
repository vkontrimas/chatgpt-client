import Chat from '../components/Chat'
import User from '../components/User'

import './Home.css'

const MainPage = () => {
  return (
    <div className="Page Home">
      <div className="sidebar">
        <div className="sidebar-chats">
        </div>
        <User />
      </div>
      <Chat />
    </div>
  )
}

export default MainPage
