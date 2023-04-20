const express = require('express')
const { FAKE_WEBHOOK_SERVER_PORT } = require('./config')

const createFakeWebhookServer = (requestLogger) => {
  const fakeRequestApp = express()
  fakeRequestApp.use(express.json())
  fakeRequestApp.post('/test-hook', (request, response) => { 
    const status = requestLogger(request) 
    response.status(status || 200).end()
  })
  const port = FAKE_WEBHOOK_SERVER_PORT
  return fakeRequestApp.listen(port, () => { console.log(`Fake webhook server listening on ${port}`) })
}

module.exports = createFakeWebhookServer
