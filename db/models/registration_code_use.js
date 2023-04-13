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
    static associate(models) {
      models.User.hasOne(RegistrationCodeUse)
      RegistrationCodeUse.belongsTo(models.User)

      models.RegistrationCode.hasMany(RegistrationCodeUse)
      RegistrationCodeUse.belongsTo(models.RegistrationCodeUse)
    }
  }
  RegistrationCodeUse.init({
    RegistrationCodeId: DataTypes.UUID,
  }, {
    sequelize,
    modelName: 'RegistrationCodeUse',
  });
  return RegistrationCodeUse;
};
