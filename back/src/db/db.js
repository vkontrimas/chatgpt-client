const { Sequelize } = require('sequelize')
const { DB_PATH, DB_LOG } = require('../config')

const initializeUser = require('./user')
const initializeChat = require('./chat')
const initializeMessage = require('./message')

const initializeDb = () => {
  const sequelize = new Sequelize(DB_PATH, {
    logging: DB_LOG ? console.log : null,
  })

  const User = initializeUser(sequelize)
  const Chat = initializeChat(sequelize)
  const Message = initializeMessage(sequelize)

  User.hasMany(Chat)
  Chat.belongsTo(User)

  Chat.hasMany(Message)
  Message.belongsTo(Chat)

  User.hasMany(Message)
  Message.belongsTo(User)

  sequelize.sync() // TODO: remove this

  return {
    sequelize,
    User,
    Chat,
    Message
  }
}

module.exports = initializeDb()

