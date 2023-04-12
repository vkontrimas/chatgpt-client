import { useDispatch } from 'react-redux'

import { logout } from '../redux/user'

import './User.css'

const User = () => {
  const dispatch = useDispatch()

  return (
    <div className="user-vertical">
      <div className="user-name">Vytautas</div>
      <button className="user-button" onClick={() => dispatch(logout())}>
        Log out
      </button>
    </div>
  )
}

export default User
