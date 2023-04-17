import '../css/ChatList.css'

import ChatTitleBar from './ChatTitleBar'

const ChatList = () => {
  const items = [
    'Untitled chat',
    'What is 2+2?',
    'How do I conquer the world?',
  ]

  return (
    <div className='chat-list'>
      {items.map(title => <ChatTitleBar key={title} title={title} />)}
      <button
        className='button-clear chat-list-add-button'
        onClick={() => {}}
      >
        <i className='fa fa-plus-square fa-2x'/>
      </button>
    </div>
  )
}

export default ChatList
