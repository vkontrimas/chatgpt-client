const messageRouter = require('express').Router()
const User = require('../message/user')
const { addMessage, getAllMessages } = require('../message/messages')

messageRouter.get('/', (request, response) => {
  response.json(getAllMessages())
})

messageRouter.post('/', (request, response) => {
  const newMessage = request.body
  if (!newMessage || !newMessage.content) {
    return response.status(400).json({ error: 'content missing' })
  }

  const addedMessage = addMessage({ user: User.user, content: newMessage.content })
  return response.status(201).json(addedMessage)
})

module.exports = messageRouter
