import '../css/ChatTitleBar.css'

const ChatTitleBar = ({ title }) => {
  return (
    <div className='chat-title-bar'>
      <h3 className='chat-title-bar-title'>{title}</h3>
      <button
        className='button-clear chat-title-bar-button'
        onClick={() => {}}
        ariaLabel='Clear chat'
      >
        <i className='fa fa-trash-o fa-2x'></i>
      </button>
    </div>
  )
}

export default ChatTitleBar

