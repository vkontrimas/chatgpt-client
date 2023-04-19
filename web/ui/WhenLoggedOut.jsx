import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

const WhenLoggedOut = ({ children }) => {
  const user = useSelector(state => state.user)

  if (user) {
    return <Navigate to={'/'} replace />
  } else {
    return children
  }
}

export default WhenLoggedOut
