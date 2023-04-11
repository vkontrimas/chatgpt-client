import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getAllMessages, createMessage } from '../api/message'

const initialState = {
  messages: [],
}

export const fetchAll = createAsyncThunk(
  'message/fetchAll',
  async () => {
    const messages = await getAllMessages()
    return messages
  }
)

export const create = createAsyncThunk(
  'message/create',
  async (message) => {
    const newMessages = await createMessage(message)
    return newMessages
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
  },
})

// export const { } = messageSlice.actions

export default messageSlice.reducer
