import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { Provider as ReduxProvider } from 'react-redux'
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom'

import { store } from './redux/store'
import HomePage from './pages/Home'
import LoginPage from './pages/Login'
import Authorized from './components/Authorized'
import './index.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Authorized> <HomePage /> </Authorized>,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/test',
    element: <Authorized> <div> test </div> </Authorized>,
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <ReduxProvider store={store}>
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  </ReduxProvider>,
)
