const uuid = require('uuid')
const { User, Chat, Message } = require('db')
const { Transform } = require('stream')

const { selectChatModel } = require('../llm')

class ChatDriver {
  constructor(ai, id) {
    if (!ai) { throw 'Chat instance requires ai' }
    if (!id) { throw 'Chat instance requires id' }
    this.id = id
    this.ai = ai
    this.messages = []
    this.currentCompletionStream = null
    this.destroyed = false
  }

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

  static async create(userId, modelName, modelConfig) {
    if (!userId) { throw 'missing user id' }
    if (!modelName) { throw 'missing chat model name' }

    const user = await User.findByPk(userId)
    if (!user) { throw 'invalid user id' }

    const ai = selectChatModel(modelName, modelConfig)

    const db = await Chat.create({
      id: uuid.v4(),
      title: null,
      UserId: user.id,
      aiModelName: modelName,
      aiModelConfig: JSON.stringify(ai.config),
    })

    return new ChatDriver(ai, db.id, [])
  }

  lastMessageHasError() {
    return this.messages.length !== 0 
           && this.messages[this.messages.length - 1].status === 'error'
  }

  lastMessageCompleting() {
    return this.messages.length !== 0 
           && this.messages[this.messages.length - 1].status === 'completing'
  }

  async postMessage(messageData) {
    if (this.destroyed) { throw 'chat destroyed' }
    if (!messageData) { throw 'missing message' }
    if (!messageData.role) { throw 'missing role' }
    if (!messageData.content) { throw 'missing content' }
    if (this.lastMessageCompleting()) { throw 'cannot post chat message while completion is running' }
    if (this.lastMessageHasError()) { throw 'cannot post message after a message with an error' }

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

  async completeCurrentThread() {
    if (this.destroyed) { throw 'chat destroyed' }
    if (!this.messages || this.messages.length === 0) { throw 'cannot complete chat with no messages' }
    if (this.lastMessageCompleting()) { throw 'cannot complete chat while another completion is running' }
    if (this.lastMessageHasError()) { throw 'cannot complete chat when last message has error' }

    const chat = await Chat.findByPk(this.id)
    if (!chat) { throw 'chat no longer exists' }

    const message = await Message.create({
      id: uuid.v4(),
      ChatId: chat.id,
      role: 'assistant',
      content: '',
      status: 'completing',
    })

    this.messages.push({
      id: message.id,
      role: message.role,
      content: message.content,
      status: message.status,
    })

    const stream = await this.ai.getCompletionStream(this.messages)

    // Capture some state
    const chatDriver = this
    const messageIndex = this.messages.length - 1
    let currentContent = ''
    stream.on('data', (chunk) => {
      currentContent = currentContent + chunk.delta
    })
    stream.on('end', () => {
      // Once done, update messages state
      chatDriver.messages[messageIndex].status = 'done'
      chatDriver.messages[messageIndex].content = currentContent

      // Also in DB
      Message.update({
        status: 'done',
        content: currentContent,
      }, {
        where: {
          id: message.id,
        }
      })

      // remove stream
      chatDriver.currentCompletionStream = null
    })
    stream.on('error', () => {
      chatDriver.messages[messageIndex].status = 'error'

      //Also in DB
      Message.update({
        status: 'error',
        content: currentContent,
      }, {
        where: {
          id: message.id,
        }
      })

      // remove stream
      chatDriver.currentCompletionStream = null
    })

    this.currentCompletionStream = stream
    return [message, stream]
  }

  async fetchMessages() {
    if (this.destroyed) { throw 'chat destroyed' }

    const messages = await Message.findAll({
      where: {
        ChatId: this.id,
      },
      orderBy: [['createdAt', 'DESC']],
    })

    this.messages = messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      role: msg.role,
      status: msg.status,
    }))
  }

  async destroy() {
    const chat = await Chat.findByPk(this.id)
    if (chat) {
      await chat.destroy()
    }

    this.destroyed = true
  }

  async clear() {
    if (this.lastMessageCompleting()) { throw 'cannot delete messages during chat completion' }
    await Message.destroy({
      where: {
        ChatId: this.id,
      }
    })
  }
}

module.exports = ChatDriver
