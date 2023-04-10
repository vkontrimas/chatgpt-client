const { DataTypes } = require('sequelize')
const sequelize = require('./sequelize')

const Message = sequelize.define('Message', {
  chat: {
    // TODO: Chat id
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
})

module.exports = Message
