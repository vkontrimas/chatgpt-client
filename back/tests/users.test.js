const jwt = require('jsonwebtoken')
const { uniqueTestUser } = require('./helper')
const { User } = require('db')

const { 
  createUser,
  createSessionToken,
  verifySessionToken,
} = require('../users')

const { SESSION_TOKEN_SECRET } = require('../config')

describe('createUser', () => {
  test('returns created user', async () => {
    const user = uniqueTestUser()

    const result = await createUser(user)
    const expected = {
      id: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      passwordHash: expect.stringMatching(/.+/),
    }

    expect(result.toJSON()).toMatchObject(expected)
    expect(JSON.stringify(result)).not.toContain(user.password)
  })


  test('adds user to DB', async () => {
    const usersBefore = await User.findAll({ raw: true })

    const user = uniqueTestUser()
    const created = await createUser(user)

    const found = await User.findByPk(created.id, { raw: true })
    expect(found).toMatchObject(created.toJSON())
  })

  test('throws if email collides', async () => {
    const dave = uniqueTestUser()
    const bob = { ...uniqueTestUser(), email: dave.email }

    await expect(createUser(dave)).resolves.toBeDefined()
    await expect(createUser(bob)).rejects.toMatch('email collision')
  })
})

describe('createUser', () => {
  test('throws if no first name', async () => {
    const user = uniqueTestUser()
    delete user.firstName
    await expect(createUser(user)).rejects.toMatch('no first name')
    await expect(createUser({ ...user, firstName: '' })).rejects.toMatch('no first name')
  })

  test('throws if no last name', async () => {
    const user = uniqueTestUser()
    delete user.lastName
    await expect(createUser(user)).rejects.toMatch('no last name')
    await expect(createUser({ ...user, lastName: '' })).rejects.toMatch('no last name')
  })

  test('throws if no email', async () => {
    const user = uniqueTestUser()
    delete user.email
    await expect(createUser(user)).rejects.toMatch('no email')
    await expect(createUser({ ...user, email: '' })).rejects.toMatch('no email')
  })

  test('throws if no password', async () => {
    const user = uniqueTestUser()
    delete user.password
    await expect(createUser(user)).rejects.toMatch('no password')
    await expect(createUser({ ...user, password: '' })).rejects.toMatch('no password')
  })
})

describe('createSessionToken', () => {
  test('throws if no password', async () => {
    const user = uniqueTestUser()
    await createUser(user)
    await expect(createSessionToken({ email: user.email, })).rejects.toMatch('no password')
    await expect(createSessionToken({ email: user.email, password: '' })).rejects.toMatch('no password')
  })

  test('throws if no email', async () => {
    const user = uniqueTestUser()
    await createUser(user)
    await expect(createSessionToken({ password: user.password })).rejects.toMatch('no email')
    await expect(createSessionToken({ email: '', password: user.password })).rejects.toMatch('no email')
  })

  test('throws if user doesnt exist', async () => {
    const user = uniqueTestUser()
    await expect(createSessionToken({ email: user.email, password: user.password })).rejects.toMatch('not found')
  })

  test('throws if password incorrect', async () => {
    const user = uniqueTestUser()
    const model = await createUser(user)
    await expect(createSessionToken({ email: user.email, password: 'wrongpassword' })).rejects.toMatch('wrong password')
  })

  test('returns a token and user if valid credentials', async () => {
    const user = uniqueTestUser()

    const userModel = await createUser(user)
    const [token, resultModel] = await createSessionToken({ email: user.email, password: user.password })
    expect(typeof token).toBe('string')
    expect(token.length > 0).toBe(true)
    expect(resultModel.toJSON()).toMatchObject(userModel.toJSON())
  })
})

describe('verifySessionToken', () => {
  test('throws if token missing', async () => {
    await expect(verifySessionToken(undefined)).rejects.toMatch('session token missing')
    await expect(verifySessionToken(null)).rejects.toMatch('session token missing')
  })

  test('throws if token expired', async () => {
    const user = uniqueTestUser()
    const model = await createUser(user)
    const expiredToken = jwt.sign({ id: model.id, email: model.email, }, SESSION_TOKEN_SECRET, { expiresIn: '2s' })
    await new Promise((res) => setTimeout(res, 3000))
    await expect(verifySessionToken(expiredToken)).rejects.toMatch('session token expired')
  })

  test('throws if payload missing id', async () => {
    const user = uniqueTestUser()
    const model = await createUser(user)
    const tokenWithoutId = jwt.sign({ email: model.email, }, SESSION_TOKEN_SECRET, { expiresIn: '7d' })
    await expect(verifySessionToken(tokenWithoutId)).rejects.toMatch('session token invalid')
    const tokenWithBlankId = jwt.sign({ id: '', email: model.email, }, SESSION_TOKEN_SECRET, { expiresIn: '7d' })
    await expect(verifySessionToken(tokenWithBlankId)).rejects.toMatch('session token invalid')
  })

  test('throws if payload id doesnt exist', async () => {
    const user = uniqueTestUser()

    const model = await createUser(user)
    const id = model.id
    await model.destroy()

    const tokenWithInvalidId = jwt.sign({ id, email: model.email, }, SESSION_TOKEN_SECRET, { expiresIn: '7d' })
    await expect(verifySessionToken(tokenWithInvalidId)).rejects.toMatch('session token invalid')
  })

  test('returns user if valid', async () => {
    const user = uniqueTestUser()
    const expected = await createUser(user)
    const [token] = await createSessionToken(user)
    const result = await verifySessionToken(token)

    expect(expected.toJSON()).toMatchObject(result.toJSON())
  })
})
