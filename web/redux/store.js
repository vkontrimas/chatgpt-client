import { configureStore } from '@reduxjs/toolkit'
import user from './user'
import chat from './chat_slice'
import sidebar from './sidebar'
import currentThread from './current_thread'

export const createStore = () => configureStore({
  reducer: { user, chat, sidebar, currentThread },
  devTools: true,
})

export const store = createStore()
