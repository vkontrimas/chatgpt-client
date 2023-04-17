import axios from 'axios'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const initialState = {
  list: [],
  loading: false,
}

export const fetchChats = createAsyncThunk('chat/fetch', async (_, thunkApi) => {
  const bearer = thunkApi.getState().user?.token.bearer
  if (!bearer) { throw 'user not logged in' }

  const response = await axios.get('/api/chat', {
    headers: {
      Authorization: bearer,
    },
  })
  return response.data
}) 

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.pending, (state) => {
        state.loading = true
      }) 
      .addCase(fetchChats.fulfilled, (state, { payload }) => {
        state.list = payload
        state.loading = false
      })
      .addCase(fetchChats.rejected, (state) => {
        state.list = []
        state.loading = false
      })
  },
})

export default chatSlice.reducer

