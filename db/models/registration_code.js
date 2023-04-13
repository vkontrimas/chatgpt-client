'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RegistrationCode extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  RegistrationCode.init({
    remainingUses: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'RegistrationCode',
  });
  return RegistrationCode;
};
