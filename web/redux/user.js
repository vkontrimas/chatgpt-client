import localForage from 'localforage'

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export const userSlice = createSlice({
  name: 'user',
  initialState: null,
  reducers: {
    login: (state, { payload }) => {
      if (state !== null) { throw 'user already logged in' }
      if (!payload.id) { throw 'missing user id' } 
      if (!payload.name) { throw 'missing user name' } 
      if (!payload.bearer) { throw 'missing user bearer token' } 
      if (!payload.expiry) { throw 'missing token expiry' } 
      localForage.setItem('user', payload)
      return payload
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

