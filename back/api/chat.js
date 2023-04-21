const fetch = require('node-fetch')
const chatRouter = require('express').Router()

const { ChatDriver, listChats } = require('../chat')
const { idFromBase64, idToBase64 } = require('../base64_id')

chatRouter.post('/', async (request, response) => {
  const user = await request.verifyUserSession()
  if (!request.body.model) { 
    return response.status(400).json({ error: 'missing model' })
  }

  const chat = await ChatDriver.create(user.id, request.body.model)
  response.status(201).json({
    id: idToBase64(chat.id),
    title: chat.title,
    messages: chat.messages,
  })
})

chatRouter.get('/', async (request, response) => {
  const user = await request.verifyUserSession()
  const list = await listChats(user.id)
  response.status(200).json(list.map(chat => ({
    ...chat,
    id: idToBase64(chat.id),
  })))
})

chatRouter.put('/:base64Id', async (request, response) => {
  console.log('test')
  const user = await request.verifyUserSession()
  const chatId = idFromBase64(request.params.base64Id)
  const chat = await ChatDriver.open(user.id, chatId)
  await chat.update({
    title: request.body.title || undefined,
  })
  response.status(200).json({
    id: idToBase64(chat.id),
    title: chat.title,
  })
})

chatRouter.get('/:base64Id', async (request, response) => {
  const user = await request.verifyUserSession()
  const chatId = idFromBase64(request.params.base64Id)
  const chat = await ChatDriver.open(user.id, chatId)

  response.status(200).json({
    title: chat.title,
    messages: chat.messages.map(message => ({
      id: idToBase64(message.id),
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
    id: idToBase64(message.id),
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
  response.write(JSON.stringify({ id: idToBase64(message.id), status: 'pending' }))
  stream.on('data', (delta) => {
    const json = JSON.stringify(delta)
    response.write(json)
  })
  stream.on('end', () => {
    response.write(JSON.stringify({ id: idToBase64(message.id), status: 'done' }))
    response.end()
  })
  stream.on('error', () => {
    response.write(JSON.stringify({ id: idToBase64(message.id), status: 'error' }))
    response.end()
  })
})

chatRouter.delete('/:base64Id/all', async (request, response) => {
  const user = await request.verifyUserSession()
  const chatId = idFromBase64(request.params.base64Id)
  const chat = await ChatDriver.open(user.id, chatId)
  await chat.clear()
  response.status(204).end()
})

chatRouter.delete('/:base64Id', async (request, response) => {
  const user = await request.verifyUserSession()
  const chatId = idFromBase64(request.params.base64Id)
  const chat = await ChatDriver.open(user.id, chatId)
  await chat.destroy()
  response.status(204).end()
})

module.exports = chatRouter
