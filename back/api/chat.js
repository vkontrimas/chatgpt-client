const fetch = require('node-fetch')
const chatRouter = require('express').Router()

const OpenAIChatModel = require('../llm/openai_chat_model')

chatRouter.get('/test', async (request, response) => {
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

  const messages = [
    {
      role: 'user',
      content: 'Hello! Please generate me a C++ hello world program!',
    },
  ]

  const openai = new OpenAIChatModel()
  try {
    for await (const chunk of await openai.getCompletionStream(messages)) {
      const completionDeltas = chunk
        .toString()
        .split('\n\n')
        .filter(s => s.startsWith('data:'))
        .map(s => s.replace('data: ', ''))
        .filter(s => s !== '[DONE]')
        .map(s => JSON.parse(s))

      for (const delta of completionDeltas) {
        writeMessage(delta)
      }
    }
  } catch (error) {
    console.log('openai resp error', error)
  }

  response.end()
})

module.exports = chatRouter
