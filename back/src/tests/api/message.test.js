const jwt = require('jsonwebtoken')
const supertest = require('supertest')
const api = supertest(require('../../app'))

const { User, Message } = require('../../db/db')
const { MessageType } = require('../../db/message')
const { initialUsers, wipeDB, initializeDB, fetchUserMessages } = require('../db_helper')

const ENDPOINT = '/api/message'

const bearerToken = async ({email, password}) => {
  const response = await api.post('/api/login')
    .send({ email, password })
    .expect(200)
  return `Bearer ${response.body.token}`
}

describe(`API ${ENDPOINT}`, () => {
  beforeEach(async () => {
    await wipeDB()
    await initializeDB()
  })
  test('GET - no bearer - 401 - unauthorised', async () => {
    const response = await api
      .get(ENDPOINT)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toContain('unauthorized')
  })

  test('GET - bearer for non-existing user - 401 - unauthorised', async () => {
    const user = initialUsers[1]
    const token = await bearerToken(user)
    const dbUser = await User.findByPk(user.id)
    await dbUser.destroy()

    const response = await api
      .get(ENDPOINT)
      .set('Authorization', token)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toContain('unauthorized')
  })

  test('GET - logged in - 200 - returns all messages', async () => {
    const user = initialUsers[0] 

    const response = await api
      .get(ENDPOINT)
      .set('Authorization', await bearerToken(user))
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const messages = response.body
    expect(messages.length).toBe(user.messages.length)
    expect(messages.map(message => message.content)).toMatchObject(user.messages.map(message => message.content))
  })

  test('POST - no bearer - 401 - unauthorized', async () => {
    const newMessage = {
      type: MessageType.USER,
      content: 'foo',
    }

    const response = await api
      .post(ENDPOINT)
      .send(newMessage)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toContain('unauthorized')
  })

  test('POST - bearer for non-existing user - 401 - unauthorized', async () => {
    const user = initialUsers[1]
    const token = await bearerToken(user)
    const dbUser = await User.findByPk(user.id)
    await dbUser.destroy()

    const newMessage = {
      type: MessageType.USER,
      content: 'foo',
    }

    const response = await api
      .post(ENDPOINT)
      .send(newMessage)
      .set('Authorization', token)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toContain('unauthorized')
  })

  test('POST - type but no content - 400 - error', async () => {
    const user = initialUsers[0]

    const newMessage = {
      type: MessageType.USER,
      content: undefined,
    }

    const response = await api
      .post(ENDPOINT)
      .send(newMessage)
      .set('Authorization', await bearerToken(user))
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toContain('content missing')

    const messagesAfter = await fetchUserMessages(user.id)
    expect(user.messages.length).toBe(messagesAfter.length)
  })

  test('POST - no type - 400 - error', async () => {
    const user = initialUsers[0]

    const newMessage = {
      type: undefined,
      content: 'hello world'
    }

    const response = await api
      .post(ENDPOINT)
      .send(newMessage)
      .set('Authorization', await bearerToken(user))
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toContain('type missing')

    const messagesAfter = await fetchUserMessages(user.id)
    expect(user.messages.length).toBe(messagesAfter.length)
  })

  test('POST - user with content - 201 - adds user message', async () => {
    const user = initialUsers[0]

    const newMessage = {
      type: MessageType.USER,
      content: 'hello world! this is a brand new test message',
    }

    const initialIds = (await fetchUserMessages(user.id)).map(message => message.id)

    const response = await api
      .post(ENDPOINT)
      .send(newMessage)
      .set('Authorization', await bearerToken(user))
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const responseMessage = response.body
    expect(responseMessage).toMatchObject({
      ...newMessage,
      type: MessageType.USER,
    })
    expect(responseMessage.id).toBeDefined()
    expect(responseMessage.content).toBe(newMessage.content)
    expect(initialIds).not.toContain(responseMessage.id)

    const storedMessages = await fetchUserMessages(user.id)
    expect(storedMessages.length).toBe(initialIds.length + 1)
    expect(storedMessages.map(message => message.content))
      .toContain(newMessage.content)
  })

  test('POST - creating user message doesn\'t affect other user\'s message', async () => {
    const user = initialUsers[0]
    const otherUser = initialUsers[1]

    const newMessage = {
      type: MessageType.USER,
      content: 'hello world! this is a brand new test message',
    }

    const response = await api
      .post(ENDPOINT)
      .send(newMessage)
      .set('Authorization', await bearerToken(user))
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const messagesAfter = await fetchUserMessages(otherUser.id)
    expect(otherUser.messages.length).toBe(messagesAfter.length)
  })

  test('POST - assistant - 201 - generates new message', async () => {
    const user = initialUsers[0]

    const newMessage = {
      type: MessageType.ASSISTANT,
    }

    const initialIds = (await fetchUserMessages(user.id)).map(message => message.id)

    const response = await api
      .post(ENDPOINT)
      .send(newMessage)
      .set('Authorization', await bearerToken(user))
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const responseMessage = response.body
    expect(responseMessage).toMatchObject({
      ...newMessage,
      type: MessageType.ASSISTANT,
    })
    expect(responseMessage.id).toBeDefined()
    expect(typeof responseMessage.content).toBe('string')
    expect(initialIds).not.toContain(responseMessage.id)

    const storedMessages = await fetchUserMessages(user.id)
    expect(storedMessages.length).toBe(initialIds.length + 1)
    expect(storedMessages.map(message => message.id))
      .toContain(responseMessage.id)
  })

  test('POST - creating assistant message doesn\'t affect other user\'s message', async () => {
    const user = initialUsers[0]
    const otherUser = initialUsers[1]

    const newMessage = {
      type: MessageType.ASSISTANT,
    }

    const response = await api
      .post(ENDPOINT)
      .send(newMessage)
      .set('Authorization', await bearerToken(user))
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const messagesAfter = await fetchUserMessages(otherUser.id)
    expect(otherUser.messages.length).toBe(messagesAfter.length)
  })

  test('DELETE - root, no bearer - 401 - unauthorised', async () => {
    const response = await api
      .delete(ENDPOINT)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toContain('unauthorized')
  })

  test('DELETE - root, bearer for non-existing user - 401 - unauthorised', async () => {
    const user = initialUsers[1]
    const token = await bearerToken(user)
    const dbUser = await User.findByPk(user.id)
    await dbUser.destroy()

    const response = await api
      .delete(ENDPOINT)
      .set('Authorization', token)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toContain('unauthorized')
  })


  test('DELETE - root - 204 - deletes all messages', async () => {
    const user = initialUsers[0]

    const allMessagesBefore = await Message.findAll()

    const response = await api
      .delete(ENDPOINT)
      .set('Authorization', await bearerToken(user))
      .expect(204)

    const [messagesAfter, allMessagesAfter] = await Promise.all([
      fetchUserMessages(user.id), Message.findAll()
    ])

    expect(messagesAfter.length).toBe(0)
    expect(allMessagesAfter.length).toBe(allMessagesBefore.length - user.messages.length)
  })

  test('DELETE - root - 204 - does not delete other user messages', async () => {
    const user = initialUsers[0]
    const otherUser = initialUsers[1]

    const response = await api
      .delete(ENDPOINT)
      .set('Authorization', await bearerToken(user))
      .expect(204)

    const messagesAfter = await fetchUserMessages(otherUser.id)
    expect(messagesAfter.length).toBe(otherUser.messages.length)
    expect(messagesAfter.map(message => message.content)).toMatchObject(otherUser.messages.map(message => message.content))
  })
})
