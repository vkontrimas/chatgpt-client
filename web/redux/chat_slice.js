import axios from 'axios'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const initialState = {
  list: [],
  loading: false,
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
})

export default chatSlice


