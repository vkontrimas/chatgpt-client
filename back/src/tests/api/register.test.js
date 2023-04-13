const { v4: uuidv4 } = require('uuid')
const supertest = require('supertest')
const api = supertest(require('../../app'))

const { initializeDB, modelUser, initialUsers, fetchAllUsers } = require('../db_helper')
const { RegistrationCode } = require('../../db/db')

const ENDPOINT = '/api/register'
const endpoint = (id) => `${ENDPOINT}/${id}`

const fakeId = async () => {
  let uuid = null
  let existing = null
  do {
    uuid = uuidv4()
    existing = await RegistrationCode.findByPk(uuid)
  }
  while (existing)
  return uuid
}

describe(`API ${ENDPOINT}`, () => {
  beforeEach(async () => {
    await initializeDB()
  })

  test('GET - with incorrect code - 200 - returns \'expired\'', async () => {
    const response = await api
      .get(endpoint(await fakeId()))
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toMatchObject({
      status: 'expired',
    })
  })

  test('GET - with correct code - 200 - returns \'valid\'', async () => {
    const code = await RegistrationCode.create({ remainingUses: 1 })

    const response = await api
      .get(endpoint(code.id))
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toMatchObject({
      status: 'valid',
    })
  })

  test('POST - register with incorrect code - 403 - expired', async () => {
    const response = await api
      .post(endpoint(await fakeId()))
      .expect(403)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toContain('registration expired')
  })

  test('POST - register with valid code until it expires - 201 * n, then 403', async () => {
    const code = await RegistrationCode.create({ remainingUses: 3 })

    const useCode = (expected, user) => {
      return api
        .post(endpoint(code.id))
        .send(user)
        .expect(expected)
        .expect('Content-Type', /application\/json/)
    }

    await useCode(201, { name: 'A', email: 'a@b.com', password: 'foo' })
    await useCode(201, { name: 'B', email: 'b@b.com', password: 'foo' })
    await useCode(201, { name: 'C', email: 'c@b.com', password: 'foo' })
    const errorResponse = await useCode(403, { name: 'D', email: 'd@b.com', password: 'foo' })

    expect(errorResponse.body.error).toContain('registration expired')
  })

  test('POST - valid code, no name - 400 error', async () => {
    const code = await RegistrationCode.create({ remainingUses: 1 })

    const request = modelUser()
    delete request.name

    const response = await api
      .post(endpoint(code.id))
      .send(request)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toMatch(/no name/)
  })

  test('POST - no email - 400 error', async () => {
    const code = await RegistrationCode.create({ remainingUses: 1 })

    const request = modelUser()
    delete request.email

    const response = await api
      .post(endpoint(code.id))
      .send(request)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toMatch(/no email/)
  })

  test('POST - no password - 400 error', async () => {
    const code = await RegistrationCode.create({ remainingUses: 1 })

    const request = modelUser()
    delete request.password

    const response = await api
      .post(endpoint(code.id))
      .send(request)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toMatch(/no password/)
  })

  test('POST - email exists - 400 error', async () => {
    const code = await RegistrationCode.create({ remainingUses: 1 })

    const request = {
      ...modelUser(),
      email: initialUsers[0].email,
    }

    const response = await api
      .post(endpoint(code.id))
      .send(request)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toMatch(/email in use/)
  })

  test('POST - valid - 201 created', async () => {
    const code = await RegistrationCode.create({ remainingUses: 1 })

    const request = modelUser()

    const response = await api
      .post(endpoint(code.id))
      .send(request)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const user = response.body
    expect(user.name).toBe(request.name)
    expect(user.email).toBe(request.email)
    expect(user.passwordHash).not.toBeDefined()
    expect(user.id).toBeDefined()

    const users = await fetchAllUsers()
    expect(users.length).toBe(initialUsers.length + 1)
    expect(users.map(user => user.email)).toContain(request.email)
  })
})
