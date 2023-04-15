const { Readable } = require('stream')
const ChatCompletionModel = require('./chat_completion_model')

class PotatoDeltaStream extends Readable {
  constructor(count) {
    super({ objectMode: true })
    this.potatoCount = count || 1
    this.potatoSent = 0
  }

  _read() {
    if (this.potatoSent < this.potatoCount) {
      this.push({ delta: 'potato' })
      ++this.potatoSent
    } else {
      this.push(null)
    }
  }
}

class PotatoChatModel extends ChatCompletionModel {
  constructor(config) {
    super()
    this.config = {
      deltaCount: 1,
      ...config
    }
  }

  async getCompletionStream(messages) {
    if (!messages || messages.length === 0) { throw 'no messages' }
    return new PotatoDeltaStream(this.config.deltaCount)
  }
}

module.exports = PotatoChatModel
