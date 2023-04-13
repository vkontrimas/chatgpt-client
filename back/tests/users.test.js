const { initializeDB } = require('./db_helper')
const { User } = require('db')

const { createUser, verifyUser } = require('../users')

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

describe('verifyUser', () => {
  test('throws if no password', async () => {
    const user = {
      name: 'David',
      email: 'david@example.com',
      password: 'davidboy28183',
    }
    await createUser(user)
    await expect(verifyUser({ email: user.email, })).rejects.toMatch('no password')
    await expect(verifyUser({ email: user.email, password: '' })).rejects.toMatch('no password')
  })

  test('throws if no email', async () => {
    const user = {
      name: 'David',
      email: 'david@example.com',
      password: 'davidboy28183',
    }
    await createUser(user)
    await expect(verifyUser({ password: user.password })).rejects.toMatch('no email')
    await expect(verifyUser({ email: '', password: user.password })).rejects.toMatch('no email')
  })

  test('throws if user doesnt exist', async () => {
    const user = {
      name: 'David',
      email: 'david@example.com',
      password: 'davidboy28183',
    }
    await expect(verifyUser({ email: user.email, password: user.password })).rejects.toMatch('not found')
  })

  test('throws if password incorrect', async () => {
    const user = {
      name: 'David',
      email: 'david@example.com',
      password: 'davidboy28183',
    }
    const model = await createUser(user)
    await expect(verifyUser({ email: user.email, password: 'wrongpassword' })).rejects.toMatch('wrong password')
  })

  test('returns user if found', async () => {
    const user = {
      name: 'David',
      email: 'david@example.com',
      password: 'davidboy28183',
    }

    const expected = await createUser(user)
    const result = await verifyUser({ email: user.email, password: user.password })

    expect(result.toJSON()).toMatchObject(expected.toJSON())
  })
})

