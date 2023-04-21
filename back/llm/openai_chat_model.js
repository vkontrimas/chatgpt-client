const { Transform } = require('stream')
const fetch = require('node-fetch')

const ChatCompletionModel = require('./chat_completion_model')
const { OPENAI_API_KEY } = require('../config')

class OpenAIChatModel extends ChatCompletionModel {
  constructor(config) {
    super()
    this.config = {
      model: 'gpt-3.5-turbo',
      ...config,
      stream: true, // IMPORTANT: stream must always be true
    }
  }

  async getCompletionStream(messages) {
    if (!messages) { throw 'completion requires at least one message' }

    const parseJSONDeltas = new Transform({
      transform(chunk, encoding, callback) {
        const messages = chunk.toString().split('\n\n')
        for (const message of messages) {
          const prefix = 'data: '
          if (message.startsWith(prefix)) {
            const withoutPrefix = message.substring(prefix.length)
            if (withoutPrefix !== '[DONE]') {
              const obj = JSON.parse(withoutPrefix)
              this.push(obj)
            }
          }
        }
        callback()
      },
      objectMode: true
    })

    const convertToNativeJSON = new Transform({
      transform(chunk, encoding, callback) {
        if (chunk?.choices && chunk.choices[0]?.delta?.content) {
          this.push({ status: 'completing', delta: chunk.choices[0].delta.content })
        }
        callback()
      },
      objectMode: true
    })

    messages = messages
      .filter(({ status }) => status === 'done')
      .map(({ role, content }) => ({ role, content }))

    const request = {
      ...this.config,
      messages
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(request),
    })

    return response.body
      .pipe(parseJSONDeltas)
      .pipe(convertToNativeJSON)
  }
}

module.exports = OpenAIChatModel
