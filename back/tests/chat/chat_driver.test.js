const { Chat, Message } = require('db')
const { ChatDriver } = require('../../chat')
const { createUser } = require('../../users')
const { initializeDB } = require('../db_helper')

beforeEach(async () => {
  await initializeDB()
})

describe('ChatDriver create', () => {
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

describe('ChatDriver create', () => {
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

describe('ChatDriver open', () => {
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

describe('ChatDriver destroy', () => {
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

describe('ChatDriver postMessage', () => {
  test('if user id missing, throw', async () => {
    const user = await createUser({
      name: 'Robbo',
      email: 'robbo@example.com',
      password: 'to',
    })
    const chat = await ChatDriver.create(user.id, 'potato')

    const message = {
      role: 'user',
      content: 'message',
    }

    await expect(chat.postMessage(undefined, message)).rejects.toMatch('missing user id')
    await expect(chat.postMessage(null, message)).rejects.toMatch('missing user id')
    await expect(chat.postMessage('', message)).rejects.toMatch('missing user id')
  })

  test('if message missing, throw', async () => {
    const user = await createUser({
      name: 'Robbo',
      email: 'robbo@example.com',
      password: 'to',
    })
    const chat = await ChatDriver.create(user.id, 'potato')

    await expect(chat.postMessage(user.id)).rejects.toMatch('missing message')
    await expect(chat.postMessage(user.id, null)).rejects.toMatch('missing message')
  })

  test('message validation', async () => {
    const user = await createUser({
      name: 'Robbo',
      email: 'robbo@example.com',
      password: 'to',
    })
    const chat = await ChatDriver.create(user.id, 'potato')

    await expect(chat.postMessage(user.id, { role: 'user', })).rejects.toMatch('missing content')
    await expect(chat.postMessage(user.id, { content: 'foo' })).rejects.toMatch('missing role')
  })

  test('cannot post to other user\'s chats', async () => {
    const user = await createUser({
      name: 'Robbo',
      email: 'robbo@example.com',
      password: 'to',
    })
    const chat = await ChatDriver.create(user.id, 'potato')

    const eve = await createUser({
      name: 'Evelynn',
      email: 'eveeee@example.com',
      password: 'shhhhh'
    })

    await expect(chat.postMessage(eve.id, { role: 'user', content: 'I\'m in!' }))
      .rejects.toMatch('unauthorized')
  })

  test('posts message', async () => {
    const user = await createUser({
      name: 'Robbo',
      email: 'robbo@example.com',
      password: 'to',
    })
    const chat = await ChatDriver.create(user.id, 'potato')

    const message = await chat.postMessage(user.id, {
      role: 'user',
      content: 'hello world!',
    })
    expect(message).toBeDefined()
    expect(message.toJSON()).toMatchObject({
      id: expect.stringMatching(/.*/),
      ChatId: chat.id,
      role: 'user',
      content: 'hello world!',
      status: 'done',
    })

    expect(chat.messages[chat.messages.length - 1])
      .toMatchObject({
        id: message.id,
        role: 'user',
        content: 'hello world!',
        status: 'done',
      })

    expect(await Message.findByPk(message.id, { raw: true }))
      .toMatchObject(message.toJSON())
  })
})

describe('ChatDriver state', () => {
  test('placeholder', async () => {})
})
