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

import './index.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Authorized> <Main /> </Authorized>,
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
      <div className='Page'>
        <RouterProvider router={router} />
      </div>
    </SessionExpiryProvider>
  </ReduxProvider>,
)
