const bcrypt = require('bcrypt')
const uuid = require('uuid')
const { User } = require('db')

const PASSWORD_SALT_ROUNDS = 10

const createUser = async (user) => {
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
    })
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

module.exports = {
  createUser,
}
