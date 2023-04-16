const { Readable } = require('stream')
const ChatCompletionModel = require('./chat_completion_model')

class PotatoDeltaStream extends Readable {
  constructor(config) {
    super({ objectMode: true })
    this.config = config
    this.potatoSent = 0

    if (this.config.throwImmediately) {
      throw 'throw immediately'
    }
  }

  _read() {
    if (this.potatoSent < this.config.deltaCount) {
      const mustThrow = this.config.throwOn === this.potatoSent + 1
      setTimeout(() => {
        if (mustThrow) {
          this.destroy('throw potato')
        }
        this.push({ status: 'completing', delta: 'potato' })
      }, this.config.delayMs)
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
      throwImmediately: false,
      throwOn: null,
      ...config
    }
  }

  async getCompletionStream(messages) {
    if (!messages || messages.length === 0) { throw 'no messages' }
    return new PotatoDeltaStream(this.config)
  }
}

module.exports = PotatoChatModel
