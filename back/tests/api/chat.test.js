const supertest = require('supertest')
const api = supertest(require('../../app'))

const uuid = require('uuid')
const { idToBase64 } = require('../../base64_id')

const { Chat, Message } = require('db')

const { createUser, createSessionToken } = require('../../users') 
const { ChatDriver } = require('../../chat')

const streamToArray = require('../../stream_to_array')

const ENDPOINT = '/api/chat'

const uniqueUser = () => {
  const name = `testUser_${idToBase64(uuid.v4())}`
  return {
    name,
    email: `${name}@example.com`,
    password: name,
  }
} 

const loginTestUser = async () => {
  const user = uniqueUser()
  await createUser(user)
  const [token, model] = await createSessionToken(user)
  return [ `Bearer ${token}`, model ]
}

describe('POST /chat - create chat', () => {
  test('201 - valid user creates chat', async () => {
    const [bearer] = await loginTestUser()
    const body = { model: 'potato' }

    const response = await api
      .post(ENDPOINT)
      .send(body)
      .set('Authorization', bearer)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toMatchObject({
      id: expect.stringMatching(/.+/),
      messages: [],
    })
  })

  test('201 - chat added to db', async () => {
    const [bearer, user] = await loginTestUser()
    const body = { model: 'potato' }

    const response = await api
      .post(ENDPOINT)
      .send(body)
      .set('Authorization', bearer)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const chat = await Chat.findByPk(response.body.id, { raw: true })
    expect(chat).not.toBeNull()
    expect(chat.UserId).toBe(user.id)
    expect(chat.aiModelName).toBe(body.model)
  })

  test('400 - missing token fails', async () => {
    const [bearer] = await loginTestUser()
    const body = { model: 'potato' }

    const response = await api
      .post(ENDPOINT)
      .send(body)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toMatchObject({ error: 'missing bearer token' })
  })

  test('401 - invalid user', async () => {
    const [bearer, user] = await loginTestUser()
    await user.destroy()
    const body = { model: 'potato' }

    const response = await api
      .post(ENDPOINT)
      .send(body)
      .set('Authorization', bearer)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toMatchObject({ error: 'unauthorized' })
  })

  test('400 - missing model name', async () => {
    const [bearer] = await loginTestUser()

    const response = await api
      .post(ENDPOINT)
      .set('Authorization', bearer)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toMatchObject({ error: 'missing model' })
  })
})

describe('GET /chat/:id - retrieve chat info & messages', () => {
  test('404 - non existing chat', async () => {
    const [bearer, user] = await loginTestUser()
    const chat = await ChatDriver.create(user.id, 'potato')
    await chat.destroy()

    const response = await api
      .get(`${ENDPOINT}/${idToBase64(chat.id)}`)
      .set('Authorization', bearer)
      .expect(404)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toMatchObject({ error: 'invalid chat id' })
  })

  test('400 - bearer missing', async () => {
    const [bearer, user] = await loginTestUser()
    const chat = await ChatDriver.create(user.id, 'potato')

    const response = await api
      .get(`${ENDPOINT}/${idToBase64(chat.id)}`)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toMatchObject({ error: 'missing bearer token' })
  })

  test('401 - accessing other users chat', async () => {
    const users = await Promise.all([loginTestUser(), loginTestUser()])
    const [aliceBearer, alice] = users[0]
    const [eveBearer] = users[1]
    const aliceChat = await ChatDriver.create(alice.id, 'potato')

    const response = await api
      .get(`${ENDPOINT}/${idToBase64(aliceChat.id)}`)
      .set('Authorization', eveBearer)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toMatchObject({ error: 'unauthorized' })
  })

  test('200 - return chat messages', async () => {
    const [bearer, user] = await loginTestUser()
    const messages = [
      { role: 'user', content: 'hello!' },
      { role: 'assistant', content: 'hi, how may I help?' },
      { role: 'user', content: 'make me a cuppa' },
      { role: 'assistant', content: 'no problem' },
    ]

    const chat = await ChatDriver.create(user.id, 'potato')
    for (const message of messages) {
      await chat.postMessage(message)
    }

    const response = await api
      .get(`${ENDPOINT}/${idToBase64(chat.id)}`)
      .set('Authorization', bearer)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toMatchObject({
      messages: messages.map(m => ({
        id: expect.stringMatching(/.+/),
        content: m.content,
        role: m.role,
        status: 'done',
      }))
    })
  })
})

describe('POST /chat/:id/add - add message', () => {
  test('404 - chat does not exist', async () => {
    const [bearer, user] = await loginTestUser()
    const body = { role: 'user', content: 'hello!' }
    const chat = await ChatDriver.create(user.id, 'potato')
    await chat.destroy()

    const response = await api
      .post(`${ENDPOINT}/${idToBase64(chat.id)}/add`)
      .send(body)
      .set('Authorization', bearer)
      .expect(404)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toMatchObject({ error: 'invalid chat id' })
  })

  test('400 - missing role', async () => {
    const [bearer, user] = await loginTestUser()
    const body = { content: 'hello!' }
    const chat = await ChatDriver.create(user.id, 'potato')

    const response = await api
      .post(`${ENDPOINT}/${idToBase64(chat.id)}/add`)
      .send(body)
      .set('Authorization', bearer)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toMatchObject({ error: 'missing role' })
  })

  test('400 - missing content', async () => {
    const [bearer, user] = await loginTestUser()
    const body = { role: 'user' }
    const chat = await ChatDriver.create(user.id, 'potato')

    const response = await api
      .post(`${ENDPOINT}/${idToBase64(chat.id)}/add`)
      .send(body)
      .set('Authorization', bearer)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toMatchObject({ error: 'missing content' })
  })

  test('401 - cannot post to other users chats', async () => {
    const users  = await Promise.all([ loginTestUser(), loginTestUser() ])
    const body = { role: 'user', content: 'hello!' }
    const [aliceBearer, alice] = users[0]
    const [eveBearer] = users[1]

    const aliceChat = await ChatDriver.create(alice.id, 'potato')

    const response = await api
      .post(`${ENDPOINT}/${idToBase64(aliceChat.id)}/add`)
      .send(body)
      .set('Authorization', eveBearer)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toMatchObject({ error: 'unauthorized' })
  })

  test('409 - cannot post while ai agent is replying', async () => {
    const [bearer, user] = await loginTestUser()
    const body = { role: 'user', content: 'hello!' }
    const chat = await ChatDriver.create(user.id, 'potato', { deltaCount: 4, delayMs: 500 })
    await chat.postMessage({ role: 'user', content: 'hello' })
    const [message, stream] = await chat.completeCurrentThread()

    const response = await api
      .post(`${ENDPOINT}/${idToBase64(chat.id)}/add`)
      .send(body)
      .set('Authorization', bearer)
      .expect(409)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toMatchObject({ error: 'cannot post chat message while completion is running' })

    await streamToArray(stream)
  })

  test('409 - cannot post when last message has error', async () => {
    const [bearer, user] = await loginTestUser()
    const body = { role: 'user', content: 'hello!' }
    const chat = await ChatDriver.create(user.id, 'potato', { deltaCount: 4, throwOn: 2 })
    await chat.postMessage({ role: 'user', content: 'hello' })
    const [message, stream] = await chat.completeCurrentThread()
    await expect(streamToArray(stream)).rejects.toMatch(/.*/)

    const response = await api
      .post(`${ENDPOINT}/${idToBase64(chat.id)}/add`)
      .send(body)
      .set('Authorization', bearer)
      .expect(409)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toMatchObject({ error: 'cannot post message after a message with an error' })
  })

  test('201 - creates new message', async () => {
    const [bearer, user] = await loginTestUser()
    const chat = await ChatDriver.create(user.id, 'potato')

    const body = { role: 'user', content: 'hello!' }

    const response = await api
      .post(`${ENDPOINT}/${idToBase64(chat.id)}/add`)
      .send(body)
      .set('Authorization', bearer)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toMatchObject({
      id: expect.stringMatching(/.+/),
      role: body.role,
      content: body.content,
      status: 'done',
    })

    const dbMessage = await Message.findByPk(response.body.id, { raw: true })
    expect(dbMessage).toMatchObject({
      id: expect.stringMatching(/.+/),
      ChatId: chat.id,
      role: body.role,
      content: body.content,
      status: 'done',
    })
  })
})
