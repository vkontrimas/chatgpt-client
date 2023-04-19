import { Navigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout, login } from '../redux/user'
import Loading from './Loading'


const LoggedIn = ({ children }) => {
  const location = useLocation()
  const user = useSelector(state => state.user)

  if (user) {
    return children
  }
  else {
    // TODO: send current loc to navigate back
    return <Navigate to={'/login'} replace />
  }
}

export default LoggedIn
