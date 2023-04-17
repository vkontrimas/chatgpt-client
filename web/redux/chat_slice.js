import axios from 'axios'
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  map: {},
  loading: true,
}

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addChats: (state, { payload }) => {
      for (const chat of payload) {
        state.map[chat.id] = {
          title: 'Untitled Chat',
          ...chat,
        }
      }
    },
    setLoading: (state, { payload }) => {
      state.loading = payload
    },
  },
  extraReducers: (builder) => { },
})

export const { addChats, setLoading } = chatSlice.actions

export default chatSlice.reducer

