import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import '../css/ChatList.css'

import ChatTitleBar from './ChatTitleBar'
import Loading from './Loading'

const ChatList = (props) => {
  const { items, isLoading } = {
    isLoading: false,
    ...props,
  }

  const params = useParams()


  const listItems = useMemo(
    () => { 
      return items
        .map(({ id, title }) => (<ChatTitleBar selected={id === params.chatId} key={id} title={title}/>))
    },
    [items]
  )

  return (
    <>
      { isLoading && <Loading /> }
      {
        !isLoading &&
        <div className='chat-list'>
          {listItems}
          <button
            className='button-clear good chat-list-add-button'
            style={params.chatId === 'new' ? { display: 'none' } : null}
            onClick={() => {}}
            aria-label='create chat'
          >
            <i className='fa fa-plus-square fa-2x'/>
          </button>
        </div>
      }
    </>
  )
}

export default ChatList
