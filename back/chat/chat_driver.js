const uuid = require('uuid')
const { User, Chat } = require('db')

const { selectChatModel } = require('../llm')

class ChatDriver {
  constructor(aiModel, db, messages) {
    if (!aiModel) { throw 'Chat instance requires aiModel' }
    if (!db) { throw 'Chat instance requires db' }
    this.aiModel = aiModel
    this.messages = messages || []
    this.db = db
    this.currentResponseStream = null
  }

  /*
   * Opens an existing chat
   */
  static async open(id) {}

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

    return new ChatDriver(aiModel, db, [])
  }

  /*
   * Adds a message to the current thread
   */
  async postMessage(message) {

  }

  /*
   * Completes existing thread with new AI response!
   * Returns completion stream.
   */
  async completeCurrentThread() {

  }

  /*
   * Returns current messages
   */
  async getMessages() {
  }
}

module.exports = ChatDriver
