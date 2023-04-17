import axios from 'axios'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const initialState = {
  list: [
    {
      id: 'asdgasdg',
      title: 'Hello!',
    },
    {
      id: 'foobar',
      title: 'Hello world!',
    },
    {
      id: 'aghasjkhgasd',
      title: 'How do I dominate the world?',
    },
  ],
  loading: true,
}

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
})

export default chatSlice.reducer

