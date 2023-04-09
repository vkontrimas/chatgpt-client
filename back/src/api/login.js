const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const loginRouter = require('express').Router()

const { LOGIN_TOKEN_SECRET } = require('../config')
const User = require('../db/user')

const INVALID_CREDENTIALS_ERROR = 'incorrect credentials'

loginRouter.post('/', async (request, response) => {
  const credentials = request.body

  if (!credentials.email) {
    return response.status(400).json({ error: 'no email' })
  }

  if (!credentials.password) {
    return response.status(400).json({ error: 'no password' })
  }

  const queryResults = await User.findAll({
    attributes: [ 'id', 'passwordHash' ],
    where: { email: credentials.email, },
  })

  if (queryResults.length === 0) {
    return response.status(401).json({ error: INVALID_CREDENTIALS_ERROR })
  }
  else if (queryResults > 1) {
    throw 'more than one user fetched via email' 
  }

  const [user] = queryResults
  const passwordCorrect = await bcrypt.compare(credentials.password, user.passwordHash)
  if (!passwordCorrect) {
    return response.status(401).json({ error: INVALID_CREDENTIALS_ERROR })
  }

  const tokenData = {
    id: user.id,
    email: credentials.email,
  }
  const token = jwt.sign(
    tokenData,
    LOGIN_TOKEN_SECRET,
    { expiresIn: 60 * 60 },
  )

  response.status(200).json({ email: credentials.email, token })
})

module.exports = loginRouter
