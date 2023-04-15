const Chat = require('./chat')

class ChatManager {
  async getChat(id) {
    const chat = new Chat(id, aiModel)
    await chat.initializeFromDB()
    return chat
  }
}

module.exports = ChatManager
