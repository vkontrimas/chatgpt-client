const fetch = require('node-fetch')
const chatRouter = require('express').Router()

const { ChatDriver } = require('../chat')

chatRouter.post('/', async (request, response) => {
  const user = await request.verifyUserSession()
  if (!request.body.model) { 
    return response.status(400).json({ error: 'missing model' })
  }

  const chat = await ChatDriver.create(user.id, request.body.model)
  response.status(201).json({
    id: chat.id,
    messages: chat.messages,
  })
})

module.exports = chatRouter
