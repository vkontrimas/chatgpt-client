import { configureStore } from '@reduxjs/toolkit'
import message from './message'
import user from './user'
import chat from './chat_slice'

export const store = configureStore({
  reducer: { message, user, chat },
  devTools: true,
})
