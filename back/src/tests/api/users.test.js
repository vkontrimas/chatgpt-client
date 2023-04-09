const supertest = require('supertest')
const api = supertest(require('../../app'))

const ENDPOINT = '/api/users'

const { 
  modelUser,
  initialUsers,
  initializeDB,
  wipeDB,
  fetchAllUsers,
} = require('../db_helper')

describe(`API ${ENDPOINT}`, () => {
  beforeEach(async () => {
    await initializeDB()
  })

  afterEach(async () => {
    await wipeDB()
  })

  test('GET - 200 - returns all users', async () => {
    const response = await api
      .get(ENDPOINT)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const users = response.body

    expect(initialUsers.length).toBe(users.length)
    expect(initialUsers.map(user => user.email)).toMatchObject(users.map(user => user.email))
  })

  test('POST - no email - 400 error', async () => {
    const request = {
      ...modelUser(),
      email: undefined,
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
      ...modelUser(),
      password: undefined,
    }

    const response = await api
      .post(ENDPOINT)
      .send(request)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toMatch(/no password/)
  })

  test('POST - email exists - 400 error', async () => {
    const request = {
      ...modelUser(),
      email: initialUsers[0].email,
    }

    const response = await api
      .post(ENDPOINT)
      .send(request)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toMatch(/email in use/)
  })

  test('POST - valid - 201 created', async () => {
    const request = modelUser()

    const response = await api
      .post(ENDPOINT)
      .send(request)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const user = response.body
    console.log(user)
    expect(user.email).toBe(request.email)
    expect(user.passwordHash).not.toBeDefined()
    expect(user.id).toBeDefined()

    const users = await fetchAllUsers()
    expect(users.length).toBe(initialUsers.length + 1)
    expect(users.map(user => user.email)).toContain(request.email)
  })
})

