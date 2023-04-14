const chatRouter = require('express').Router()

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

  response.end()
})

module.exports = chatRouter
