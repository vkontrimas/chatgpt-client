const supertest = require('supertest')
const api = supertest(require('../../app'))

const ENDPOINT = '/api/login'

const { 
  modelUser,
  initialUsers,
  initializeDB,
  fetchAllUsers,
} = require('../db_helper')

describe(`API ${ENDPOINT}`, () => {
  beforeEach(async () => {
    await initializeDB()
  })

  test('POST - no email - 400 error', async () => {
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

  test('POST - no password - 400 error', async () => {
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

  test('POST - wrong email - 401 error', async () => {
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

  test('POST - wrong password - 401 error', async () => {
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

  test('POST - valid email and password - 200 get token', async () => {
    const { name, email, password } = initialUsers[0]
    const request = { email, password }

    const response = await api
      .post(ENDPOINT)
      .send(request)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(typeof response.body.token).toBe('string')
    expect(response.body.email).toBe(email)
    expect(response.body.name).toBe(name)
  })
})
