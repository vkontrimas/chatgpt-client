import MessageInput from './components/MessageInput'
import Messages from './components/Messages'
import Auth from './components/Login'

import './App.css'

const App = () => {
  const showAuth = true

  return (
    <div className="App">
      {showAuth && <Auth />}
      {!showAuth && (<>
        <Messages />
        <MessageInput />
      </>)}
    </div>
  )
}

export default App
