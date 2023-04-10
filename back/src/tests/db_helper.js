const bcrypt = require('bcrypt')

const { sequelize, User } = require('../db/db')
const { PASSWORD_HASH_ROUNDS } = require('../config')

const modelUser = () => ({
  email: 'eve@example.com',
  password: 'topsekret',
})

const initialUsers = [
  {
    email: 'bob@example.com',
    password: 'sekret',
  },
  {
    email: 'alice@example.com',
    password: 'password123',
  },
]

const fetchAllUsers = async () => {
  return await User.findAll()
}

const initializeDB = async () => {
  await sequelize.drop()
  await sequelize.sync()
  await Promise.all(initialUsers.map(async (user) => {
    const newUser = {
      email: user.email,
      passwordHash: await bcrypt.hash(user.password, PASSWORD_HASH_ROUNDS),
    }
    await User.create(newUser)
  }))
}

const wipeDB = async () => {
  await sequelize.drop()
}

module.exports = {
  modelUser,
  initialUsers,
  fetchAllUsers,
  initializeDB,
  wipeDB,
}
