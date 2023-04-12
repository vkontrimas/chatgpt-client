import { createContext, useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { logout, Session } from '../redux/user'

const SessionExpiryContext = createContext(null)

const SessionExpiryProvider = ({ children }) => {
  const [timerId, setTimerId] = useState(null)
  const token = useSelector(state => state.user.token)
  const dispatch = useDispatch()

  useEffect(() => {
    if (!token) { 
      if (timerId !== null) {
        clearTimeout(timerId)
      }
      return
    }

    const now = Date.now()
    const timeUntilExpiryMs = (token.expiry * 1000) - now
    console.log(token, 'new timer', timeUntilExpiryMs)
    const newTimerId = setTimeout(() => {
      dispatch(logout(Session.expired))
    }, timeUntilExpiryMs - 200)
    setTimerId(newTimerId)
  }, [token])

  return (
    <SessionExpiryContext.Provider value={token}>
      {children}
    </SessionExpiryContext.Provider>
  )
}

export default SessionExpiryProvider
