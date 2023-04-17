import '../css/ChatTitleBar.css'

const ChatTitleBar = (params) => {
  const { title, selected } = {
    selected: params.selected || false,
    title: params.title,
  }

  return (
    <div className={`chat-title-bar ${selected ? 'selected' : ''}`}>
      <h3 className='chat-title-bar-title'>
        <i className='fa fa-square' style={selected ? null : { display: 'none' }}/> {title}
      </h3>
      <button
        className='button-clear chat-title-bar-button'
        onClick={() => {}}
        aria-label='Clear chat'
      >
        <i className='fa fa-trash-o fa-2x'></i>
      </button>
    </div>
  )
}

export default ChatTitleBar

