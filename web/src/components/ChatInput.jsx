import { useState, useRef, useEffect, } from 'react'
import { useDispatch } from 'react-redux'
import { create } from '../redux/message'
import './ChatInput.css'

const ChatInput = () => {
  const dispatch = useDispatch()

  const [message, setMessage] = useState('')

  const handleSubmit = async (event) => {
    event?.preventDefault()
    if (message) {
      setMessage('')
      // TODO: Find out if the markdownified message significantly affects
      //       GPT replies. (Also definitely should add tokens? Maybe not?)
      dispatch(create({ type: 'user', content: message.replace(/\n/g, '  \n') }))
      dispatch(create({ type: 'assistant' }))
    }
  }

  const inputRef = useRef(null)
  const focusInput = () => inputRef.current?.focus()
  useEffect(focusInput, [])
  useEffect(() => {
    window.addEventListener('focus', focusInput)
    return () => window.removeEventListener('focus', focusInput)
  }, [])

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

  return (
    <form className="message-form" onSubmit={handleSubmit}>
      <textarea
        className="message-input"
        value={message}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        ref={inputRef}
      />
      <button className="send-button" action="submit">{'send'}</button>
    </form>
  )
}

export default ChatInput
