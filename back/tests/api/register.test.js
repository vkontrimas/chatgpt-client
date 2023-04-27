const supertest = require('supertest')
const api = supertest(require('../../app'))

const { uniqueTestUser } = require('../helper')
const { User, RegistrationCode } = require('../../models')
const { idToBase64, idFromBase64 } = require('../../base64_id')

const { 
  createRegistrationCode,
  createUserWithRegistrationCode
} = require('../../registration')

const ENDPOINT = '/api/register'
const endpoint = (id) => `${ENDPOINT}/${id}`

describe(`API ${ENDPOINT}`, () => {
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
      user: uniqueTestUser(),
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

    await useCode(201, uniqueTestUser())
    await useCode(201, uniqueTestUser())
    await useCode(201, uniqueTestUser())
    const errorResponse = await useCode(403, uniqueTestUser())
    expect(errorResponse.body.error).toContain('expired')
  })

  test('POST - valid code, no first name - 400 error', async () => {
    const user = uniqueTestUser()
    delete user.firstName

    const code = await createRegistrationCode({ remainingUses: 1 })

    const response = await api
      .post(endpoint(idToBase64(code.id)))
      .send(user)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toMatch(/no first name/)
  })

  test('POST - valid code, no last name - 400 error', async () => {
    const user = uniqueTestUser()
    delete user.lastName
    const code = await createRegistrationCode({ remainingUses: 1 })

    const response = await api
      .post(endpoint(idToBase64(code.id)))
      .send(user)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toMatch(/no last name/)
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
    const existingUser = await User.findOne({ raw: true })
    const user = {
      ...uniqueTestUser(),
      email: existingUser.email,
    }

    const response = await api
      .post(endpoint(idToBase64(code.id)))
      .send(user)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toMatch(/email in use/)
  })

  test('POST - valid - 201 created', async () => {
    const code = await createRegistrationCode({ remainingUses: 1 })
    const request = uniqueTestUser()

    const response = await api
      .post(endpoint(idToBase64(code.id)))
      .send(request)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const user = response.body
    expect(user).toMatchObject({
      id: expect.stringMatching(/.*/),
      firstName: request.firstName,
      lastName: request.lastName,
      email: request.email,
    })

    const foundUser = await User.findByPk(idFromBase64(user.id), { raw: true })
    expect(foundUser).toMatchObject({ ...user, id: idFromBase64(user.id) })

    expect(JSON.stringify(user)).not.toContain(foundUser.passwordHash)
    expect(JSON.stringify(user)).not.toContain(request.password)
  })
})
