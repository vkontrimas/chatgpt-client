import axios from 'axios'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const LOCAL_STORAGE_KEY = 'user_session_token'

const tokenState = (token) => {
  const getTokenExpiry = () => {
    const base64Payload = token.split('.')[1]
    const { exp } = JSON.parse(atob(base64Payload))
    return exp
  }

  return {
    token,
    bearer: `Bearer ${token}`,
    expiry: getTokenExpiry(),
  }
}

export const Session = {
  active: "active",
  inactive: "inactive",
  pending: "pending",
  error: "error",
  warning: "warning",
}

const initialState = () => {
  const localToken = localStorage.getItem(LOCAL_STORAGE_KEY)

  return {
    session: localToken ? Session.active : Session.inactive,
    sessionMessage: '',
    token: localToken ? tokenState(localToken) : null,
  }
}

export const login = createAsyncThunk('user/login',
  async ({ email, password }, thunkApi) => {
    const state = thunkApi.getState()
    if (state.token) {
      throw 'a user is already logged in'
    }

    const response = await axios.post(
      'http://localhost:3000/api/login',
      { email, password },
    )

    const { token } = response.data
    return tokenState(token)
  }
)

const loginPendingReducer = (state) => {
  state.session = Session.pending
}

const loginFulfilledReducer = (state, action) => {
  state.session = Session.active
  state.token = action.payload
  localStorage.setItem(LOCAL_STORAGE_KEY, action.payload.token)
}

const loginRejectedReducer = () => {
  state.session = Session.error
  state.sessionMessage = 'login failed'
  console.error('login failed')
}

const logoutReducer = (state, { payload }) => {
  if (!state.token) {
    console.warn('no user logged in')
  }
  state.session = payload || Session.inactive
  state.token = null
  localStorage.removeItem(LOCAL_STORAGE_KEY)
}


export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: logoutReducer,
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, loginPendingReducer)
      .addCase(login.fulfilled, loginFulfilledReducer)
      .addCase(login.rejected, loginRejectedReducer)
  },
})


export const { logout } = userSlice.actions
export default userSlice.reducer

