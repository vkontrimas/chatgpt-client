import localForage from 'localforage'

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const getTokenExpiry = (token) => {
  const base64Payload = token.split('.')[1]
  const { exp } = JSON.parse(atob(base64Payload))
  return exp
}

export const userSlice = createSlice({
  name: 'user',
  initialState: null,
  reducers: {
    login: (state, { payload }) => {
      if (state !== null) { throw 'user already logged in' }
      if (!payload.id) { throw 'missing user id' } 
      if (!payload.firstName) { throw 'missing user first name' } 
      if (!payload.lastName) { throw 'missing user first name' } 
      if (!payload.email) { throw 'missing email' } 
      if (!payload.token) { throw 'missing user token' } 

      const user = {
        ...payload,
        bearer: `Bearer ${payload.token}`,
        expiry: getTokenExpiry(payload.token),
      }

      localForage.setItem('user', user)
      return user
    },
    updateUser: (state, { payload }) => {
      if (!state) { return }
      const newState = { ...state, ...payload, }
      localForage.setItem('user', newState)
      return newState
    },
    logout: (state, { payload }) => {
      if (!state) {
        console.warn('logout action dispatched with no logged in user')
      }
      localForage.removeItem('user')
      return null
    },
  },
  extraReducers: (builder) => {},
})


export const { login, updateUser, logout } = userSlice.actions
export default userSlice.reducer

