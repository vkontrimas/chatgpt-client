const uuid = require('uuid')
const { User, Chat, Message } = require('db')

const { selectChatModel } = require('../llm')

class ChatDriver {
  constructor(aiModel, id) {
    if (!aiModel) { throw 'Chat instance requires aiModel' }
    if (!id) { throw 'Chat instance requires id' }
    this.id = id
    this.aiModel = aiModel
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

    const driver = new ChatDriver(selectChatModel('potato'), chat.id)
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

    const db = await Chat.create({
      id: uuid.v4(),
      title: null,
      UserId: user.id,
    })

    const aiModel = selectChatModel(modelName)

    return new ChatDriver(aiModel, db.id, [])
  }

  /*
   * Adds a message to the current thread
   */
  async postMessage(userId, messageData) {
    if (this.destroyed) { throw 'chat destroyed' }
    if (!userId) { throw 'missing user id' }
    if (!messageData) { throw 'missing message' }
    if (!messageData.role) { throw 'missing role' }
    if (!messageData.content) { throw 'missing content' }

    const chat = await Chat.findByPk(this.id)
    if (!chat) { throw 'chat no longer exists' }

    if (chat.UserId !== userId) { throw 'unauthorized' }

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
  async completeCurrentThread(userId) {
    if (this.destroyed) { throw 'chat destroyed' }

  }

  /*
   * Returns current messages
   */
  async fetchMessages(userId) {
    if (this.destroyed) { throw 'chat destroyed' }
  }

  /*
   * Destroys the chat
   */
  async destroy(userId) {
    if (!userId) { throw 'missing user id' }

    const chat = await Chat.findByPk(this.id)
    if (chat) {
      if (chat.UserId !== userId) { throw 'unauthorized' }
      await chat.destroy()
    }

    this.destroyed = true
  }
}

module.exports = ChatDriver
