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

    const request = {
      ...this.config,
      messages: messages.map(({ role, content }) => ({ role, content })),
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
  }
}

module.exports = OpenAIChatModel
