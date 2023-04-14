'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'RegistrationCodes', 'note',
      {
        type: Sequelize.TEXT,
        allowNull: true,
      }
    )
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('RegistrationCodes', 'note')
  }
};
