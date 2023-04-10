const { DataTypes } = require('sequelize')
const sequelize = require('./sequelize')

const Chat = sequelize.define('Chat', {
  user: {
    // TODO: User ID
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
})

module.exports =  Chat 
