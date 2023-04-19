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
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import SessionExpiryProvider from './components/SessionExpiryProvider'
import Chat from './ui/Chat'
import Landing from './ui/Landing'
import WhenLoggedOut from './ui/WhenLoggedOut'
import LoggedIn from './ui/LoggedIn'

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
      <WhenLoggedOut >
        <LoginPage />
      </WhenLoggedOut>
    ),
  },
  {
    path: '/register/:code',
    element: (
      <WhenLoggedOut>
        <RegisterPage />
      </WhenLoggedOut>
    ),
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <ReduxProvider store={store}>
    <SessionExpiryProvider>
      <RouterProvider router={router} />
    </SessionExpiryProvider>
  </ReduxProvider>,
)
