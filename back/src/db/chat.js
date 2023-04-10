const { DataTypes } = require('sequelize')

module.exports = (sql) => sql.define('Chat', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
})
