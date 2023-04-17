import '../css/Main.css'

import UserPanel from './UserPanel'

const Main = () => {
  return (
    <div className='main'>
      <div className='main-topbar'></div>
      <div className='main-sidebar'></div>
      <div className='main-sidebar-tab'></div>
      <div className='main-content'></div>
      <div className='main-user'><UserPanel /></div>
    </div>
  )
}

export default Main
