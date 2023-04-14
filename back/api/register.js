const registerRouter = require('express').Router()

const { idToBase64, idFromBase64 } = require('../base64_key')
const { createUserWithRegistrationCode } = require('../registration')
const { RegistrationCode } = require('db')

registerRouter.get('/:id', async (request, response) => {
  const code = await RegistrationCode.findByPk(request.params.id)
  if (!code) {
    return response.status(200).json({ status: 'expired' })
  }

  if (!code.remainingUses || code.remainingUses <= 0) {
    return response.status(200).json({ status: 'expired' })
  }

  response.status(200).json({ status: 'valid' })
})

registerRouter.post('/:base64Key', async (request, response) => {
  const [user] = await createUserWithRegistrationCode(
    idFromBase64(request.params.base64Key),
    request.body
  )
  response.status(201).json({
    id: user.id,
    name: user.name,
    email: user.email,
  })
})

module.exports = registerRouter
