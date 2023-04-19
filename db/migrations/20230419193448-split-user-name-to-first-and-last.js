'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameColumn('Users', 'name', 'firstName')
    await queryInterface.addColumn('Users', 'lastName', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: '',
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.renameColumn('Users', 'firstName', 'name')
    await queryInterface.removeColumn('Users', 'lastName')
  }
};
