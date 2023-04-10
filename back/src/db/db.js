const { Sequelize } = require('sequelize')
const { DB_PATH, DB_LOG } = require('../config')

const initializeUser = require('./user')

const initializeDb = () => {
  const sequelize = new Sequelize(DB_PATH, {
    logging: DB_LOG ? console.log : null,
  })

  const User = initializeUser(sequelize)

  sequelize.sync() // TODO: remove this

  return {
    sequelize,
    User,
  }
}

module.exports = initializeDb()

