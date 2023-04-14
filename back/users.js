const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const { User } = require('db')

const { PASSWORD_SALT_ROUNDS, SESSION_TOKEN_SECRET } = require('./config')

const createUser = async (user, sequelizeOptions) => {
  if (!user) { throw 'missing user' } 
  if (!user.email) { throw 'no email' }
  if (!user.password) { throw 'no password' }
  if (!user.name) { throw 'no name' }

  const { email, password, name } = user
  const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS)

  try {
    const id = uuid.v4()
    return await User.create({
      id,
      name,
      email,
      passwordHash,
    }, sequelizeOptions)
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      error.errors.forEach(e => {
        if (e.path === 'email') {
          throw 'email collision'
        }
      })
    }
    throw error
  }
}

const createSessionToken = async (user) => {
  if (!user.email) { throw 'no email' }
  if (!user.password) { throw 'no password' }

  const model = await User.findOne({
    where: {
      email: user.email,
    }
  })

  if (!model) { throw 'user not found' }

  const passwordCorrect = await bcrypt.compare(user.password, model.passwordHash)
  if (!passwordCorrect) { throw 'wrong password' }

  const payload = {
    email: model.email,
    id: model.id,
  }
  const token = jwt.sign(payload, SESSION_TOKEN_SECRET, { expiresIn: '2d' })

  return [token, model]
}

const verifySessionToken = async (token) => {
  if (!token) { throw 'session token missing' }

  try {
    const payload = jwt.verify(token, SESSION_TOKEN_SECRET)
    if (!payload.id) { throw 'session token invalid' }
    const model = await User.findByPk(payload.id) 
    if (!model) { throw 'session token invalid' }
    return model
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw 'session token expired'
    }
    if (error.name === 'JsonWebTokenError') {
      throw 'session token invalid'
    }

    throw error
  }
}

module.exports = {
  createUser,
  createSessionToken,
  verifySessionToken,
}
