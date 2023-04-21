import '../css/ChatTitleBar.css'

import axios from 'axios'
import { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'

import { destroyChat, updateChat } from '../redux/chat_slice'

const ChatTitleEditable = ({ id, bearer }) => {
  const title = useSelector(state => state.chat.map[id]?.title)
  const [originalTitle, setOriginalTitle] = useState(title)
  const titleRef = useRef(null)
  const dispatch = useDispatch()

  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.innerText = title
    }
  }, [titleRef])

  const handleTitleInput = (e) => {
    const enterKeyHit = event.keyCode === 13
    if (enterKeyHit) {
      event.preventDefault()
      e.target.blur()
    }
  }

  const handleTitleFocus = (e) => {
    setOriginalTitle(title)
  }

  const handleTitleBlur = (e) => {
    if (!title) {
      dispatch(updateChat({ id, update: { title: originalTitle }}))
      titleRef.current.innerText = originalTitle
    } else {
      axios.put(`/api/chat/${id}`, { title }, {
        headers: {
          Authorization: bearer,
        }
      })
        .then((response) => {
          dispatch(updateChat({ id, update: { title: response.data.title }}))
        })
        .catch((error) => {
          console.log('catch')
          dispatch(updateChat({ id, update: { title: originalMessage }}))
          throw error
        })
    }
  }

  return (
    <>
      <h3
        ref={titleRef}
        className='chat-title-bar-title'
        onKeyDown={handleTitleInput}
        onFocus={handleTitleFocus}
        onBlur={handleTitleBlur}
        onInput={(e) => dispatch(updateChat({ id, update: { title: e.target.innerText }}))}
        style={{ width: 'auto' }}
        contentEditable
        suppressContentEditableWarning
      ></h3>
      <i className='fa fa-pencil fa chat-title-bar-title-edit' />
    </>
  )
}

const ChatTitleBar = ({ id }) => {
  const bearer = useSelector(state => state.user?.bearer)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleDestroy = () => {
    dispatch(destroyChat(id))
    axios.delete(`/api/chat/${id}`, { headers: { Authorization: bearer }})
    navigate('/', { replace: true })
  }

  return (
    <div className={`chat-title-bar`}>
      <ChatTitleEditable id={id} bearer={bearer} />
      <div className='flex-expand' />
      <button
        className='button-clear chat-title-bar-button'
        onClick={handleDestroy}
        aria-label='Delete chat'
      >
        <i className='fa fa-trash-o fa-2x'></i>
      </button>
    </div>
  )
}

export default ChatTitleBar

