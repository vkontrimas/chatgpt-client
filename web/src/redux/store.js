import { configureStore } from '@reduxjs/toolkit'
import message from './message.js'

export const store = configureStore({
  reducer: { message, },
})
