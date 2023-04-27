'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameColumn('RegistrationCodeUses', 'id', 'UserId')
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.renameColumn('RegistrationCodeUses', 'UserId', 'id')
  }
};
