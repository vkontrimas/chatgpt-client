const uuid = require('uuid')
const { User, Chat, Message } = require('db')

const { selectChatModel } = require('../llm')

class ChatDriver {
  constructor(ai, id) {
    if (!ai) { throw 'Chat instance requires ai' }
    if (!id) { throw 'Chat instance requires id' }
    this.id = id
    this.ai = ai
    this.messages = []
    this.currentResponseStream = null
    this.destroyed = false
  }

  /*
   * Opens an existing chat
   */
  static async open(userId, id) {
    if (!userId) { throw 'missing user id' }
    if (!id) { throw 'missing chat id' }

    const chat = await Chat.findByPk(id)
    if (!chat) { throw 'invalid chat id' }

    if (chat.UserId !== userId) { throw 'unauthorized' }

    const ai = selectChatModel(chat.aiModelName, chat.aiModelConfig && JSON.parse(chat.aiModelConfig))

    const driver = new ChatDriver(ai, chat.id)
    await driver.fetchMessages(userId)
    return driver
  }

  /*
   * Creates a new chat
   */
  static async create(userId, modelName) {
    if (!userId) { throw 'missing user id' }
    if (!modelName) { throw 'missing chat model name' }

    const user = await User.findByPk(userId)
    if (!user) { throw 'invalid user id' }

    const ai = selectChatModel(modelName)

    const db = await Chat.create({
      id: uuid.v4(),
      title: null,
      UserId: user.id,
      aiModelName: modelName,
    })

    return new ChatDriver(ai, db.id, [])
  }

  /*
   * Adds a message to the current thread
   */
  async postMessage(messageData) {
    if (this.destroyed) { throw 'chat destroyed' }
    if (!messageData) { throw 'missing message' }
    if (!messageData.role) { throw 'missing role' }
    if (!messageData.content) { throw 'missing content' }

    const chat = await Chat.findByPk(this.id)
    if (!chat) { throw 'chat no longer exists' }

    const message = await Message.create({
      id: uuid.v4(),
      ChatId: chat.id,
      role: messageData.role,
      content: messageData.content,
      status: 'done',
    })

    this.messages.push({
      id: message.id,
      role: message.role,
      content: message.content,
      status: message.status,
    })

    return message
  }

  /*
   * Completes existing thread with new AI response!
   * Returns completion stream.
   */
  async completeCurrentThread() {
    if (this.destroyed) { throw 'chat destroyed' }
  }

  /*
   * Returns current messages
   */
  async fetchMessages() {
    if (this.destroyed) { throw 'chat destroyed' }

    const messages = await Message.findAll({
      where: {
        ChatId: this.id,
      },
      orderBy: [['createdAt', 'ASC']],
    })

    this.messages = messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      role: msg.role,
      status: msg.status,
    }))
  }

  /*
   * Destroys the chat
   */
  async destroy() {
    const chat = await Chat.findByPk(this.id)
    if (chat) {
      await chat.destroy()
    }

    this.destroyed = true
  }
}

module.exports = ChatDriver
