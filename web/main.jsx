import './css/Inputs.css'
import './css/Buttons.css'
import './css/Notification.css'
import './css/Layout.css'

import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { Provider as ReduxProvider } from 'react-redux'
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom'

import { store } from './redux/store'

import Main from './ui/Main'
import Login from './ui/Login'
import Register from './ui/Register'
import Waitlist from './ui/Waitlist'
import Chat from './ui/Chat'
import Landing from './ui/Landing'
import LoggedOut from './ui/LoggedOut'
import LoggedIn from './ui/LoggedIn'
import SessionManager from './ui/SessionManager'
import MobileScrollContainer from './ui/MobileScrollContainer'

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <LoggedIn>
        <MobileScrollContainer>
          <Main />
        </MobileScrollContainer>
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
      {
        path: '/chat',
        element: <Navigate to='/' replace />,
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
        <Register />
      </LoggedOut>
    ),
  },
  {
    path: '/register',
    element: <Navigate to='/waitlist' replace />
  },
  {
    path: '/waitlist',
    element: (
      <LoggedOut>
        <Waitlist />
      </LoggedOut>
    )
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <ReduxProvider store={store}>
    <SessionManager>
      <RouterProvider router={router} />
    </SessionManager>
  </ReduxProvider>,
)
