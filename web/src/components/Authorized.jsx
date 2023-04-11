import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

const Authorized = ({ children }) => {
  const location = useLocation()
  const user = useSelector(state => state.user)
  if (!user.token) {
    return <Navigate to='/login' replace state={{ from: location }}/>
  }

  return children
}

export default Authorized
