const sequelize = require('../db/sequelize')
const User = require('../db/user')

const initializeDB = async () => {
  await sequelize.sync()
}

const wipeDB = async () => {
  await sequelize.drop()
}

module.exports = {
  initializeDB,
  wipeDB
}
