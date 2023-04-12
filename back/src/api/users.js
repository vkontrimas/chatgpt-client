const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()

const { User } = require('../db/db')
const { PASSWORD_HASH_ROUNDS } = require('../config')

usersRouter.get('/', async (request, response) => {
  const users = await User.findAll()
  const result = users.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
  }))
  response.status(200).json(result)
})

usersRouter.post('/', async (request, response) => {
  const newUser = request.body

  if (!newUser.name) {
    return response.status(400).json({ error: 'no name' })
  }
  if (!newUser.email) {
    return response.status(400).json({ error: 'no email' })
  }
  if (!newUser.password) {
    return response.status(400).json({ error: 'no password' })
  }

  const passwordHash = await bcrypt.hash(newUser.password, PASSWORD_HASH_ROUNDS)

  try {
    const user = await User.create({
      name: newUser.name,
      email: newUser.email,
      passwordHash,
    })
    response.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
    })
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      response.status(400).json({ error: 'email in use', })
    } else {
      throw error
    }
  }
})

module.exports = usersRouter
