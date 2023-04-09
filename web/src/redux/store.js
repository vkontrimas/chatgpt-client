import { configureStore } from '@reduxjs/toolkit'
import message from './message'
import user from './user_slice'

export const store = configureStore({
  reducer: { message, user },
  devTools: true,
})
