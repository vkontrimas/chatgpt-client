import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../redux/user'

import './UserPanel.css'

const UserPanel = () => {
  const { name } = useSelector(state => state.user)
  const dispatch = useDispatch()

  return (
    <div className="user-panel">
      <h2 className="user-panel-name">{name}</h2>
      <button
        className="button2 user-panel-logout"
        onClick={() => dispatch(logout())}
      >
        Log out
      </button>
    </div>
  )
}

export default UserPanel
