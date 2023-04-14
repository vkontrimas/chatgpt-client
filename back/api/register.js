const registerRouter = require('express').Router()

const { idToBase64, idFromBase64 } = require('../base64_id')
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

registerRouter.post('/:base64Id', async (request, response) => {
  try {
    const [user] = await createUserWithRegistrationCode({ 
      codeId: idFromBase64(request.params.base64Id),
      user: request.body,
    })
    response.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
    })
  } catch (error) {
    switch (error) {
    case 'invalid id':
    case 'invalid registration code':
      return response.status(404).json({ error: 'invalid registration url' })
    case 'no registration code uses left':
      return response.status(403).json({ error: 'expired' })
    default:
        throw error
    }
  }
})

module.exports = registerRouter
