class ChatInstance {
  constructor(id, aiModel, messages) {
    if (!id) { throw 'Chat instance requires id' }
    if (!aiModel) { throw 'Chat instance requires aiModel' }
    this.id = id
    this.aiModel = aiModel
    this.currentResponseStream = null
    this.messages = messages
  }

  static open(id, aiModel) {
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

module.exports = ChatInstance
