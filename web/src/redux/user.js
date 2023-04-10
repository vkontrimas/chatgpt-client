import axios from 'axios'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const ENDPOINT = 'http://localhost:3000/api/login'

const TOKEN_KEY = 'user_token'
const getLocalToken = () => localStorage.getItem(TOKEN_KEY) || null
const setLocalToken = (token) => localStorage.setItem(TOKEN_KEY, token)
const removeLocalToken = () => localStorage.removeItem(TOKEN_KEY)

const initialState = () => {
  const token = getLocalToken()
  return { token }
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      if (!state.token) {
        console.warn('no user logged in')
        return
      }

      state.token = null
      removeLocalToken()
    },
    login: (state, { payload }) => {
      if (state.token) {
        throw 'a user is already logged in'
      }
      console.log(payload)
      state.token = payload.token
      setLocalToken(payload.token)
    }
  },
  extraReducers: (builder) => { },
})

export const { login, logout } = userSlice.actions

export default userSlice.reducer

