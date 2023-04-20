import { createSlice } from '@reduxjs/toolkit'

export const sidebarSlice = createSlice({
  name: 'user',
  initialState: {
    open: false,
  },
  reducers: {
    open: (state) => {
      state.open = true;
    },
    close: (state) => {
      state.open = false;
    },
    toggle: (state) => {
      state.open = !state.open;
    },
  },
  extraReducers: (builder) => {},
})


export const { open, close, toggle } = sidebarSlice.actions
export default sidebarSlice.reducer

