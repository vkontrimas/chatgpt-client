import Messages from './components/Messages'
import Auth from './components/Login'

import './App.css'

const App = () => {
  const showAuth = false

  return (
    <div className="App">
      {showAuth && <Auth />}
      {!showAuth && (<> <Messages /> </>)}
    </div>
  )
}

export default App
