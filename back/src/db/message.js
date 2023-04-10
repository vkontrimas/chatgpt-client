const { DataTypes } = require('sequelize')

module.exports = (sql) => sql.define('Message', {
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
