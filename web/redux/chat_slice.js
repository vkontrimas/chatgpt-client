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
      let index = state.map[chatId].messages.findIndex(el => el.id === message.id)
      if (index === -1) {
        index = state.map[chatId].messages.length
        state.map[chatId].messages.push(message)
        state.map[chatId].messageMap[message.id] = index
      } else {
        // HACK: This is a hack to remove duplicate first message on new chats
        //
        //       Duplicate message is caused by:
        //       1. Chat being created and completion started on server
        //       2. Chat page loads on client dispatching setMessages which adds the completing message from DB
        //       3. completion function on client calls addMessage once it starts receiving server data
        //
        //       #3 causes a collision!
        //
        //       This will be resolved when we simply store all messages in a map and sort!
        state.map[chatId].messages[index] = message
        state.map[chatId].messageMap[message.id] = index
      }
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
    updateChat: (state, { payload }) => {
      const { id, update } = payload
      if (state.map[id]) {
        state.map[id] = {
          ...state.map[id],
          ...update,
          messages: state.map[id].messages,
          messageMap: state.map[id].messageMap,
        }
      }
    }
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
  updateChat,
} = chatSlice.actions

export default chatSlice.reducer

