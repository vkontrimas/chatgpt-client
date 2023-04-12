import axios from 'axios'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const TOKEN_KEY = 'user_session_token'
const NAME_KEY = 'user_name'
const ID_KEY = 'user_id'

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
  const localToken = localStorage.getItem(TOKEN_KEY)
  // TODO: Fetch these maybe?
  const name = localStorage.getItem(NAME_KEY)
  const id = localStorage.getItem(ID_KEY)

  return {
    id,
    name,
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
      '/api/login',
      { email, password },
    )

    return {
      ...response.data,
      token: tokenState(response.data.token),
    }
  }
)

const loginPendingReducer = (state) => {
  state.session = Session.pending
}

const loginFulfilledReducer = (state, action) => {
  const { id, name, token } = action.payload
  state.id = id
  state.name = name
  state.token = token
  state.session = Session.active
  localStorage.setItem(TOKEN_KEY, token.token)
  localStorage.setItem(NAME_KEY, name)
  localStorage.setItem(ID_KEY, id)
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
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(NAME_KEY)
  localStorage.removeItem(ID_KEY)
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

