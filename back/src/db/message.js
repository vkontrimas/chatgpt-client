const { DataTypes } = require('sequelize')

const MessageType = {
  USER: "user",
  ASSISTANT: "assistant",
}

const initializeMessage = (sql) => sql.define('Message', {
  type: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
})

module.exports = {
  MessageType,
  initializeMessage,
}
