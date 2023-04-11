import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const Authorized = ({ children }) => {
  const user = useSelector(state => state.user)
  if (!user.token) {
    return <Navigate to='/' replace/>
  }

  return children
}

export default Authorized
