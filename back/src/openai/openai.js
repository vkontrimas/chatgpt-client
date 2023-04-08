const { Configuration, OpenAIApi } = require('openai')

const { OPENAI_API_KEY, ENVIRONMENT } = require('../config')

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
  // if (ENVIRONMENT === 'production' || ENVIRONMENT === 'development') {
  if (false) {
    return new OpenAIApi(
      new Configuration({
        apiKey: OPENAI_API_KEY,
      })
    )
  }
  else {
    return {
      createChatCompletion: async () => {
        return getFakeResponse()
      },
    }
  }
}

const api = createOpenAIApi()

const getCompletion = async (messages) => {
  const completion = await api.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: messages.map(({ user, content }) => ({
      role: user,
      content,
    }))
  })
  return completion.data
}

module.exports = {
  getCompletion
}
