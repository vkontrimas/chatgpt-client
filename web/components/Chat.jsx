import { useEffect, useRef, useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import ReactMarkdown from 'react-markdown'

import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import { fetchAll, create } from '../redux/message'
import './Chat.css'

import User from './User'

const Chat = () => {
  const messages = useSelector(state => state.message.messages)
  const dispatch = useDispatch()
  const scrollRef = useRef(null)

  const [testMessage, setTestMessage] = useState('')
  const [type, setType] = useState(true)

  const writeMessage = useCallback((type) => {
    console.log('typewriter', type)
    const test = async () => {
      const request = new Request('/api/chat/test', {
        method: 'GET',
      })

      const response = await fetch(request)
      const reader = response.body
        .pipeThrough(new TextDecoderStream())
        .getReader()

      let currentMessage = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) { break }

        let start = 0
        let end = 0
        while (end !== value.length) {
          const index = value.indexOf('}{', start)
          end = index === -1 ? value.length : index + 1

          const str = value.substring(start, end)
          start = end 

          const json = JSON.parse(str)
          const content = json.choices && json.choices[0]?.delta?.content

          if (content) {
            if (type) {
              for (const char of content) {
                currentMessage = currentMessage.concat(char)
                setTestMessage(currentMessage)
                const delayMs = 10
                await new Promise(res => setTimeout(res, delayMs))
              }
            }
            else {
              currentMessage = currentMessage.concat(content)
              setTestMessage(currentMessage)
            }
          }
        }
      }
    }

    setTestMessage('')
    test()
  }, [type])

  const toggleTypewriter = useCallback(() => {
    const newType = !type
    setType(newType)
    writeMessage(newType)
  }, [type, writeMessage])


  return (
    <div>
      {testMessage && <div className='message assistant'>
        <ReactMarkdown>{testMessage}</ReactMarkdown>
      </div>}
      <button style={{marginTop: '20px'}}onClick={toggleTypewriter}>{type ? 'disable typewriter' : 'enable typewriter'}</button>
      <button onClick={() => writeMessage(type)}>Write message</button>
    </div>
  )

  useEffect(() => {
    dispatch(fetchAll())
  }, [])

  // bandaid for generating assistant replies in sequenced way
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].type === 'user') {
      dispatch(create({ type: 'assistant' }))
    }
  }, [messages])

  useEffect(() => {
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages])

  // Either there's no messsages
  // or the last message is from assisant and has no state (pending / failed)
  const chatInputEnabled = messages.length === 0 
        || (!messages[messages.length - 1].state 
          && !messages[messages.length - 1].type !== 'user')

  return (
    <div className="chat">

      {/* HACK: <User> and chat-mobile-stretch are here until I figure out sidebar on mobile*/}
      <User />
      <div className="chat-mobile-stretch"></div>

      <div className="chat-scroll" ref={scrollRef}>
        <div className="chat-messages">
        {messages.map((message, i) => <ChatMessage key={i} message={message}/>)}
        </div>
      </div>
      <ChatInput enabled={chatInputEnabled}/>
    </div>
  )
}

export default Chat
