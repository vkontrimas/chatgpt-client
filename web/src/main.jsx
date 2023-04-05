import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { Provider as ReduxProvider } from 'react-redux'

import { store } from './redux/store.js'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <ReduxProvider store={store}>
    <StrictMode>
      <App />
    </StrictMode>
  </ReduxProvider>,
)
