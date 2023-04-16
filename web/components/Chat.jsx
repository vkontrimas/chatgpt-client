import { useEffect, useRef, useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'

import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import { fetchAll, create } from '../redux/message'
import './Chat.css'

import User from './User'

const Chat = () => {
  const { chatId } = useParams()

  return (
    <div>
      my id: {chatId}
    </div>
  )
}

export default Chat
