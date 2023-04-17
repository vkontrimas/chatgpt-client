import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../redux/user'

import '../css/UserPanel.css'

const UserPanel = () => {
  const { name } = useSelector(state => state.user)
  const dispatch = useDispatch()

  return (
    <div className="user-panel">
      <h2 className="user-panel-name">{name}</h2>
      <button
        className="button-clear user-panel-logout"
        onClick={() => dispatch(logout())}
        aria-label="log out"
      >
        <i className="fa fa-sign-out fa-2x" />
      </button>
    </div>
  )
}

export default UserPanel
