import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getAllMessages } from '../api/message'

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

export const messageSlice = createSlice({
  name: 'message',
  initialState,
  // reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAll.pending, (state) => {
        console.log('fetchAll pending')
        state.loading = true 
      })
      .addCase(fetchAll.rejected, (state) => {
        console.log('fetchAll rejected')
        state.loading = false 
      })
      .addCase(fetchAll.fulfilled, (state, action) => {
        console.log('fetchAll fulfilled', action)
        state.messages = action.payload
        state.loading = false
      })
  },
})

// export const { } = messageSlice.actions

export default messageSlice.reducer
