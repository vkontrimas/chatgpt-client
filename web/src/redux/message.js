import axios from 'axios'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const baseUrl = 'http://localhost:3000/api/message'

const initialState = {
  messages: [],
}

const authConfig = (bearer) => { 
  if (!bearer) {
    throw 'bearer null'
  }
  return {
    headers: {
      Authorization: bearer
    }
  }
}

export const fetchAll = createAsyncThunk(
  'message/fetchAll',
  async (_, thunkApi) => {
    const bearer = thunkApi.getState().user.token?.bearer
    const response = await axios.get(baseUrl, authConfig(bearer))
    return response.data
  }
)

export const create = createAsyncThunk(
  'message/create',
  async (message, thunkApi) => {
    const bearer = thunkApi.getState().user.token?.bearer
    const response = await axios.post(baseUrl, message, authConfig(bearer))
    return response.data
  }
)

export const clear = createAsyncThunk(
  'message/clear',
  async (_, thunkApi) => {
    const bearer = thunkApi.getState().user.token?.bearer
    const response = await axios.delete(baseUrl, authConfig(bearer))
  }
)

export const messageSlice = createSlice({
  name: 'message',
  initialState,
  // reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(create.pending, (state, { meta }) => {
        const { type, content } = meta.arg
        state.messages.push({
          content: type === 'user' ? content : '*thinking...*',
          type,
          state: 'pending',
          requestId: meta.requestId
        })
      })
      .addCase(create.rejected, (state, { error, meta }) => {
        console.error('create rejected', error.message)
        const message = state.messages
          .find(({ requestId }) => requestId === meta.requestId)
        message.state = 'failed'
        delete message.requestId 
      })
      .addCase(create.fulfilled, (state, { payload, meta }) => {
        const idx = state.messages
          .findIndex(({ requestId }) => requestId === meta.requestId)
        state.messages[idx] = payload
      })
      .addCase(fetchAll.rejected, (state, { error }) => {
        console.error('fetchAll rejected', error.message)
      })
      .addCase(fetchAll.fulfilled, (state, action) => {
        state.messages = action.payload
      })
      .addCase(clear.fulfilled, (state) => {
        state.messages = []
      })
  },
})

// export const { } = messageSlice.actions

export default messageSlice.reducer
