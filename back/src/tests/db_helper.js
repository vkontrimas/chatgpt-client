const sequelize = require('../db/sequelize')
const User = require('../db/user')

const initializeDB = () => {
  sequelize.sync()
}

module.exports = {
  initializeDB,
}
