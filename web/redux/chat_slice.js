import axios from 'axios'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export const NEW_CHAT_ID = 'new'

const newChat = () => ({
  id: NEW_CHAT_ID,
  title: 'Untitled Chat',
  messages: [
    {
      id: 'asgasdgasdgasdgasdgasdg',
      role: 'user',
      content: 'henlo!',
      status: 'done',
    },
    {
      id: 'hgklsadjkl',
      role: 'assistant',
      content: 'hello, how can I help!',
      status: 'done',
    },
    {
      id: 'kljgdfljiow124124',
      role: 'user',
      content: 'help me',
      status: 'error',
    },
    {
      id: 'asgasdgassdfhg8124981jdg',
      role: 'assistant',
      content: 'help how?',
      status: 'error',
    },
  ],
})

const initialState = {
  list: {
    new: newChat(),
  },
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
        for (const chat of payload) {
          state[chat.id] = chat
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

export default chatSlice.reducer

