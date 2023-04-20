const fetch = require('node-fetch')
const waitlistRouter = require('express').Router()

const { WAITLIST_SIGNUP_WEBHOOK } = require('../config')

waitlistRouter.post('/', async (request, response) => {
  const user = request.body
  if (!user.name) { throw 'no name' }
  if (!user.email) { throw 'no email' }
  if (!/.+@.+\..+/.test(user.email)) { throw 'invalid email' }

  const webhookResponse = await fetch(WAITLIST_SIGNUP_WEBHOOK, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: user.name, email: user.email }),
  })

  if (webhookResponse.status === 200) {
    return response.status(200).end()
  } else {
    return response.status(504).end()
  }
})

module.exports = waitlistRouter
