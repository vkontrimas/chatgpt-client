const supertest = require('supertest')
const api = supertest(require('../../app'))

const { Writable } = require('stream')
const streamToArray = require('../../stream_to_array')

const { Chat, Message } = require('db')
const { ChatDriver } = require('../../chat')
const { loginTestUser } = require('../helper')
const { idToBase64, idFromBase64 } = require('../../base64_id')


const ENDPOINT = '/api/chat'

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

    const uuid = idFromBase64(response.body.id)
    const chat = await Chat.findByPk(uuid, { raw: true })
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

    const uuid = idFromBase64(response.body.id)
    const dbMessage = await Message.findByPk(uuid, { raw: true })
    expect(dbMessage).toMatchObject({
      id: expect.stringMatching(/.+/),
      ChatId: chat.id,
      role: body.role,
      content: body.content,
      status: 'done',
    })
  })
})

class CompletionStreamWritable extends Writable {
  constructor(resolve, reject) {
    super()
    this.responseItems = []
    this.resolveCallback = resolve
    this.rejectCallback = reject
  }

  _write(value, encoding, callback) {
    this.responseItems.push(JSON.parse(value.toString()))
    callback()
  }

  _destroy(error, callback) {
    if (error) { this.rejectCallback(error) }
    else { this.resolveCallback(this.responseItems) }
    callback()
  }
}

describe('POST /chat/:id/complete - complete messages', () => {
  test('201 - creates new message', async () => {
    const [bearer, user] = await loginTestUser()

    const chat = await ChatDriver.create(user.id, 'potato', { deltaCount: 3 })
    await chat.postMessage({ role: 'user', content: 'hello' })

    const expected = [
      {
        id: expect.stringMatching(/.*/),
        status: 'pending',
      },
      {
        delta: 'potato',
        status: 'completing',
      },
      {
        delta: 'potato',
        status: 'completing',
      },
      {
        delta: 'potato',
        status: 'completing',
      },
      {
        status: 'done',
      }
    ]

    const result = await new Promise((resolve, reject) => {
      const writable = new CompletionStreamWritable(resolve, reject)
      api.post(`${ENDPOINT}/${idToBase64(chat.id)}/complete`)
        .set('Authorization', bearer)
        .expect(201)
        .expect('Content-Type', /application\/octet-stream/)
        .pipe(writable)
    })

    expect(result).toMatchObject(expected)

    const receivedMessage = expected
      .filter(part => part.status === 'completing')
      .map(({ delta }) => delta)
      .join('')

    expect(receivedMessage).toBe('potatopotatopotato')

    const uuid = idFromBase64(result[0].id)
    const dbMessage = await Message.findByPk(uuid, { raw: true })
    expect(dbMessage).toMatchObject({
      id: uuid,
      status: 'done',
      role: 'assistant',
      content: 'potatopotatopotato',
    })
  })
})

describe('POST /chat/:id/complete - complete messages', () => {
  test('404 - chat does not exist', async () => {
    const [bearer, user] = await loginTestUser()
    const chat = await ChatDriver.create(user.id, 'potato')
    await chat.destroy()

    const response = await api
      .post(`${ENDPOINT}/${idToBase64(chat.id)}/complete`)
      .set('Authorization', bearer)
      .expect(404)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toMatchObject({ error: 'invalid chat id' })
  })

  test('401 - cannot post to other users chats', async () => {
    const users  = await Promise.all([ loginTestUser(), loginTestUser() ])
    const [aliceBearer, alice] = users[0]
    const [eveBearer] = users[1]

    const aliceChat = await ChatDriver.create(alice.id, 'potato')
    await aliceChat.postMessage({ role: 'user', content: 'hello' })

    const response = await api
      .post(`${ENDPOINT}/${idToBase64(aliceChat.id)}/complete`)
      .set('Authorization', eveBearer)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toMatchObject({ error: 'unauthorized' })
  })

  test('409 - cannot complete when no messages', async () => {
    const [bearer, user] = await loginTestUser()
    const chat = await ChatDriver.create(user.id, 'potato')

    const response = await api
      .post(`${ENDPOINT}/${idToBase64(chat.id)}/complete`)
      .set('Authorization', bearer)
      .expect(409)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toMatchObject({ error: 'cannot complete chat with no messages' })
  })


  test('409 - cannot post while ai agent is replying', async () => {
    const [bearer, user] = await loginTestUser()

    const chat = await ChatDriver.create(user.id, 'potato', { deltaCount: 4, delayMs: 500 })
    await chat.postMessage({ role: 'user', content: 'hello' })
    const [message, stream] = await chat.completeCurrentThread()

    const response = await api
      .post(`${ENDPOINT}/${idToBase64(chat.id)}/complete`)
      .set('Authorization', bearer)
      .expect(409)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toMatchObject({ error: 'cannot complete chat while another completion is running' })

    await streamToArray(stream)
  })

  test('409 - cannot post when last message has error', async () => {
    const [bearer, user] = await loginTestUser()

    const chat = await ChatDriver.create(user.id, 'potato', { deltaCount: 4, throwOn: 2 })
    await chat.postMessage({ role: 'user', content: 'hello' })
    const [message, stream] = await chat.completeCurrentThread()
    await expect(streamToArray(stream)).rejects.toMatch(/.*/)

    const response = await api
      .post(`${ENDPOINT}/${idToBase64(chat.id)}/complete`)
      .set('Authorization', bearer)
      .expect(409)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toMatchObject({ error: 'cannot complete chat when last message has error' })
  })
})

describe('DELETE /api/chat/:id/all - delete all messages', () => {
  test('404 - chat does not exist', async () => {
    const [bearer, user] = await loginTestUser()
    const chat = await ChatDriver.create(user.id, 'potato')
    await chat.destroy()

    const response = await api
      .delete(`${ENDPOINT}/${idToBase64(chat.id)}/all`)
      .set('Authorization', bearer)
      .expect(404)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toMatchObject({ error: 'invalid chat id' })
  })

  test('401 - cannot delete other users chats', async () => {
    const users  = await Promise.all([ loginTestUser(), loginTestUser() ])
    const [aliceBearer, alice] = users[0]
    const [eveBearer] = users[1]

    const aliceChat = await ChatDriver.create(alice.id, 'potato')

    const response = await api
      .delete(`${ENDPOINT}/${idToBase64(aliceChat.id)}/all`)
      .set('Authorization', eveBearer)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toMatchObject({ error: 'unauthorized' })
  })

  test('409 - cannot delete during completion', async () => {
    const [bearer, user] = await loginTestUser()
    const chat = await ChatDriver.create(user.id, 'potato', { deltaCount: 3, delayMs: 300 })
    await chat.postMessage({ role: 'user', content: 'hello' })
    const [message, stream] = await chat.completeCurrentThread()

    const response = await api
      .delete(`${ENDPOINT}/${idToBase64(chat.id)}/all`)
      .set('Authorization', bearer)
      .expect(409)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toMatchObject({ error: 'cannot delete messages during chat completion' })

    await streamToArray(stream)
  })

  test('204 - delete all messages', async () => {
    const [bearer, user] = await loginTestUser()
    const chat = await ChatDriver.create(user.id, 'potato')

    const response = await api
      .delete(`${ENDPOINT}/${idToBase64(chat.id)}/all`)
      .set('Authorization', bearer)
      .expect(204)
  })
})

describe('GET /api/chat - list all chats', () => {
  test('400 - if no bearer', async () => {
    const response = await api
      .get(`${ENDPOINT}`)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    expect(response.body).toMatchObject({ error: 'missing bearer token' })
  })

  test('200 - empty list if user has no chats', async () => {
    const [bearer, user] = await loginTestUser()

    const response = await api
      .get(`${ENDPOINT}`)
      .set('Authorization', bearer)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toMatchObject([])
  })

  test('200 - list user chats', async () => {
    const [bearer, user] = await loginTestUser()
    const chats = await Promise.all([
      ChatDriver.create(user.id, 'potato'),
      ChatDriver.create(user.id, 'potato'),
      ChatDriver.create(user.id, 'potato'),
      ChatDriver.create(user.id, 'potato'),
    ])

    const response = await api
      .get(`${ENDPOINT}`)
      .set('Authorization', bearer)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const expectedIds = chats.map(chat => ({ id: chat.id }))
    expect(response.body.sort()).toMatchObject(expectedIds.sort())
  })
})
