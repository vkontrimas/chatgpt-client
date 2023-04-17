import './css/Inputs.css'
import './css/Buttons.css'
import './css/index.css'

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
import Authorized from './components/Authorized'
import SessionExpiryProvider from './components/SessionExpiryProvider'
import Chat from './ui/Chat'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Authorized> <Main /> </Authorized>,
    children: [
      {
        path: '/chat/:chatId',
        element: <Chat />,
      }
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register/:code',
    element: <RegisterPage />,
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <ReduxProvider store={store}>
    <SessionExpiryProvider>
      <RouterProvider router={router} />
    </SessionExpiryProvider>
  </ReduxProvider>,
)
