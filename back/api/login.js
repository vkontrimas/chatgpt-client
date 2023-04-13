const loginRouter = require('express').Router()

const { createSessionToken } = require('../users')

loginRouter.post('/', async (request, response) => {
  const [token, model] = await createSessionToken(request.body)
  response.status(200).json({
    name: model.name,
    email: model.email,
    token,
  })
})

module.exports = loginRouter
