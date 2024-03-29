'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.User.hasMany(Chat)
      Chat.belongsTo(models.User)
    }
  }
  Chat.init({
    title: DataTypes.TEXT,
    aiModelName: DataTypes.STRING,
    aiModelConfig: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Chat',
  });
  return Chat;
};
