'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RegistrationCodeUse extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) { }
  }
  RegistrationCodeUse.init({
    UserId: {
      type: DataTypes.UUID,
      primaryKey: true,
      references: {
        model: 'User',
        key: 'id',
      },
    },
    RegistrationCodeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'RegistrationCode',
        key: 'id',
      },
    }
  }, {
    sequelize,
    modelName: 'RegistrationCodeUse',
  });
  return RegistrationCodeUse;
};
