import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

const LoggedOut = ({ children }) => {
  const user = useSelector(state => state.user)

  if (user) {
    return <Navigate to={'/'} replace />
  } else {
    return children
  }
}

export default LoggedOut
