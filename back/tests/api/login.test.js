const supertest = require('supertest')
const api = supertest(require('../../app'))

const { idToBase64 } = require('../../base64_id')
const { createTestUser } = require('../helper')

const ENDPOINT = '/api/login'

describe(`POST /api/login`, () => {
  test('400 - no email', async () => {
    const { email, password, user } = await createTestUser()
    const request = { password }
    const response = await api
      .post(ENDPOINT)
      .send(request)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toMatch(/no email/)
  })

  test('400 - no password', async () => {
    const { email, password, user } = await createTestUser()
    const request = { email }
    const response = await api
      .post(ENDPOINT)
      .send(request)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toMatch(/no password/)
  })

  test('401 - wrong email', async () => {
    const { password, user } = await createTestUser()
    const request = { 
      email: 'wrong@example.com',
      password,
    }
    const response = await api
      .post(ENDPOINT)
      .send(request)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toMatch(/unauthorized/)
  })

  test('401 - wrong password', async () => {
    const { email, password, user } = await createTestUser()
    const request = {
      email,
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
