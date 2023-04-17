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
    setChats: (state, { payload }) => {
      for (const chat of payload) {
        state.map[chat.id] = {
          title: 'Untitled Chat',
          messages: [],
          ...chat,
        }
      }
    },
    setLoading: (state, { payload }) => {
      state.loading = payload
    },
    addMessage: (state, { payload }) => {
      const { chatId, message } = payload 
      state.map[chatId].messages.push(message)
    },
    setMessages: (state, { payload }) => {
      const { chatId, messages } = payload
      state.map[chatId].messages = messages
    },
  },
  extraReducers: (builder) => { },
})

export const {
  setChats,
  setLoading,
  addMessage,
  setMessages
} = chatSlice.actions

export default chatSlice.reducer

