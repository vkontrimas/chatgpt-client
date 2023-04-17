import { useMemo } from 'react'

import '../css/ChatList.css'

import ChatTitleBar from './ChatTitleBar'

const ChatList = (props) => {
  const { items, isLoading } = {
    isLoading: false,
    ...props,
  }

  const hideWhenLoading = useMemo(() => isLoading ? { display: 'none' } : null, [isLoading])
  const showWhenLoading = useMemo(() => isLoading ? null : { display: 'none' }, [isLoading])

  const listItems = useMemo(
    () => items.map(({ id, title }) => <ChatTitleBar key={id} title={title} />),
    [items]
  )

  return (
    <>
      <div className='chat-list-loading' style={showWhenLoading}>
        <i className='fa fa-pulse fa-spinner fa-3x' />
      </div>
      <div className='chat-list' style={hideWhenLoading}>
        {listItems}
        <button
          className='button-clear good chat-list-add-button'
          onClick={() => {}}
          aria-label='create chat'
        >
          <i className='fa fa-plus-square fa-2x'/>
        </button>
      </div>
    </>
  )
}

export default ChatList
