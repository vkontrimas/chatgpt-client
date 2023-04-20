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
          messageMap: {},
          ...chat,
        }
      }
    },
    setLoading: (state, { payload }) => {
      state.loading = payload
    },
    addMessage: (state, { payload }) => {
      const { chatId, message } = payload 

      // TODO: just store messages in map and do a memoized sort on render
      const index = state.map[chatId].messages.length
      state.map[chatId].messages.push(message)
      state.map[chatId].messageMap[message.id] = index
    },
    updateMessage: (state, { payload }) => {
      const { chatId, message } = payload

      const index = state.map[chatId].messageMap[message.id]
      const messageState = state.map[chatId].messages[index]
      state.map[chatId].messages[index] = {
        ...messageState,
        ...message,
      }
    },
    setMessages: (state, { payload }) => {
      const { chatId, messages } = payload
      state.map[chatId].messages = messages
    },
    destroyChat: (state, { payload }) => {
      const id = payload
      delete state.map[id]
    },
    reset: (state) => {
      return initialState
    },
  },
  extraReducers: (builder) => { },
})

export const {
  setChats,
  setLoading,
  addMessage,
  setMessages,
  destroyChat,
  updateMessage,
  reset,
} = chatSlice.actions

export default chatSlice.reducer

