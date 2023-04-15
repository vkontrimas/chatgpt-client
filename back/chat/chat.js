class Chat {
  constructor(id, aiModel) {
    if (!id) { throw 'Chat instance requires id' }
    if (!aiModel) { throw 'Chat instance requires aiModel' }
    this.id = id
    this.aiModel = aiModel

    this.currentResponseStream = null
    this.messages = []
  }

  /*
   * Loads initial chat message state from DB
   */
  async initializeFromDB() {

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
}

module.exports = Chat
