const supertest = require('supertest')
const api = supertest(require('../../app'))
const { 
  MESSAGE_ENDPOINT,
  initialMessages,
  getStoredMessages
} = require('./message_helper')
const User = require('../../message/user')


describe(`API ${MESSAGE_ENDPOINT}`, () => {
  test('GET - 200 - returns all messages', async () => {
    const response = await api
      .get(MESSAGE_ENDPOINT)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const messages = response.body
    expect(messages.length).toBe(initialMessages.length)
  })

  test('POST - user but no content - 400 - error', async () => {
    const newMessage = {
      user: User.user,
      content: undefined,
    }

    const messagesBefore = getStoredMessages()

    const response = await api
      .post(MESSAGE_ENDPOINT)
      .send(newMessage)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toContain('content missing')

    const messagesAfter = getStoredMessages()
    expect(messagesBefore).toMatchObject(messagesAfter)
  })

  test('POST - no user - 400 - error', async () => {
    const newMessage = {
      user: undefined,
      content: 'hello world'
    }

    const messagesBefore = getStoredMessages()

    const response = await api
      .post(MESSAGE_ENDPOINT)
      .send(newMessage)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toContain('user missing')

    const messagesAfter = getStoredMessages()
    expect(messagesBefore).toMatchObject(messagesAfter)
  })

  test('POST - user with content - 201 - adds user message', async () => {
    const newMessage = {
      user: User.user,
      content: 'hello world! this is a brand new test message',
    }

    const initialIds = getStoredMessages().map(message => message.id)

    const response = await api
      .post(MESSAGE_ENDPOINT)
      .send(newMessage)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const responseMessage = response.body
    expect(responseMessage).toMatchObject({
      ...newMessage,
      user: User.user,
    })
    expect(responseMessage.id).toBeDefined()
    expect(responseMessage.content).toBe(newMessage.content)
    expect(initialIds).not.toContain(responseMessage.id)

    const storedMessages = getStoredMessages()
    expect(storedMessages.length).toBe(initialIds.length + 1)
    expect(storedMessages.map(message => message.content))
      .toContain(newMessage.content)
  })

  test('POST - assistant - 201 - generates new message', async () => {
    const newMessage = {
      user: User.assistant,
    }

    const initialIds = getStoredMessages().map(message => message.id)

    const response = await api
      .post(MESSAGE_ENDPOINT)
      .send(newMessage)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const responseMessage = response.body
    expect(responseMessage).toMatchObject({
      ...newMessage,
      user: User.assistant,
    })
    expect(responseMessage.id).toBeDefined()
    expect(typeof responseMessage.content).toBe('string')
    expect(initialIds).not.toContain(responseMessage.id)

    const storedMessages = getStoredMessages()
    expect(storedMessages.length).toBe(initialIds.length + 1)
    expect(storedMessages.map(message => message.id))
      .toContain(responseMessage.id)
  })
})
