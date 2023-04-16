const supertest = require('supertest')
const api = supertest(require('../../app'))

const uuid = require('uuid')
const { idToBase64 } = require('../../base64_id')

const { Chat } = require('db')

const { createUser, createSessionToken } = require('../../users') 

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

describe('POST - create chat', () => {
  test('201 - valid user creates chat', async () => {
    const [bearer, user] = await loginTestUser()
    const body = { model: 'openai' }

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
    const body = { model: 'openai' }

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
    const [bearer, user] = await loginTestUser()
    const body = { model: 'openai' }

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
    const body = { model: 'openai' }

    const response = await api
      .post(ENDPOINT)
      .send(body)
      .set('Authorization', bearer)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toMatchObject({ error: 'unauthorized' })
  })

  test('400 - missing model name', async () => {
    const [bearer, user] = await loginTestUser()

    const response = await api
      .post(ENDPOINT)
      .set('Authorization', bearer)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toMatchObject({ error: 'missing model' })
  })
})
