import '../css/Main.css'

import UserPanel from './UserPanel'
import TopBar from './TopBar'
import ChatList from './ChatList'

const Main = () => {
  return (
    <div className='main'>
      <div className='main-topbar'><TopBar /></div>
      <div className='main-sidebar'><ChatList /></div>
      <div className='main-sidebar-tab'></div>
      <div className='main-content'></div>
      <div className='main-user'><UserPanel /></div>
    </div>
  )
}

export default Main
