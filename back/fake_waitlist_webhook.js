const express = require('express')

const createFakeWebhookServer = (requestLogger) => {
  const fakeRequestApp = express()
  fakeRequestApp.use(express.json())
  fakeRequestApp.post('/waitlist', (request, response) => { 
    requestLogger(request) 
    response.status(200).end()
  })
  const port = 3004
  return fakeRequestApp.listen(port, () => { console.log(`Fake webhook server listening on ${port}`) })
}

module.exports = createFakeWebhookServer
