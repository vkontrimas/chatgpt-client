const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const loginRouter = require('express').Router()

const { LOGIN_TOKEN_SECRET } = require('../config')
const { User } = require('db')
const { verifyUser } = require('../users')

const INVALID_CREDENTIALS_ERROR = 'incorrect credentials'

loginRouter.post('/', async (request, response) => {
  const model = await verifyUser(request.body)

  const tokenData = {
    id: model.id,
    email: model.email,
  }
  const token = jwt.sign(
    tokenData,
    LOGIN_TOKEN_SECRET,
    { expiresIn: 7 * 24 * 60 * 60 },
  )

  response.status(200).json({
    name: model.name,
    email: model.email,
    token,
  })
})

module.exports = loginRouter
