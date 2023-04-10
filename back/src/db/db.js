const { Sequelize } = require('sequelize')
const { DB_PATH, DB_LOG } = require('../config')

const initializeUser = require('./user')
const { initializeMessage, MessageType } = require('./message')

const initializeDb = () => {
  const sequelize = new Sequelize(DB_PATH, {
    logging: DB_LOG ? console.log : null,
  })

  const User = initializeUser(sequelize)
  const Message = initializeMessage(sequelize)

  // TODO: Later this becomes a Message to Chat relationship!
  User.hasMany(Message)
  Message.hasOne(User)

  sequelize.sync() // TODO: remove this

  return {
    sequelize,
    User,
    Message,
  }
}

module.exports = initializeDb()

