const { Sequelize } = require('sequelize')
const { getEnvironmentDBPath, DB_LOG, ENVIRONMENT } = require('../config')

const initializeUser = require('./user')
const { initializeMessage, MessageType } = require('./message')
const initializeRegistrationCode = require('./registration_code')

const connectProd = () => new Sequelize(
  getEnvironmentDBPath(), 
  {
    logging: DB_LOG ? console.log : null,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      }
    }
  }
)

const connectLocal = () => new Sequelize(
  getEnvironmentDBPath(), 
  { logging: DB_LOG ? console.log : null, }
)

const initializeDb = () => {
  const sequelize = ENVIRONMENT === 'production' ? connectProd() : connectLocal()
  const User = initializeUser(sequelize)
  const Message = initializeMessage(sequelize)

  // TODO: Later this becomes a Message to Chat relationship!
  User.hasMany(Message)
  Message.hasOne(User)

  const RegistrationCode = initializeRegistrationCode(sequelize)

  // Semantically the user belongs to one but sequelize doesn't have a way to express this
  // TODO: enforce one user per code use
  const registrationCodeJunctionTable = 'RegistrationCodeUses'
  User.belongsToMany(RegistrationCode, { through: registrationCodeJunctionTable })
  RegistrationCode.belongsToMany(User, { through: registrationCodeJunctionTable })

  // sequelize.sync()

  return {
    sequelize,
    User,
    Message,
    RegistrationCode,
  }
}

module.exports = initializeDb()

