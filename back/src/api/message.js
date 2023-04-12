const jwt = require('jsonwebtoken')
const messageRouter = require('express').Router()

const { User } = require('../db/db')
const { MessageType } = require('../db/message')
const { LOGIN_TOKEN_SECRET } = require('../config')
const { getCompletion } = require('../openai/openai')

messageRouter.get('/', async (request, response) => {
  const token = jwt.verify(request.userToken, LOGIN_TOKEN_SECRET)
  if (!token.id) {
    return response
      .status(401)
      .json({ error: 'unauthorized' })
  }
  const user = await User.findByPk(token.id)
  if (!user) {
    return response
      .status(401)
      .json({ error: 'unauthorized' })
  }

  const messages = await user.getMessages()
  const messagesJson = messages.map(message => ({
    type: message.type,
    content: message.content,
  }))
  response.status(200).json(messagesJson)
})

messageRouter.post('/', async (request, response) => {
  const token = jwt.verify(request.userToken, LOGIN_TOKEN_SECRET)
  if (!token.id) {
    return response
      .status(401)
      .json({ error: 'unauthorized' })
  }

  const user = await User.findByPk(token.id)
  if (!user) {
    return response
      .status(401)
      .json({ error: 'unauthorized' })
  }

  if (!request.body) {
    return response.status(400).json({ error: 'no body' })
  }

  const { type, content } = request.body
  if (!type) {
    return response.status(400).json({ error: 'type missing' })
  }

  if (type === MessageType.USER) {
    if (!content) {
      return response.status(400).json({ error: 'content missing' })
    }

    const message = await user.createMessage({ type, content })
    return response.status(201).json({
      id: message.id,
      type: message.type,
      content: message.content,
    })
  } else if (type === MessageType.ASSISTANT) {
    const messages = await user.getMessages()
    const messagesJson = messages.map((message) => ({
      type: message.type, content: message.content
    }))
    const completion = await getCompletion(messagesJson)
    const choice = completion?.choices[0]?.message

    const assistantReply = await user.createMessage({
      type: choice.role,
      content: choice.content,
    })

    return response.status(201).json({
      id: assistantReply.id,
      type: assistantReply.type,
      content: assistantReply.content,
    })
  } else {
    throw 'unexpected type'
  }
})

module.exports = messageRouter
