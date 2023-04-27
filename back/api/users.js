const usersRouter = require('express').Router()

const { User } = require('../models')
const { ENVIRONMENT } = require('../config')
const { idToBase64, idFromBase64 } = require('../base64_id')

if (ENVIRONMENT === 'development' || ENVIRONMENT === 'test') {
  usersRouter.get('/', async (request, response) => {
    const users = await User.findAll()
    const result = users.map(user => ({
      id: idToBase64(user.id),
      name: user.name,
      email: user.email,
    }))
    response.status(200).json(result)
  })
}

usersRouter.get('/:base64Id', async (request, response) => {
  const selectedUser = await User.findByPk(idFromBase64(request.params.base64Id))
  if (!selectedUser) {
    return response.status(404).json({ error: 'invalid user id' })
  }

  const user = await request.verifyUserSession()
  if (user.id !== selectedUser.id) { throw 'unauthorized' }

  const result = {
    id: idToBase64(user.id),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  }
  response.status(200).json(result)
})

module.exports = usersRouter
