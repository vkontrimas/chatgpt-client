const { initializeDB } = require('./db_helper')
const { User } = require('db')

const { createUser } = require('../users')

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
