const sequelize = require('../db/sequelize')
const User = require('../db/user')

const modelUser = () => ({
  email: 'eve@example.com',
  password: 'topsekret',
})

const initialUsers = [
  {
    email: 'bob@example.com',
  },
  {
    email: 'alice@example.com',
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
  modelUser,
  initialUsers,
  initializeDB,
  wipeDB,
}
