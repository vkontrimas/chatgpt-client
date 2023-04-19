import { configureStore } from '@reduxjs/toolkit'
import user from './user'
import chat from './chat_slice'

export const store = configureStore({
  reducer: { user, chat },
  devTools: true,
})
