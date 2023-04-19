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

const { createTestUser, loginTestUser } = require('../helper')


describe('userSession middleware', () => {
  test('bearer with token creates lazy loader, calls next', async () => {
    const [bearer, model] = await loginTestUser()

    const next = jest.fn()
    const req = mockRequest(bearer)
    userSession(req, {}, next)
    expect(typeof req.verifyUserSession).toBe('function')
    expect(next).toHaveBeenCalled()
  })

  test('lazy loader loads correct user', async () => {
    const [bearer, model] = await loginTestUser()

    const req = mockRequest(bearer)
    userSession(req, {}, () => {})

    const result = await req.verifyUserSession()
    expect(result.toJSON()).toMatchObject(model.toJSON())
  })

  test('lazy loader throws for expired token', async () => {
    const { user } = await createTestUser()
    const token = jwt.sign({ id: user.id, email: user.email }, SESSION_TOKEN_SECRET, { expiresIn: '2s' })
    await new Promise(res => setTimeout(res, 3000))

    const req = mockRequest(`Bearer ${token}`)
    userSession(req, {}, () => {})

    await expect(req.verifyUserSession()).rejects.toMatch('session token expired')
  })

  test('lazy loader throws invalid id token', async () => {
    const { email, password, user } = await createTestUser()
    const [token] = await createSessionToken({ email, password })
    user.destroy()

    const req = mockRequest(`Bearer ${token}`)
    userSession(req, {}, () => {})

    await expect(req.verifyUserSession()).rejects.toMatch('session token invalid')
  })

  test('lazy loader throws for missigned token', async () => {
    const { user } = await createTestUser()
    const token = jwt.sign({ id: user.id, email: user.email }, 'wrong sekret')

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
