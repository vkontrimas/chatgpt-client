const registerRouter = require('express').Router()

const { idToBase64, idFromBase64 } = require('../base64_id')
const { 
  createUserWithRegistrationCode,
  getRegistrationCode
} = require('../registration')
const { RegistrationCode } = require('db')

registerRouter.get('/:base64Id', async (request, response) => {
  try {
    const code = await getRegistrationCode(idFromBase64(request.params.base64Id))
    if (code.remainingUses > 0) {
      return response.status(200).json({ status: 'valid' })
    } else {
      return response.status(200).json({ status: 'used' })
    }
  } catch (error) {
    switch (error) {
    case 'invalid base64 id':
    case 'invalid registration code':
      return response.status(404).json({ error: 'invalid registration url' })
    default:
        throw error
    }
  }
})

registerRouter.post('/:base64Id', async (request, response) => {
  try {
    const [user] = await createUserWithRegistrationCode({ 
      codeId: idFromBase64(request.params.base64Id),
      user: request.body,
    })
    response.status(201).json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    })
  } catch (error) {
    switch (error) {
    case 'invalid base64 id':
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
