const { Sequelize } = require('sequelize')
const { DB_PATH } = require('../config')

const sequelize = new Sequelize(DB_PATH)

module.exports = sequelize

