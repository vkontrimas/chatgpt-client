const { DataTypes } = require('sequelize')

module.exports = (sql) => sql.define('RegistrationCode', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  remainingUses: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
})
