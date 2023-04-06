const messageRouter = require('express').Router()
const User = require('../message/user')
const { 
  addMessage,
  getAllMessages,
  generateNextReply,
} = require('../message/messages')

messageRouter.get('/', (request, response) => {
  response.json(getAllMessages())
})

messageRouter.post('/', async (request, response) => {
  if (!request.body) {
    return response.status(400).json({ error: 'no body' })
  }

  const { user, content } = request.body
  if (!user) {
    return response.status(400).json({ error: 'user missing' })
  }

  if (user === User.user) {
    if (!content) {
      return response.status(400).json({ error: 'content missing' })
    }
    const addedMessage = addMessage({ user, content })
    return response.status(201).json(addedMessage)
  } else {
    const assistantMessage = await generateNextReply()
    return response.status(201).json(assistantMessage)
  }
})

module.exports = messageRouter
