const fetch = require('node-fetch')
const chatRouter = require('express').Router()

const { ChatDriver } = require('../chat')
const { idFromBase64 } = require('../base64_id')

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

chatRouter.get('/:base64Id', async (request, response) => {
  const user = await request.verifyUserSession()
  const chatId = idFromBase64(request.params.base64Id)
  const chat = await ChatDriver.open(user.id, chatId)

  response.status(200).json({
    messages: chat.messages.map(message => ({
      id: message.id,
      role: message.role,
      content: message.content,
      status: message.status
    })),
  })
})

chatRouter.post('/:base64Id/add', async (request, response) => {
  const user = await request.verifyUserSession()
  const chatId = idFromBase64(request.params.base64Id)
  const chat = await ChatDriver.open(user.id, chatId)
  const message = await chat.postMessage(request.body)
  response.status(201).json({
    id: message.id,
    role: message.role,
    content: message.content,
    status: message.status,
  })
})

chatRouter.post('/:base64Id/complete', async (request, response) => {
  const user = await request.verifyUserSession()
  const chatId = idFromBase64(request.params.base64Id)
  const chat = await ChatDriver.open(user.id, chatId)

  const [message, stream] = await chat.completeCurrentThread()
  response.status(201)
  response.set('Content-Type', '/application/octet-stream')
  response.write(JSON.stringify({
    id: message.id,
    status: 'pending',
  }))

  for await (const delta of stream) {
    response.write(JSON.stringify(delta))
  }

  response.write(JSON.stringify({
    status: 'done',
  }))

  response.end()
})

chatRouter.delete('/:base64Id/all', async (request, response) => {
  const user = await request.verifyUserSession()
  const chatId = idFromBase64(request.params.base64Id)
  const chat = await ChatDriver.open(user.id, chatId)
  await chat.clear()
  response.status(204).end()
})

module.exports = chatRouter
