const { PORT, ENVIRONMENT } = require('./config')

if (ENVIRONMENT !== 'production') {
  const logWebhookRequest = (request) => {
    console.log('waitlist request:', request.body.name, request.body.email)
  }
  require('./fake_webhook_server')(logWebhookRequest)
}

const app = require('./app')
app.listen(PORT, () => { console.log(`Server listening on ${PORT}`)})
