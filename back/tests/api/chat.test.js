const supertest = require('supertest')
const api = supertest(require('../../app'))

const uuid = require('uuid')
const { idToBase64 } = require('../../base64_id')

const { Chat } = require('db')

const { createUser, createSessionToken } = require('../../users') 
const { ChatDriver } = require('../../chat')

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
      .get(`${ENDPOINT}/${chat.id}`)
      .set('Authorization', bearer)
      .expect(404)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toMatchObject({ error: 'chat doesnt exist' })
  })

  test('400 - bearer missing', async () => {
    const [bearer, user] = await loginTestUser()
    const chat = await ChatDriver.create(user.id, 'potato')

    const response = await api
      .get(`${ENDPOINT}/${chat.id}`)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toMatchObject({ error: 'missing bearer token' })
  })

  test('401 - accessing other users chat', async () => {
    const [aliceBearer, alice] = await loginTestUser()
    const aliceChat = await ChatDriver.create(alice.id, 'potato')

    const [eveBearer, eve] = await loginTestUser()

    const response = await api
      .get(`${ENDPOINT}/${aliceChat.id}`)
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
      .get(`${ENDPOINT}/${user.id}`)
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
