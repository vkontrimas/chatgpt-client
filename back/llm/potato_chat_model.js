const { Readable } = require('stream')
const ChatCompletionModel = require('./chat_completion_model')

class PotatoDeltaStream extends Readable {
  constructor(count, delayMs) {
    super({ objectMode: true })
    this.potatoCount = count || 1
    this.delayMs = delayMs || 0
    this.potatoSent = 0
  }

  _read() {
    if (this.potatoSent < this.potatoCount) {
      setTimeout(() => this.push({ delta: 'potato' }), this.delayMs)
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
      delayMs: 0,
      ...config
    }
  }

  async getCompletionStream(messages) {
    if (!messages || messages.length === 0) { throw 'no messages' }
    return new PotatoDeltaStream(this.config.deltaCount, this.config.delayMs)
  }
}

module.exports = PotatoChatModel
