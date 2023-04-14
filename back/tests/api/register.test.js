const supertest = require('supertest')
const api = supertest(require('../../app'))

const { initializeDB } = require('../db_helper')
const { User, RegistrationCode } = require('db')
const { idToBase64 } = require('../../base64_id')

const { 
  createRegistrationCode,
  createUserWithRegistrationCode
} = require('../../registration')

const ENDPOINT = '/api/register'
const endpoint = (id) => `${ENDPOINT}/${id}`

describe(`API ${ENDPOINT}`, () => {
  beforeEach(async () => {
    await initializeDB()
  })

  test('GET - with incorrect code - 404 - returns \'invalid registration url\'', async () => {
    const code = await createRegistrationCode({ remainingUses: 1 })
    const id = code.id
    await code.destroy()

    const response = await api
      .get(endpoint(idToBase64(code.id)))
      .expect(404)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toMatchObject({
      error: 'invalid registration url',
    })
  })

  test('GET - with correct code - 200 - returns \'valid\'', async () => {
    const code = await createRegistrationCode({ remainingUses: 1 })

    const response = await api
      .get(endpoint(idToBase64(code.id)))
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toMatchObject({
      status: 'valid',
    })
  })

  test('GET - with expired code - 200 - returns \'used\'', async () => {
    const code = await createRegistrationCode({ remainingUses: 1 })
    await createUserWithRegistrationCode({
      user: {
        name: 'Bart', email: 'bart@example.com', password: 'eatmyshorts'
      },
      codeId: code.id,
    })

    const response = await api
      .get(endpoint(idToBase64(code.id)))
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toMatchObject({
      status: 'used',
    })
  })

  test('POST - register with incorrect code - 404 - incorrect code', async () => {
    const code = await createRegistrationCode({ remainingUses: 1 })
    const id = code.id
    await code.destroy()

    const response = await api
      .post(endpoint(idToBase64(id)))
      .expect(404)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toContain('invalid registration url')
  })

  test('POST - register with valid code until it expires - 201 * n, then 403', async () => {
    const code = await createRegistrationCode({ remainingUses: 3 })

    const useCode = (expected, user) => {
      return api
        .post(endpoint(idToBase64(code.id)))
        .send(user)
        .expect(expected)
        .expect('Content-Type', /application\/json/)
    }

    await useCode(201, { name: 'A', email: 'a@b.com', password: 'foo' })
    await useCode(201, { name: 'B', email: 'b@b.com', password: 'foo' })
    await useCode(201, { name: 'C', email: 'c@b.com', password: 'foo' })
    const errorResponse = await useCode(403, { name: 'D', email: 'd@b.com', password: 'foo' })
    expect(errorResponse.body.error).toContain('expired')
  })

  test('POST - valid code, no name - 400 error', async () => {
    const code = await createRegistrationCode({ remainingUses: 1 })

    const response = await api
      .post(endpoint(idToBase64(code.id)))
      .send({ email: 'foo@example.com', password: 'bar' })
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toMatch(/no name/)
  })

  test('POST - no email - 400 error', async () => {
    const code = await createRegistrationCode({ remainingUses: 1 })

    const response = await api
      .post(endpoint(idToBase64(code.id)))
      .send({ name: 'Foo', password: 'pass' })
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toMatch(/no email/)
  })

  test('POST - no password - 400 error', async () => {
    const code = await createRegistrationCode({ remainingUses: 1 })

    const response = await api
      .post(endpoint(idToBase64(code.id)))
      .send({ name: 'Foo', email: 'foo@example.com' })
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toMatch(/no password/)
  })

  test('POST - email exists - 400 error', async () => {
    const code = await createRegistrationCode({ remainingUses: 1 })
    const user = await User.findOne()

    const response = await api
      .post(endpoint(idToBase64(code.id)))
      .send({ name: 'barb', email: user.email, password: 'foo' })
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toMatch(/email in use/)
  })

  test('POST - valid - 201 created', async () => {
    const code = await createRegistrationCode({ remainingUses: 1 })
    const usersBefore = await User.findAll({ raw: true })

    const request = {
      name: 'work',
      email: 'work@example.com',
      password: 'please',
    }

    const response = await api
      .post(endpoint(idToBase64(code.id)))
      .send(request)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const user = response.body
    expect(user.name).toBe(request.name)
    expect(user.email).toBe(request.email)
    expect(user.passwordHash).not.toBeDefined()
    expect(user.id).toBeDefined()

    const usersAfter = await User.findAll({ raw: true })
    expect(usersAfter.length).toBe(usersBefore.length + 1)
    expect(usersAfter.map(user => user.email)).toContain(request.email)
  })
})
