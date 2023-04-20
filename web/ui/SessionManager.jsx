import axios from 'axios'
import localForage from 'localforage'

import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout, login } from '../redux/user'
import { reset } from '../redux/chat_slice'
import Loading from './Loading'

const SessionManager = ({ children }) => {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(true) 
  const user = useSelector(state => state.user)

  /*
   * If user logs out, we want to wipe all the chats we've stored
   * in the state
   */
  useEffect(() => {
    if (!user) {
      dispatch(reset())
    }
  }, [user])

  /*
   * Get user from local storage
   * Check the stored token is still valid and update info
   * Otherwise, remove token from local storage
   */
  useEffect(() => {
    if (user) {
      setLoading(false)
      return
    }

    const loadUser = async () => {
      const localUser = await localForage.getItem('user')
      if (!localUser) { 
        setLoading(false)
        return
      }

      if (localUser.expiry * 1000 <= Date.now()) {
        setLoading(false)
        dispatch(logout())
      }

      try {
        const response = await axios.get(`/api/users/${localUser.id}`, {
          headers: {
            Authorization: localUser.bearer,
          }
        })

        dispatch(login({ ...localUser, ...response.data }))
      } catch (error) {
        dispatch(logout())
      }
      setLoading(false)
    }

    loadUser()
  }, [])

  /*
   * If user logs in, set a timer to log them out once token expires
   */
  useEffect(() => {
    if (!user) { return }
    const timeUntilExpiryMs = user.expiry * 1000 - Date.now()
    const timerId = setTimeout(() => dispatch(logout()), timeUntilExpiryMs)
    return () => {
      clearTimeout(timerId)
    }
  }, [user])

  if (loading) {
    return <Loading />
  }

  return children
}

export default SessionManager
