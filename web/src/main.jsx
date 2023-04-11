import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { Provider as ReduxProvider } from 'react-redux'
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom'

import { store } from './redux/store'
import MainPage from './MainPage'
import LoginPage from './LoginPage'
import Authorized from './components/Authorized'
import './index.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginPage />,
  },
  {
    path: '/chat',
    element: <Authorized> <MainPage /> </Authorized>,
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <ReduxProvider store={store}>
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  </ReduxProvider>,
)
