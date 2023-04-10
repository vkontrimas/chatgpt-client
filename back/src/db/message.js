const { DataTypes } = require('sequelize')
const sequelize = require('./sequelize')

const Message = sequelize.define('Message', {
  chat: {
    // TODO: Chat id
  },
  inProgress: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    // default should be false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
})

module.exports = Message
