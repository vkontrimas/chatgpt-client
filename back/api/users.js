const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()

const { User } = require('../db/db')
const { ENVIRONMENT, PASSWORD_HASH_ROUNDS } = require('../config')

if (ENVIRONMENT === 'development' || ENVIRONMENT === 'test') {
  usersRouter.get('/', async (request, response) => {
    const users = await User.findAll()
    const result = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
    }))
    response.status(200).json(result)
  })
}

module.exports = usersRouter
