const supertest = require('supertest')
const api = supertest(require('../../app'))

const { idToBase64 } = require('../../base64_id')
const { createTestUser } = require('../helper')

const ENDPOINT = '/api/login'

const { 
  modelUser,
  initialUsers,
  initializeDB,
  fetchAllUsers,
} = require('../db_helper')

describe(`POST /api/login`, () => {
  beforeEach(async () => {
    await initializeDB()
  })

  test('400 - no email', async () => {
    const request = {
      password: 'sekret',
    }
    const response = await api
      .post(ENDPOINT)
      .send(request)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toMatch(/no email/)
  })

  test('400 - no password', async () => {
    const request = {
      email: initialUsers[0].email,
    }
    const response = await api
      .post(ENDPOINT)
      .send(request)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toMatch(/no password/)
  })

  test('401 - wrong email', async () => {
    const request = {
      ...initialUsers[0],
      email: 'wrong@example.com',
    }
    const response = await api
      .post(ENDPOINT)
      .send(request)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toMatch(/unauthorized/)
  })

  test('401 - wrong password', async () => {
    const request = {
      ...initialUsers[0],
      password: 'wrongpassword',
    }
    const response = await api
      .post(ENDPOINT)
      .send(request)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toMatch(/unauthorized/)
  })

  test('200 - creates session token', async () => {
    const { email, password, user } = await createTestUser()

    const response = await api
      .post(ENDPOINT)
      .send({ email, password })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toMatchObject({
      id: idToBase64(user.id),
      name: user.name,
      token: expect.stringMatching('.*')
    })
  })
})
