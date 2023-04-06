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

  test('POST with content - 201 - adds user message and ai reply', async () => {
    const newMessage = {
      content: 'hello world! this is a brand new test message',
    }

    const initialIds = getStoredMessages().map(message => message.id)

    const response = await api
      .post(MESSAGE_ENDPOINT)
      .send(newMessage)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const responseMessages = response.body
    expect(responseMessages).toMatchObject([
      {
        ...newMessage,
        user: User.user,
      },
      {
        user: User.assistant,
        // content: ???
      },
    ])
    expect(responseMessages)
    for (const message of responseMessages) {
      expect(message.id).toBeDefined()
      expect(message.content).toBeDefined()
    }
    // expect all IDs to be unique 
    expect(responseMessages.map(m => m.id)).not.toMatchObject(initialIds)

    const storedMessages = getStoredMessages()
    console.log(storedMessages)
    expect(storedMessages.length).toBe(initialIds.length + 2)
    expect(storedMessages.map(message => message.content))
      .toContain(newMessage.content)
  })
})
