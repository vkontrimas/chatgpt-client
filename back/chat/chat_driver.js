const uuid = require('uuid')
const { User, Chat, Message } = require('../models')
const { Transform } = require('stream')

const { selectChatModel } = require('../llm')
const MessageCrypto = require('./crypto')
const { MESSAGE_KEY } = require('../config')

const crypto = new MessageCrypto(MESSAGE_KEY)

class ChatDriver {
  constructor({ ai, id, title }) {
    if (!ai) { throw 'Chat instance requires ai' }
    if (!id) { throw 'Chat instance requires id' }
    if (!title) { throw 'Chat instance requires title' }
    this.id = id
    this.ai = ai
    this.title = title
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

    const driver = new ChatDriver({
      ai,
      id: chat.id,
      title: chat.title,
    })
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
      title: 'Untitled Chat',
      UserId: user.id,
      aiModelName: modelName,
      aiModelConfig: JSON.stringify(ai.config),
    })

    return new ChatDriver({
      id: db.id,
      title: db.title,
      ai,
    })
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

    const { ciphertext, iv } = await crypto.encryptMessage(messageData.content)

    const message = await Message.create({
      id: uuid.v4(),
      ChatId: chat.id,
      role: messageData.role,
      content: ciphertext,
      iv: iv,
      status: 'done',
    })

    this.messages.push({
      id: message.id,
      role: message.role,
      content: messageData.content,
      status: message.status,
    })

    return {
      id: message.id,
      content: messageData.content,
      role: message.role,
      status: message.status,
    }
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
      iv: '',
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

      crypto.encryptMessage(currentContent)
        .then(({ ciphertext, iv }) => {
          // Also in DB
          Message.update({
            status: 'done',
            content: ciphertext,
            iv: iv,
          }, {
            where: {
              id: message.id,
            }
          })
        })

      // remove stream
      chatDriver.currentCompletionStream = null
    })
    stream.on('error', () => {
      chatDriver.messages[messageIndex].status = 'error'

      //Also in DB
      crypto.encryptMessage(currentContent || ' ')
        .then(({ciphertext, iv}) => {
          // Also in DB
          Message.update({
            status: 'error',
            content: ciphertext,
            iv: iv,
          }, {
            where: {
              id: message.id,
            }
          })
        })


      // remove stream
      chatDriver.currentCompletionStream = null
    })

    this.currentCompletionStream = stream
    return [{
      id: message.id,
      role: message.role,
      content: message.content,
      status: message.status,
    }, stream]
  }

  async fetchMessages() {
    if (this.destroyed) { throw 'chat destroyed' }

    const messages = await Message.findAll({
      where: {
        ChatId: this.id,
      },
      order: [['createdAt', 'ASC']],
    })

    const decrypted = await Promise.all(messages.map(message => {
      if (message.content && message.iv) {
        return crypto.decryptMessage(message.content, message.iv)
          .then((plaintext) => {
            return {
              id: message.id,
              content: plaintext,
              role: message.role,
              status: message.status
            }
          })
      }
      else {
        return new Promise(res => {
          res({
            id: message.id,
            content: message.content,
            role: message.role,
            status: message.status,
          })
        })
      }
    }))

    this.messages = decrypted
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

  async update(fields) {
    const model = await Chat.findByPk(this.id)
    const promise = model.update(fields)
    this.title = fields.title || this.title
    await promise
  }
}

module.exports = ChatDriver
