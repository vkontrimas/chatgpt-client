const { Configuration, OpenAIApi } = require('openai')

const {
  OPENAI_FAKE_MESSAGES,
  OPENAI_API_KEY,
  ENVIRONMENT
} = require('../config')

const getFakeResponse = () => ({
  data: {
    choices: [
      {
        message: {
          role: 'assistant',
          content: 'wassup',
        }
      },
    ],
  },
})

const createOpenAIApi = () => {
  if (!OPENAI_FAKE_MESSAGES
      && (ENVIRONMENT === 'production' || ENVIRONMENT === 'development')) {
    const config = new Configuration({
      apiKey: OPENAI_API_KEY,
    })
    return new OpenAIApi(config)
  }
  else {
    console.log('Running with fake AI messages.')
    return {
      createChatCompletion: async () => {
        return getFakeResponse()
      },
    }
  }
}

const api = createOpenAIApi()

const getCompletion = async (messages, userId) => {
  if (messages.length === 0) {
    throw 'cannot complete empty message list'
  }
  const completion = await api.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: messages.map(({ type, content }) => ({
      role: type,
      content,
    })),
    user: userId,
  })
  return completion.data
}

module.exports = {
  getCompletion
}
