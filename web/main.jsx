import './css/Inputs.css'
import './css/Buttons.css'

import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { Provider as ReduxProvider } from 'react-redux'
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom'

import { store } from './redux/store'

import Main from './ui/Main'
import Login from './ui/Login'
import RegisterPage from './pages/Register'
import Chat from './ui/Chat'
import Landing from './ui/Landing'
import LoggedOut from './ui/LoggedOut'
import LoggedIn from './ui/LoggedIn'
import SessionManager from './ui/SessionManager'

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <LoggedIn>
        <Main />
      </LoggedIn>
    ),
    children: [
      {
        path: '/',
        element: <Landing />
      },
      {
        path: '/chat/:chatId',
        element: <Chat />,
      },
    ],
  },
  {
    path: '/login',
    element: (
      <LoggedOut >
        <Login />
      </LoggedOut>
    ),
  },
  {
    path: '/register/:code',
    element: (
      <LoggedOut>
        <RegisterPage />
      </LoggedOut>
    ),
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <ReduxProvider store={store}>
    <SessionManager>
      <RouterProvider router={router} />
    </SessionManager>
  </ReduxProvider>,
)
