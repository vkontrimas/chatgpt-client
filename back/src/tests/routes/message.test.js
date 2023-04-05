const supertest = require('supertest')
const api = supertest(require('../../app'))
const { MESSAGE_ENDPOINT, initialMessages, getStoredMessages } = require('./message_helper')
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

  test('POST with no content - 400 - error', async () => {
    const newMessage = {
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
    expect(messagesBefore.length).toBe(messagesAfter.length)
  })

  test('POST with content - 201 - adds new message', async () => {
    const newMessage = {
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
    expect(initialIds).not.toContain(responseMessage.id)

    const storedMessages = getStoredMessages()
    console.log(storedMessages)
    expect(storedMessages.length).toBe(initialIds.length + 1)
    expect(storedMessages.map(message => message.content))
      .toContain(newMessage.content)
  })
})
