import '../css/ChatInput.css'

import { useState, useRef, useEffect, } from 'react'
import { useSelector, useDispatch } from 'react-redux'

const ChatInput = ({ enabled }) => {
  /*const dispatch = useDispatch()
  const [message, setMessage] = useState('')
  const inputRef = useRef(null)

  const handleSubmit = async (event) => {
    event?.preventDefault()
    if (message) {
      // TODO: Find out if the markdownified message significantly affects
      //       GPT replies. (Also definitely should add tokens? Maybe not?)
      dispatch(create({ type: 'user', content: message.replace(/\n/g, '  \n') }))
      setMessage('')
    }
  }

  const autoSize = (target) => {
    target.style.height = '0px'
    target.style.height = `${target.scrollHeight}px`
  }

  useEffect(() => autoSize(inputRef.current), [])

  const handleKeyDown = async (event) => {
    if (message && event.keyCode === 13 && !event.shiftKey) {
      event.preventDefault()
      await handleSubmit(null)
    }
    autoSize(event.target)
  }

  const handleChange = (event) => {
    setMessage(event.target.value) 
    autoSize(event.target)
  }
  */

  const handleSubmit = (event) => {
    event.preventDefault()
  }

  return (
    <form className='chat-input-form' onSubmit={handleSubmit}>
      <textarea
        className='text-input chat-input'
      />
      <button className='button-input-overlaid chat-send-button' action="submit" disabled={!enabled}>
        <i className='fa fa-arrow-circle-right fa-2x' />
      </button>
    </form>
  )
}

export default ChatInput
