const sequelize = require('../db/sequelize')
const User = require('../db/user')

const initialUsers = [
  {
    email: 'test@example.com',
  },
  {
    email: 'test2@example.com',
  },
]

const initializeDB = async () => {
  await sequelize.drop()
  await sequelize.sync()
  await Promise.all(initialUsers.map(user => User.create(user)))
}

const wipeDB = async () => {
  await sequelize.drop()
}

module.exports = {
  initialUsers,
  initializeDB,
  wipeDB,
}
