import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  temp: 0,
}

export const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: { 
    set: (state, action) => {
      state.temp = action.payload
    },
    increment: (state) => { state.temp += 1 },
  },
})

export const {
  set,
  increment
} = messageSlice.actions

export default messageSlice.reducer
