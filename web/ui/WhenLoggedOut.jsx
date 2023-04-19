import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

const WhenLoggedOut = ({ children }) => {
  const bearer = useSelector(state => state.user.token?.bearer)

  if (bearer) {
    return <Navigate to={'/'} replace />
  } else {
    return children
  }
}

export default WhenLoggedOut
