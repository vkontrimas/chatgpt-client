const usersRouter = require('express').Router()

const User = require('../db/user')

usersRouter.get('/', async (request, response) => {
  const users = await User.findAll()
  const result = users.map(user => ({
    id: user.id,
    email: user.email,
  }))
  console.log(users, result)
  response.status(200).json(result)
})

usersRouter.post('/', async (request, response) => {
  const newUser = request.body

  if (!newUser.email) {
    return response.status(400).json({ error: 'no email' })
  }
  if (!newUser.password) {
    return response.status(400).json({ error: 'no password' })
  }

  const passwordHash = 'todo'

  const user = await User.create({ email: newUser.email, passwordHash, })
  response.status(201).json({
    id: user.id,
    email: user.email,
  })
})

module.exports = usersRouter
