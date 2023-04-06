import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getAllMessages, sendMessage } from '../api/message'

const initialState = {
  loading: false,
  messages: [],
}

export const fetchAll = createAsyncThunk(
  'message/fetchAll',
  async () => {
    const messages = await getAllMessages()
    return messages
  }
)

export const send = createAsyncThunk(
  'message/send',
  async ({ message }) => {
    const newMessages = await sendMessage(message)
    return newMessages
  }
)

export const messageSlice = createSlice({
  name: 'message',
  initialState,
  // reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(send.pending, (state, { meta }) => {
        const { message } = meta.arg
        state.messages.push({
          content: message,
          user: 'user',
          state: 'pending',
        })
      })
      .addCase(send.rejected, (state, { error }) => {
        console.error('send rejected', error.message)
        // TODO: DANGER: assuming our message is the last one!
        state.messages[state.messages.length - 1].state = 'failed'
      })
      .addCase(send.fulfilled, (state, { payload }) => {
        state.messages = state.messages
          .filter(message => message.state !== 'pending')
          .concat(payload)
      })
      .addCase(fetchAll.pending, (state) => {
        state.loading = true 
      })
      .addCase(fetchAll.rejected, (state, { error }) => {
        console.error('fetchAll rejected', error.message)
        state.loading = false 
      })
      .addCase(fetchAll.fulfilled, (state, action) => {
        state.messages = action.payload
        state.loading = false
      })
  },
})

// export const { } = messageSlice.actions

export default messageSlice.reducer
