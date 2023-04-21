const fetch = require('node-fetch')
const waitlistRouter = require('express').Router()

const { WAITLIST_SIGNUP_WEBHOOK } = require('../config')

waitlistRouter.post('/', async (request, response) => {
  const body = request.body
  if (!body.name) { throw 'no name' }
  if (!body.email) { throw 'no email' }
  if (!/.+@.+\..+/.test(body.email)) { throw 'invalid email' }

  const webhookResponse = await fetch(WAITLIST_SIGNUP_WEBHOOK, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      name: body.name,
      email: body.email,
      registrationCode: body.registrationCode || 'none',
    }),
  })

  if (webhookResponse.status === 200) {
    return response.status(200).end()
  } else {
    return response.status(504).end()
  }
})

module.exports = waitlistRouter
