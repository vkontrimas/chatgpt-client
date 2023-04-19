import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../redux/user'

const LoggedIn = ({ children }) => {
  const location = useLocation()
  const currentToken = useSelector(state => state.user.token)
  const dispatch = useDispatch()

  if (!currentToken) {
    return <Navigate to='/login' replace state={{ from: location }}/>
  }

  return children
}

export default LoggedIn
