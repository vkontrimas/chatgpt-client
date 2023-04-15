const { Chat } = require('db')
const { ChatDriver } = require('../../chat')
const { createUser } = require('../../users')
const { initializeDB } = require('../db_helper')

beforeEach(async () => {
  await initializeDB()
})

describe('create ChatDriver', () => {
  let chatsBefore = []

  beforeEach(async () => {
    chatsBefore = await Chat.findAll({ raw: true })
  })

  afterEach(async () => {
    const chatsAfter = await Chat.findAll({ raw: true })
    expect(chatsAfter).toMatchObject(chatsBefore)
  })

  test('if no userId, throws', async () => {
    await expect(ChatDriver.create()).rejects.toMatch('missing user id')
    await expect(ChatDriver.create(null)).rejects.toMatch('missing user id')
    await expect(ChatDriver.create('')).rejects.toMatch('missing user id')
  })

  test('if no modelName, throws', async () => {
    const user = await createUser({
      name: 'Robbo',
      email: 'robbo@example.com',
      password: 'to',
    })
    await expect(ChatDriver.create(user.id)).rejects.toMatch('missing chat model name')
    await expect(ChatDriver.create(user.id, null)).rejects.toMatch('missing chat model name')
    await expect(ChatDriver.create(user.id, '')).rejects.toMatch('missing chat model name')
  })

  test('non existing userId throws', async () => {
    const user = await createUser({
      name: 'Robbo',
      email: 'robbo@example.com',
      password: 'to',
    })
    const id = user.id
    await user.destroy()

    await expect(ChatDriver.create(id, 'potato')).rejects.toMatch('invalid user id')
  })
})

describe('create ChatDriver', () => {
  test('valid user creates chat', async () => {
    const user = await createUser({
      name: 'Robbo',
      email: 'robbo@example.com',
      password: 'to',
    })

    const chatDriver = await ChatDriver.create(user.id, 'potato')
    expect(chatDriver).toBeDefined()
    expect(chatDriver instanceof ChatDriver).toBe(true)
  })

  test('created chat added to database', async () => {
    const user = await createUser({
      name: 'Robbo',
      email: 'robbo@example.com',
      password: 'to',
    })

    const chatsBefore = await Chat.findAll({ raw: true })
    const chatDriver = await ChatDriver.create(user.id, 'potato')
    const chatsAfter = await Chat.findAll({ raw: true })

    expect(chatsAfter.length).toBe(chatsBefore.length + 1)
    expect(chatsAfter).toContainEqual(chatDriver.db.toJSON())
  })
})
