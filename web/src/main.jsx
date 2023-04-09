import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { Provider as ReduxProvider } from 'react-redux'
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom'

import { store } from './redux/store.js'
import MainPage from './MainPage'
import './index.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainPage />,
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <ReduxProvider store={store}>
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  </ReduxProvider>,
)
