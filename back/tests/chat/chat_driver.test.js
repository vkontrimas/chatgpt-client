const uuid = require('uuid')
const { Chat, Message } = require('db')
const { ChatDriver } = require('../../chat')
const { createUser } = require('../../users')
const { PotatoChatModel } = require('../../llm')
const streamToArray = require('../../stream_to_array')
const { createTestUser, loginTestUser } = require('../helper')

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
    const { user } = await createTestUser()

    await expect(ChatDriver.create(user.id)).rejects.toMatch('missing chat model name')
    await expect(ChatDriver.create(user.id, null)).rejects.toMatch('missing chat model name')
    await expect(ChatDriver.create(user.id, '')).rejects.toMatch('missing chat model name')
  })

  test('non existing userId throws', async () => {
    const { user } = await createTestUser()
    const id = user.id
    await user.destroy()

    await expect(ChatDriver.create(id, 'potato')).rejects.toMatch('invalid user id')
  })
})

describe('ChatDriver create', () => {
  test('valid user creates chat', async () => {
    const { user } = await createTestUser()

    const chatDriver = await ChatDriver.create(user.id, 'potato')
    expect(chatDriver).toBeDefined()
    expect(chatDriver instanceof ChatDriver).toBe(true)
  })

  test('created chat added to database', async () => {
    const { user } = await createTestUser()

    const chatsBefore = await Chat.findAll({ raw: true })
    const chatDriver = await ChatDriver.create(user.id, 'potato')
    const chatsAfter = await Chat.findAll({ raw: true })

    expect(chatsAfter.length).toBe(chatsBefore.length + 1)

    const chat = await Chat.findByPk(chatDriver.id)
    expect(chat).toBeDefined()
    expect(chat).not.toBeNull()
  })

  test('configures model', async () => {
    const { user } = await createTestUser()

    const chat = await ChatDriver.create(user.id, 'potato', { deltaCount: 4 })
    expect(chat.ai.config).toMatchObject({ deltaCount: 4 })
    
    const chatModel = await Chat.findByPk(chat.id)
    expect(chatModel.aiModelConfig).not.toBeNull()
    expect(JSON.parse(chatModel.aiModelConfig)).toMatchObject({ deltaCount: 4 })
  })
})

describe('ChatDriver open', () => {
  test('if no chat id, throws', async () => {
    const { user } = await createTestUser()

    await expect(ChatDriver.open(user.id)).rejects.toMatch('missing chat id')
    await expect(ChatDriver.open(user.id, null)).rejects.toMatch('missing chat id')
    await expect(ChatDriver.open(user.id, '')).rejects.toMatch('missing chat id')
  })

  test('if no user id, throws', async () => {
    const { user } = await createTestUser()
    const chat = await ChatDriver.create(user.id, 'potato')

    await expect(ChatDriver.open(undefined, chat.id)).rejects.toMatch('missing user id')
    await expect(ChatDriver.open(null, chat.id)).rejects.toMatch('missing user id')
    await expect(ChatDriver.open('', chat.id)).rejects.toMatch('missing user id')
  })

  test('if id doesnt exist, throws', async () => {
    const { user } = await createTestUser()

    const chat = await ChatDriver.create(user.id, 'potato')
    const id = chat.id
    await chat.destroy()

    await expect(ChatDriver.open(user.id, id)).rejects.toMatch('invalid chat id')
  })

  test('if chat doesnt belong to user, throws', async () => {
    const alice = await createTestUser()
    const eve = await createTestUser()

    const aliceChat = await ChatDriver.create(alice.user.id, 'potato')
    await expect(ChatDriver.open(eve.user.id, aliceChat.id)).rejects.toMatch('unauthorized')
  })

  test('if both ids exist and chat belongs to user, opens chat', async () => {
    const { user } = await createTestUser()

    const createdChat = await ChatDriver.create(user.id, 'potato')
    const openChat = await ChatDriver.open(user.id, createdChat.id)
    expect(openChat).toBeDefined()
    expect(openChat instanceof ChatDriver).toBe(true)
    expect(openChat.id).toBe(createdChat.id)
  })
})

describe('ChatDriver destroy', () => {
  test('if chat no longer exists, succeeds', async () => {
    const { user } = await createTestUser()

    const chat = await ChatDriver.create(user.id, 'potato')
    await chat.destroy()

    await expect(chat.destroy()).resolves.toBeUndefined()
  })

  test('if chat exists and belongs to user, removes chat from db', async () => {
    const { user } = await createTestUser()
    const chat = await ChatDriver.create(user.id, 'potato')
    
    const chatsBefore = await Chat.findAll({ raw: true })
    await expect(chat.destroy()).resolves.toBeUndefined()
    const foundChat = await Chat.findByPk(chat.id)
    expect(foundChat).toBeNull()
    const chatsAfter = await Chat.findAll({ raw: true })
    expect(chatsAfter.length).toBe(chatsBefore.length - 1)
  })
})

describe('ChatDriver postMessage', () => {
  test('if message missing, throw', async () => {
    const { user } = await createTestUser()
    const chat = await ChatDriver.create(user.id, 'potato')

    await expect(chat.postMessage()).rejects.toMatch('missing message')
    await expect(chat.postMessage(null)).rejects.toMatch('missing message')
  })

  test('message validation', async () => {
    const { user } = await createTestUser()
    const chat = await ChatDriver.create(user.id, 'potato')

    await expect(chat.postMessage({ role: 'user', })).rejects.toMatch('missing content')
    await expect(chat.postMessage({ content: 'foo' })).rejects.toMatch('missing role')
  })

  test('posts message', async () => {
    const { user } = await createTestUser()
    const chat = await ChatDriver.create(user.id, 'potato')

    const message = await chat.postMessage({
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

  test('fails if chat destroyed', async () => {
    const { user } = await createTestUser()
    const chat = await ChatDriver.create(user.id, 'potato')
    await chat.destroy()
    await expect(chat.postMessage('foo')).rejects.toMatch('chat destroyed')
  })
})

describe('ChatDriver fetchMessages', () => {
  test('fails if chat destroyed', async () => {
    const { user } = await createTestUser()
    const chat = await ChatDriver.create(user.id, 'potato')
    await chat.destroy()
    await expect(chat.fetchMessages()).rejects.toMatch('chat destroyed')
  })

  test('retrieves messages', async () => {
    const { user } = await createTestUser()
    const chat = await ChatDriver.create(user.id, 'potato')

    const expected = [
      {
        id: expect.stringMatching(/.*/),
        role: 'user',
        content: 'Hello!',
        ChatId: chat.id,
        status: 'done',
      },
      {
        id: expect.stringMatching(/.*/),
        role: 'assistant',
        content: 'Hi! How can I help you?',
        ChatId: chat.id,
        status: 'done',
      },
      {
        id: expect.stringMatching(/.*/),
        role: 'user',
        content: 'Hello!',
        ChatId: chat.id,
        status: 'done',
      },
    ]

    for (const msg of expected) {
      await chat.postMessage(msg)
    }

    await chat.fetchMessages()
    expect(chat.messages).toMatchObject(expected.map(({ id, role, content, status }) => ({ id, role, content, status})))
  })
})

describe('ChatDriver state', () => {
  test('no messages when chat created', async () => {
    const { user } = await createTestUser()

    const chat = await ChatDriver.create(user.id, 'potato')
    expect(chat.messages.length).toBe(0)

    await chat.fetchMessages()
    expect(chat.messages.length).toBe(0)
  })

  test('no messages when empty chat opened', async () => {
    const { user } = await createTestUser()

    const chat = await ChatDriver.create(user.id, 'potato')
    const openChat = await ChatDriver.open(user.id, chat.id)
    expect(openChat.messages.length).toBe(0)
  })

  test('remembers posted messages when chat opened', async () => {
    const { user } = await createTestUser()

    const chat = await ChatDriver.create(user.id, 'potato')

    const messages = [
      { role: 'user', content: 'Hello!' },
      { role: 'assistant', content: 'Hi! How may I help you?' },
      { role: 'user', content: 'Make me a coffee, please!' },
      { role: 'assistant', content: 'I\'m sorry, Dave. I\'m afraid I can\'t do that.' },
    ]
    for (const message of messages) {
      await chat.postMessage(message)
    }

    const openChat = await ChatDriver.open(user.id, chat.id)
    expect(chat.messages).toMatchObject(messages.map(({ role, content }) => ({
      role, content,
      id: expect.stringMatching(/.*/),
      status: 'done',
    })))
  })

  test('remembers ai model when opened', async () => {
    const { user } = await createTestUser()

    const chat = await ChatDriver.create(user.id, 'potato', { deltaCount: 4 })

    const openedChat = await ChatDriver.open(user.id, chat.id)

    expect(openedChat.ai instanceof PotatoChatModel).toBe(true)
    expect(openedChat.ai.config).toMatchObject({ deltaCount: 4 })
  })
})


describe('ChatDriver completeCurrentThread', () => {
  test('throws if chat destroyed', async () => {
    const { user } = await createTestUser()

    const chat = await ChatDriver.create(user.id, 'potato')
    await chat.postMessage({ role: 'user', content: 'Hello!' })
    await chat.destroy()
    await expect(chat.completeCurrentThread()).rejects.toMatch('chat destroyed')
  })

  test('throws if no messages', async () => {
    const { user } = await createTestUser()

    const chat = await ChatDriver.create(user.id, 'potato')
    await expect(chat.completeCurrentThread()).rejects.toMatch('cannot complete chat with no messages')
  })

  test('returns delta stream if successful', async () => {
    const { user } = await createTestUser()

    const chat = await ChatDriver.create(user.id, 'potato', { deltaCount: 4 })
    await chat.postMessage({ role: 'user', content: 'hello!' })
    const [message, stream] = await chat.completeCurrentThread()
    const result = await streamToArray(stream)
    expect(result).toMatchObject(new Array(4).fill({ delta: 'potato' }))
  })

  test('adds in progress message during completion', async () => {
    const { user } = await createTestUser()

    const chat = await ChatDriver.create(user.id, 'potato', { deltaCount: 4, delayMs: 500 })
    await chat.postMessage({ role: 'user', content: 'hello!' })
    const [message, stream] = await chat.completeCurrentThread()

    const expected = {
      id: expect.stringMatching(/.*/),
      role: 'assistant',
      content: '',
      status: 'completing',
    }
    expect(message).toMatchObject(expected)
    expect(chat.messages[chat.messages.length - 1]).toMatchObject(expected)
    expect(await Message.findByPk(message.id, { raw: true })).toMatchObject({
      ...expected,
      ChatId: chat.id,
    })

    await streamToArray(stream)
  })

  test('adds in done message after completion', async () => {
    const { user } = await createTestUser()

    const chat = await ChatDriver.create(user.id, 'potato', { deltaCount: 4, delayMs: 500 })
    await chat.postMessage({ role: 'user', content: 'hello!' })
    const [message, stream] = await chat.completeCurrentThread()
    await streamToArray(stream)

    const result = chat.messages[chat.messages.length - 1]
    const expected = {
      id: expect.stringMatching(/.*/),
      role: 'assistant',
      content: new Array(4).fill('potato').join(''),
      status: 'done',
    }
    expect(result).toMatchObject(expected)

    // HACK: we write message async :/
    await new Promise(res => setTimeout(res, 100))

    expect(await Message.findByPk(message.id, { raw: true })).toMatchObject({
      ...expected,
      ChatId: chat.id,
    })
  })

  test('cannot post message while completion is running', async () => {
    const { user } = await createTestUser()

    const chat = await ChatDriver.create(user.id, 'potato', { deltaCount: 3, delayMs: 1000 })
    await chat.postMessage({ role: 'user', content: 'hello!' })
    const [message, stream] = await chat.completeCurrentThread()
    await expect(chat.postMessage({ role: 'user', content: 'are you completin\'?' }))
      .rejects.toMatch('cannot post chat message while completion is running')
    await streamToArray(stream)
  })

  test('cannot complete while completion is already running', async () => {
    const { user } = await createTestUser()

    const chat = await ChatDriver.create(user.id, 'potato', { deltaCount: 3, delayMs: 1000 })
    await chat.postMessage({ role: 'user', content: 'hello!' })
    const [message, stream] = await chat.completeCurrentThread()
    await expect(chat.completeCurrentThread())
      .rejects.toMatch('cannot complete chat while another completion is running')
    await streamToArray(stream)
  })

  test('can retrieve stream while completion is running', async () => {
    const { user } = await createTestUser()

    const chat = await ChatDriver.create(user.id, 'potato', { deltaCount: 3, delayMs: 1000 })
    await chat.postMessage({ role: 'user', content: 'hello!' })
    expect(chat.currentCompletionStream).toBeNull()
    const [message, stream] = await chat.completeCurrentThread()
    expect(chat.currentCompletionStream).toBeDefined()
    expect(chat.currentCompletionStream).not.toBeNull()
    await streamToArray(stream)
    expect(chat.currentCompletionStream).toBeNull()
  })

  test('opened chat knows a message is being completed', async () => {
    const { user } = await createTestUser()

    const chat = await ChatDriver.create(user.id, 'potato', { deltaCount: 3, delayMs: 1000 })
    await chat.postMessage({ role: 'user', content: 'hello!' })

    const [message, stream] = await chat.completeCurrentThread()

    const openChat = await ChatDriver.open(user.id, chat.id)
    expect(openChat.messages[openChat.messages.length - 1]).toMatchObject({
      id: expect.stringMatching(/.*/),
      role: 'assistant',
      content: '',
      status: 'completing',
    })
    await expect(openChat.postMessage({ role: 'user', content: 'bar' }))
      .rejects.toMatch('cannot post chat message while completion is running')
    await expect(openChat.completeCurrentThread())
      .rejects.toMatch('cannot complete chat while another completion is running')
    await streamToArray(stream)
  })

  test('if fails during completion, sets last message status to error', async () => {
    const { user } = await createTestUser()

    const chat = await ChatDriver.create(user.id, 'potato', { deltaCount: 4, throwOn: 2 })
    await chat.postMessage({ role: 'user', content: 'hello!' })
    const [message, stream] = await chat.completeCurrentThread()
    await expect(streamToArray(stream)).rejects.toMatch('throw potato')
    expect(chat.messages[chat.messages.length - 1].status).toBe('error')
    // HACK: we write Message async
    await new Promise(res => setTimeout(res, 100))
    const dbMessage = await Message.findByPk(message.id)
    expect(dbMessage.status).toBe('error')
  })

  test('cannot post message after message with error status', async () => {
    const { user } = await createTestUser()

    const chat = await ChatDriver.create(user.id, 'potato', { deltaCount: 4, throwOn: 2 })
    await chat.postMessage({ role: 'user', content: 'hello!' })
    const [message, stream] = await chat.completeCurrentThread()
    await expect(streamToArray(stream)).rejects.toMatch('throw potato')
    await expect(chat.postMessage({ role: 'user', content: 'henlo' }))
      .rejects.toMatch('cannot post message after a message with an error')
  })

  test('cannot complete after message with error status', async () => {
    const { user } = await createTestUser()

    const chat = await ChatDriver.create(user.id, 'potato', { deltaCount: 4, throwOn: 2 })
    await chat.postMessage({ role: 'user', content: 'hello!' })
    const [message, stream] = await chat.completeCurrentThread()
    await expect(streamToArray(stream)).rejects.toMatch('throw potato')
    await expect(chat.completeCurrentThread())
      .rejects.toMatch('cannot complete chat when last message has error')
  })


  test('re-throws if ai model immediately throws', async () => {
    const { user } = await createTestUser()

    const chat = await ChatDriver.create(user.id, 'potato', { deltaCount: 3, throwImmediately: true })
    await chat.postMessage({ role: 'user', content: 'hello' })
    await expect(chat.completeCurrentThread()).rejects.toMatch('throw immediately')
  })

  test('re-throws if ai model immediately throws', async () => {
    const { user } = await createTestUser()

    const { id } = await ChatDriver.create(user.id, 'potato', { deltaCount: 3, throwImmediately: true })
    const chat = await ChatDriver.open(user.id, id)
    await chat.postMessage({ role: 'user', content: 'hello' })
    await expect(chat.completeCurrentThread()).rejects.toMatch('throw immediately')
  })
})

describe('ChatDriver clear', () => {
  test('deletes all messages', async () => {
    const [_, user] = await loginTestUser()
    const chat = await ChatDriver.create(user.id, 'potato')

    const messages = [
      { role: "user", content: "hello!" },
      { role: "assistant", content: "hello!" },
      { role: "user", content: "hello!" },
      { role: "assistant", content: "hello!" },
      { role: "user", content: "hello!" },
    ]
    for (const message of messages) {
      await chat.postMessage(message)
    } 

    const messageCountBefore = await Message.count({ where: { ChatId: chat.id } })
    expect(messageCountBefore).toBe(5)

    await chat.clear()

    const messageCountAfter = await Message.count({ where: { ChatId: chat.id } })
    expect(messageCountAfter).toBe(0)
  })

  test('succeeds if no messages to delete', async () => {
    const [_, user] = await loginTestUser()
    const chat = await ChatDriver.create(user.id, 'potato')


    const messageCountBefore = await Message.count({ where: { ChatId: chat.id } })
    expect(messageCountBefore).toBe(0)

    await chat.clear()

    const messageCountAfter = await Message.count({ where: { ChatId: chat.id } })
    expect(messageCountAfter).toBe(0)
  })

  test('throws if in the middle of completion', async () => {
    const [_, user] = await loginTestUser()
    const chat = await ChatDriver.create(user.id, 'potato', { deltaCount: 3, delayMs: 300 })
    await chat.postMessage({ role: 'user', content: 'hello' })
    const [message, stream] = await chat.completeCurrentThread()
    await expect(chat.clear()).rejects.toMatch('cannot delete messages during chat completion')
    await streamToArray(stream)
  })
})
