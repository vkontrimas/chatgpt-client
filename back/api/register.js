const bcrypt = require('bcrypt')
const registerRouter = require('express').Router()

const { PASSWORD_HASH_ROUNDS } = require('../config')
const { sequelize, User, RegistrationCode } = require('db')

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

registerRouter.post('/:id', async (request, response) => {
  await sequelize.transaction(async (transaction) => {
    const code = await RegistrationCode.findByPk(request.params.id, { transaction })
    if (!code) {
      return response.status(403).json({ error: 'registration expired' })
    }
    if (code.remainingUses <= 0) {
      return response.status(403).json({ error: 'registration expired' })
    }

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
      }, { transaction })

      await code.decrement('remainingUses', { transaction })

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
})

module.exports = registerRouter
