const jwt = require('jsonwebtoken')
const { initializeDB } = require('./db_helper')
const { User } = require('db')

const { 
  createUser,
  createSessionToken,
  verifySessionToken,
} = require('../users')
const { SESSION_TOKEN_SECRET } = require('../config')

beforeEach(async () => {
  await initializeDB()
})

describe('createUser', () => {
  test('returns created user', async () => {
    const user = {
      name: 'Dave',
      email: 'dave@example.com',
      password: 'daverox',
    }

    const result = await createUser(user)
    const expected = {
      id: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
      name: user.name,
      email: user.email,
      passwordHash: expect.stringMatching(/.+/),
    }

    expect(result.toJSON()).toMatchObject(expected)
    expect(JSON.stringify(result)).not.toMatch(new RegExp(`${user.password}`, 'g'))
  })


  test('adds user to DB', async () => {
    const usersBefore = await User.findAll({ raw: true })

    const user = {
      name: 'Dave',
      email: 'dave@example.com',
      password: 'daverox'
    }
    const created = await createUser(user)

    const usersAfter = await User.findAll({ raw: true })
    expect(usersAfter.length).toBe(usersBefore.length + 1)
    expect(usersAfter).toContainEqual(created.toJSON())
  })

  test('throws if email collides', async () => {
    const email = 'foo@example.com'

    await expect(createUser({
      name: 'Dave',
      email,
      password: 'daverox',
    }))
      .resolves.toBeDefined()

    const usersBefore = await User.findAll({ raw: true })
    await expect(createUser({
      name: 'Bobby',
      email,
      password: 'roberto',
    }))
      .rejects.toMatch('email collision')

    const usersAfter = await User.findAll({ raw: true })
    expect(usersAfter).toMatchObject(usersBefore)
  })
})

describe('createUser', () => {
  let usersBefore = []

  beforeEach(async () => {
    usersBefore = await User.findAll({ raw: true })
  })

  afterEach(async () => {
    const usersAfter = await User.findAll({ raw: true })
    expect(usersAfter).toMatchObject(usersBefore)
  })

  test('throws if no name', async () => {
    await expect(createUser({ email: 'dave@example.com', password: 'daverox' }))
      .rejects.toMatch('no name')
    await expect(createUser({ name: '', email: 'dave@example.com', password: 'daverox' }))
      .rejects.toMatch('no name')
  })

  test('throws if no email', async () => {
    await expect(createUser({ name: 'Dave', password: 'daverox' }))
      .rejects.toMatch('no email')
    await expect(createUser({ name: 'Dave', email: '', password: 'daverox' }))
      .rejects.toMatch('no email')
  })

  test('throws if no password', async () => {
    await expect(createUser({ name: 'Dave', email: 'dave@example.com' }))
      .rejects.toMatch('no password')
    await expect(createUser({ name: 'Dave', email: 'dave@example.com', password: '' }))
      .rejects.toMatch('no password')
  })
})

describe('createSessionToken', () => {
  test('throws if no password', async () => {
    const user = {
      name: 'David',
      email: 'david@example.com',
      password: 'davidboy28183',
    }
    await createUser(user)
    await expect(createSessionToken({ email: user.email, })).rejects.toMatch('no password')
    await expect(createSessionToken({ email: user.email, password: '' })).rejects.toMatch('no password')
  })

  test('throws if no email', async () => {
    const user = {
      name: 'David',
      email: 'david@example.com',
      password: 'davidboy28183',
    }
    await createUser(user)
    await expect(createSessionToken({ password: user.password })).rejects.toMatch('no email')
    await expect(createSessionToken({ email: '', password: user.password })).rejects.toMatch('no email')
  })

  test('throws if user doesnt exist', async () => {
    const user = {
      name: 'David',
      email: 'david@example.com',
      password: 'davidboy28183',
    }
    await expect(createSessionToken({ email: user.email, password: user.password })).rejects.toMatch('not found')
  })

  test('throws if password incorrect', async () => {
    const user = {
      name: 'David',
      email: 'david@example.com',
      password: 'davidboy28183',
    }
    const model = await createUser(user)
    await expect(createSessionToken({ email: user.email, password: 'wrongpassword' })).rejects.toMatch('wrong password')
  })

  test('returns a token and user if valid credentials', async () => {
    const user = {
      name: 'David',
      email: 'david@example.com',
      password: 'davidboy28183',
    }

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
    const user = {
      name: 'David',
      email: 'david@example.com',
      password: 'davidboy28183',
    }
    const model = await createUser(user)
    const expiredToken = jwt.sign({ id: model.id, email: model.email, }, SESSION_TOKEN_SECRET, { expiresIn: '2s' })
    await new Promise((res) => setTimeout(res, 3000))
    await expect(verifySessionToken(expiredToken)).rejects.toMatch('session token expired')
  })

  test('throws if payload missing id', async () => {
    const user = {
      name: 'David',
      email: 'david@example.com',
      password: 'davidboy28183',
    }
    const model = await createUser(user)
    const tokenWithoutId = jwt.sign({ email: model.email, }, SESSION_TOKEN_SECRET, { expiresIn: '7d' })
    await expect(verifySessionToken(tokenWithoutId)).rejects.toMatch('session token invalid')
    const tokenWithBlankId = jwt.sign({ id: '', email: model.email, }, SESSION_TOKEN_SECRET, { expiresIn: '7d' })
    await expect(verifySessionToken(tokenWithBlankId)).rejects.toMatch('session token invalid')
  })

  test('throws if payload id doesnt exist', async () => {
    const user = {
      name: 'David',
      email: 'david@example.com',
      password: 'davidboy28183',
    }

    const model = await createUser(user)
    const id = model.id
    await model.destroy()

    const tokenWithInvalidId = jwt.sign({ id, email: model.email, }, SESSION_TOKEN_SECRET, { expiresIn: '7d' })
    await expect(verifySessionToken(tokenWithInvalidId)).rejects.toMatch('session token invalid')
  })

  test('returns user if valid', async () => {
    const user = {
      name: 'David',
      email: 'david@example.com',
      password: 'davidboy28183',
    }
    const expected = await createUser(user)
    const [token] = await createSessionToken(user)
    const result = await verifySessionToken(token)

    expect(expected.toJSON()).toMatchObject(result.toJSON())
  })
})
