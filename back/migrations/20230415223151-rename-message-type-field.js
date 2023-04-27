'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameColumn('Messages', 'type', 'role')
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.renameColumn('Messages', 'role', 'type')
  }
};
