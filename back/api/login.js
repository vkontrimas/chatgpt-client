const loginRouter = require('express').Router()

const { idToBase64 } = require('../base64_id')
const { createSessionToken } = require('../users')

loginRouter.post('/', async (request, response) => {
  const [token, model] = await createSessionToken(request.body)
  response.status(200).json({
    id: idToBase64(model.id),
    firstName: model.firstName,
    lastName: model.lastName,
    email: model.email,
    token,
  })
})

module.exports = loginRouter
