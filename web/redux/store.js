import { configureStore } from '@reduxjs/toolkit'
import user from './user'
import chat from './chat_slice'
import sidebar from './sidebar'

export const store = configureStore({
  reducer: { user, chat, sidebar },
  devTools: true,
})
