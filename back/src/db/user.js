const { DataTypes } = require('sequelize')
const sequelize = require('./sequelize')

const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
  },
})

module.exports = User
