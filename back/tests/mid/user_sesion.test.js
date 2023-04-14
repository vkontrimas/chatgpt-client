const jwt = require('jsonwebtoken')

const userSession = require('../../mid/user_session')
const { 
  createUser,
  createSessionToken,
} = require('../../users')
const { SESSION_TOKEN_SECRET } = require('../../config')

const mockRequest = (authorization) => ({
  get: (key) => {
    if (key === 'authorization') {
      return authorization
    }
    throw 'unexpected'
  }
})

const { initializeDB } = require('../db_helper')

beforeEach(async () => {
  await initializeDB()
})

describe('userSession middleware', () => {
  test('bearer with token creates lazy loader, calls next', async () => {
    const user = {
      name: 'Roger',
      email: 'roj@example.com',
      password: 'whatsyourvectorvictor',
    }
    const model = await createUser(user)
    const [token] = await createSessionToken(user)

    const next = jest.fn()
    const req = mockRequest(`Bearer ${token}`)
    userSession(req, {}, next)
    expect(typeof req.verifyUserSession).toBe('function')
    expect(next).toHaveBeenCalled()
  })

  test('lazy loader loads correct user', async () => {
    const user = {
      name: 'Roger',
      email: 'roj@example.com',
      password: 'whatsyourvectorvictor',
    }
    const model = await createUser(user)
    const [token] = await createSessionToken(user)

    const req = mockRequest(`Bearer ${token}`)
    userSession(req, {}, () => {})

    const result = await req.verifyUserSession()
    expect(result.toJSON()).toMatchObject(model.toJSON())
  })

  test('lazy loader throws for expired token', async () => {
    const user = {
      name: 'Roger',
      email: 'roj@example.com',
      password: 'whatsyourvectorvictor',
    }
    const model = await createUser(user)
    const token = jwt.sign({ id: model.id, email: model.email }, SESSION_TOKEN_SECRET, { expiresIn: '2s' })
    await new Promise(res => setTimeout(res, 3000))

    const req = mockRequest(`Bearer ${token}`)
    userSession(req, {}, () => {})

    await expect(req.verifyUserSession()).rejects.toMatch('session token expired')
  })

  test('lazy loader throws invalid id token', async () => {
    const user = {
      name: 'Roger',
      email: 'roj@example.com',
      password: 'whatsyourvectorvictor',
    }
    const model = await createUser(user)
    const [token] = await createSessionToken(user)
    model.destroy()

    const req = mockRequest(`Bearer ${token}`)
    userSession(req, {}, () => {})

    await expect(req.verifyUserSession()).rejects.toMatch('session token invalid')
  })

  test('lazy loader throws for missigned token', async () => {
    const user = {
      name: 'Roger',
      email: 'roj@example.com',
      password: 'whatsyourvectorvictor',
    }
    const model = await createUser(user)
    const token = jwt.sign({ id: model.id, email: model.email }, 'wrong sekret')

    const req = mockRequest(`Bearer ${token}`)
    userSession(req, {}, () => {})

    await expect(req.verifyUserSession()).rejects.toMatch('session token invalid')
  })

  test('lazy loader throws for no bearer', async () => {
    const req = mockRequest(undefined)
    userSession(req, {}, () => {})
    await expect(req.verifyUserSession).rejects.toMatch('missing bearer token')
  })

  test('lazy loader throws for unexpected auth header', async () => {
    const req = mockRequest('foozle barrrzle')
    userSession(req, {}, () => {})
    await expect(req.verifyUserSession).rejects.toMatch('missing bearer token')
  })

})
