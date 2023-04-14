const chatRouter = require('express').Router()

const { Configuration, OpenAIApi } = require('openai')
const { OPENAI_API_KEY, } = require('../config')

const config = new Configuration({
  apiKey: OPENAI_API_KEY,
})
const api = new OpenAIApi(config)

const getCompletion = async (messages) => {
  const completion = await api.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: messages,
    user: 'testing',
    stream: true,
  })
  return completion
}


chatRouter.get('/test', async (request, response) => {
  response.write('{ "header": 0 }')

  const writeMessage = (msg) => new Promise(resolve => {
    console.log('writing')

    response.write(JSON.stringify(msg), 'utf8', () => {
      console.log('flushed!')
      resolve()
    })
  })

  await writeMessage({
    userId: 'gasdgasdhjkgasdh',
    content: 'Hello! Please generate a hello world program!',
    role: 'user',
    index: 0,
  })

  const withDelay = (func) => new Promise(resolve => {
    const latency = 100 + 200 * Math.random()
    console.log('delay:', latency)
    setTimeout(() => {
      func()
      resolve()
    }, latency)
  })

  await withDelay(() => {})
  await withDelay(() => {})
  await withDelay(() => writeMessage({
    userId: 'gasdgasdhjkgasdh',
    content: 'Hello wh',
    role: 'assistant',
    index: 1,
  }))
  await withDelay(() => writeMessage({
    userId: 'gasdgasdhjkgasdh',
    content: 'aat langua',
    role: 'assistant',
    index: 1,
  }))
  await withDelay(() => writeMessage({
    userId: 'gasdgasdhjkgasdh',
    content: 'ge would you like it in?',
    role: 'assistant',
    index: 1,
  }))

  const messages = [
    {
      role: 'user',
      content: 'Hello! Please generate me a C++ hello world program!',
    },
  ]

  const completion = await getCompletion(messages)
  completion.data = []
  console.log(completion)

  response.end()
})

module.exports = chatRouter
