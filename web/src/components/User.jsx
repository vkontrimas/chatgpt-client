import { useDispatch } from 'react-redux'

import { logout } from '../redux/user'

import './User.css'

const User = () => {
  const dispatch = useDispatch()

  const handleLogout = () => dispatch(logout())
  const handleClear = () => {}

  return (
    <div className="user-vertical">
      <div className="user-name">Vytautas</div>
      <div className="button-row">
        <button className="user-button" onClick={handleLogout}>
          Exit
        </button>
        <button className="user-button" onClick={handleClear}>
          Clear
        </button>
      </div>
    </div>
  )
}

export default User
