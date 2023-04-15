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

    const chat = await Chat.findByPk(chatDriver.id)
    expect(chat).toBeDefined()
    expect(chat).not.toBeNull()
  })
})

describe('open ChatDriver', () => {
  test('if no chat id, throws', async () => {
    const rob = await createUser({
      name: 'Robbo',
      email: 'robbo@example.com',
      password: 'to',
    })

    await expect(ChatDriver.open(rob)).rejects.toMatch('missing chat id')
    await expect(ChatDriver.open(rob, null)).rejects.toMatch('missing chat id')
    await expect(ChatDriver.open(rob, '')).rejects.toMatch('missing chat id')
  })

  test('if no user id, throws', async () => {
    const rob = await createUser({
      name: 'Robbo',
      email: 'robbo@example.com',
      password: 'to',
    })
    const chat = await ChatDriver.create(rob.id, 'potato')

    await expect(ChatDriver.open(undefined, chat.id)).rejects.toMatch('missing user id')
    await expect(ChatDriver.open(null, chat.id)).rejects.toMatch('missing user id')
    await expect(ChatDriver.open('', chat.id)).rejects.toMatch('missing user id')
  })

  test('if id doesnt exist, throws', async () => {
    const user = await createUser({
      name: 'Robbo',
      email: 'robbo@example.com',
      password: 'to',
    })

    const chat = await ChatDriver.create(user.id, 'potato')
    const id = chat.id
    await chat.destroy(user.id)

    await expect(ChatDriver.open(user.id, id)).rejects.toMatch('invalid chat id')
  })

  test('if chat doesnt belong to user, throws', async () => {
    const rob = await createUser({
      name: 'Robbo',
      email: 'robbo@example.com',
      password: 'to',
    })

    const eve = await createUser({
      name: 'Evelynn',
      email: 'eveeee@example.com',
      password: 'shhhhh'
    })

    const robsChat = await ChatDriver.create(rob.id, 'potato')

    await expect(ChatDriver.open(eve.id, robsChat.id)).rejects.toMatch('unauthorized')
  })

  test('if both ids exist and chat belongs to user, opens chat', async () => {
    const user = await createUser({
      name: 'Robbo',
      email: 'robbo@example.com',
      password: 'to',
    })

    const createdChat = await ChatDriver.create(user.id, 'potato')
    const openChat = await ChatDriver.open(user.id, createdChat.id)
    expect(openChat).toBeDefined()
    expect(openChat instanceof ChatDriver).toBe(true)
    expect(openChat.id).toBe(createdChat.id)
  })
})

describe('destroy ChatDriver', () => {
  test('if no user id, throws', async () => {
    const user = await createUser({
      name: 'Robbo',
      email: 'robbo@example.com',
      password: 'to',
    })
    const chat = await ChatDriver.create(user.id, 'potato')
    await expect(chat.destroy()).rejects.toMatch('missing user id')
    await expect(chat.destroy(null)).rejects.toMatch('missing user id')
    await expect(chat.destroy('')).rejects.toMatch('missing user id')
  })

  test('if chat doesnt belong to user, throws', async () => {
    const user = await createUser({
      name: 'Robbo',
      email: 'robbo@example.com',
      password: 'to',
    })

    const eve = await createUser({
      name: 'Evelynn',
      email: 'eveeee@example.com',
      password: 'shhhhh'
    })

    const chat = await ChatDriver.create(user.id, 'potato')

    await expect(chat.destroy(eve.id)).rejects.toMatch('unauthorized')
  })

  test('if chat no longer exists, succeeds', async () => {
    const user = await createUser({
      name: 'Robbo',
      email: 'robbo@example.com',
      password: 'to',
    })

    const chat = await ChatDriver.create(user.id, 'potato')
    await chat.destroy(user.id)

    await expect(chat.destroy(user.id)).resolves.toBeUndefined()
  })

  test('if chat exists and belongs to user, removes chat from db', async () => {
    const user = await createUser({
      name: 'Robbo',
      email: 'robbo@example.com',
      password: 'to',
    })
    const chat = await ChatDriver.create(user.id, 'potato')
    
    const chatsBefore = await Chat.findAll({ raw: true })
    await expect(chat.destroy(user.id)).resolves.toBeUndefined()
    const foundChat = await Chat.findByPk(chat.id)
    expect(foundChat).toBeNull()
    const chatsAfter = await Chat.findAll({ raw: true })
    expect(chatsAfter.length).toBe(chatsBefore.length - 1)
  })

  test('other operations on chat fail once destroyed', async () => {
    const user = await createUser({
      name: 'Robbo',
      email: 'robbo@example.com',
      password: 'to',
    })
    const chat = await ChatDriver.create(user.id, 'potato')

    await chat.destroy(user.id)

    await expect(chat.postMessage(user.id, 'foo')).rejects.toMatch('chat destroyed')
    await expect(chat.completeCurrentThread(user.id)).rejects.toMatch('chat destroyed')
    await expect(chat.fetchMessages(user.id)).rejects.toMatch('chat destroyed')
  })
})

describe('ChatDriver state', () => {
  test('placeholder', async () => {})
})
