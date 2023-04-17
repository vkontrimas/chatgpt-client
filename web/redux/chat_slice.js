import axios from 'axios'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export const NEW_CHAT_ID = 'new'
const initialState = {
  list: {},
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

  console.log(response.data)

  return response.data
}) 

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addChat: (state, { payload }) => {
      state.list[payload.id] = {
        title: 'Untitled Chat',
        ...payload,
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.pending, (state) => {
        state.loading = true
      }) 
      .addCase(fetchChats.fulfilled, (state, { payload }) => {
        for (const chat of payload) {
          state.list[chat.id] = {
            title: 'Untitled chat',
            messages: [],
            ...chat
          }
        }
        state.loading = false
      })
      .addCase(fetchChats.rejected, (state) => {
        state.list = {
          placeholder: newChat(),
        }
        state.loading = false
      })
  },
})

export const { addChat } = chatSlice.actions

export default chatSlice.reducer

