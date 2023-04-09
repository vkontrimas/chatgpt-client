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

export const login = createAsyncThunk(
  'user/login',
  async ({ email, password }, thunkAPI) => {
    const state = thunkAPI.getState()
    if (state.user.token) {
      throw 'already logged in'
    }

    const response = await axios.post(ENDPOINT, { email, password })
    return response.data?.token 
  }
)

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
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, { payload }) => {
        state.token = payload
        setLocalToken(payload)
      })
      .addCase(login.rejected, (state, action) => {
        console.error('login failed')
      })
  },
})

export default userSlice.reducer

