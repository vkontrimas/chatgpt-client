const fetch = require('node-fetch')
const chatRouter = require('express').Router()

const { OPENAI_API_KEY, } = require('../config')


const getCompletion = async (messages) => {
  const api = {}
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

  // OPENAI

  const messages = [
    {
      role: 'user',
      content: 'Hello! Please generate me a C++ hello world program!',
    },
  ]

  const openaiRequest = {
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'user',
        content: 'Hello! Please generate me a C++ hello world program!',
      },
    ],
    stream: true,
  }

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(openaiRequest)
  })

  try {
    for await (const chunk of resp.body) {
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
